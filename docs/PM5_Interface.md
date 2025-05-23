# Description of the PM5 interface

The design goal is to emulate PM5 communication sufficiently for EXR, ErgZone, KinoMap, Aviron, Ergatta, Peleton, FIT, MyRow, Hydrow, Armada, ErgWorld, ErgDude, BoatCoach and Ergometer space. It explicitly is **NOT** to completely emulate a full-blown PM5 with racing features or logbook verification. Also features that might lead to cheating or uploading results to the Concept2 logbook are explicitly excluded. We aim to have maximum compatibility with beformentioned apps. We do test on ErgData, as that is the definitive source how Concept2's data is to be interpreted, excluding interpretation errors by independent software developers.

This interface emulation is partially based on the description in Concept 2's API documentation ([[1]](#1) and [[2]](#2)). As this documentation is inconclusive about the timing/triggers for messages, as well as the exact definition of the values used, a large part is also based on analysis of the communication via recorded bluetooth traces with current PM5's.

## Structural differences

### Workout Hierarchy

OpenRowingMonitor recognizes three levels in a workout: the Session, the underlying Intervals and the Splits in these Intervals (see (the architecture document)[./Architecture.md#session-interval-and-split-boundaries-in-sessionmanagerjs] for a more detailed description). A PM5 recognizes either a workout with one or more Intervals of varying length, or a single workout with several underlying splits with identical length. Some apps (ErgZone) even optimize workouts with multiple identical intervals to a workout with splits.

The [CsafeManagerService.js](../app/peripherals/ble/pm5/csafe-service/CsafeManagerService.js) therefore will map:

* a fixed time/distance PM5 workout to a single OpenRowingMonitor Interval, and add the specified splits as OpenRowingMonitor splits if specified.
* A PM5 workout with multiple intervals to multiple OpenRowingMonitor Intervals, without any splits specified (as they can't be specified by the PM5).

This makes scoping of many variables challenging as it is unclear whether a variable is intended to capture a split or the interval. Concept2's ambiguous description of most variables in [[1]](#1) and [[2]](#2) does not provide any clarification here.

[workoutSegment.js](../app/engine/utils/workoutSegment.js)'s default behaviour with missing split information helps here to overcome the structural issues. When split nformation is mising, it 'inherits' the split parameters of the above interval (in essence making the split boundaries identical to the interval). This makes the splits always contain the most granular division of the workout regardless of how the PM5 has communicated the workout. In reporting back to the app, the splits are thus the most likely basis for reporting in the PM5 emulated reporting. However, some variables seem to be scoped to the interval or workout level. A key reason for conducting the traces is to understand the scoping of each variable.

### Positioning rest intervals

OpenRowingMonitor treats rest intervals similar to normal time based intervals, with the exception that the rowing engine is forced to stop collecting metrics during that interval. A PM5 considers a rest interval an attribute of a normal interval, and it isn't an independent entity. In [CsafeManagerService.js](../app/peripherals/ble/pm5/csafe-service/CsafeManagerService.js) this is managed by adding a rest interval to OpenRowingMonitor's workout schedule.

In reporting, we indeed see the PM5 skipping the split/interval reporting when the pause starts, and including the rest data with the split reporting after the pause has ended. This is consistent with the approach that a rest interval only is an extension of an active interval. In OpenRowingMonitor this behaviour is replicated by not reporting the start of a pause as new split, and combining the data from the active split and the rest split. Although the underlying datasets are largely disjunct (as rest intervals have little data associated with them), a key issue is the reporting of the IntervalType, WorkoutState and workoutDurationType in [0x0031 General Status](#0x0031-general-status), and the intervalType [0x0037 "Split Data"](#0x0037-split-data). 

In starting a pause our traces show that message [0x0031 General Status](#0x0031-general-status)'s 'IntervalType' is set from `IntervalTypes.INTERVALTYPE_DIST` to `IntervalTypes.INTERVALTYPE_REST`. [0x0037 "Split Data"](#0x0037-split-data)'s 'IntervalType' reports an `IntervalTypes.INTERVALTYPE_DIST`. For the GeneralStatus message, the workout target clearly contains an element of OpenRowingMonitor's 'sessionState' object (i.e. verify if the sessionState is paused).

## Message grouping and timing

Based on the Bluetooth trace we can group the messages as well as identify their trigger. This grouping is implemented in the [Pm5RowingService.js](../app/peripherals/ble/pm5/rowing-service/Pm5RowingService.js).

### Time driven status updates

On every broadcast interval, the following messages are sent:

* [0x0031 "General Status"](#0x0031-general-status),
* [0x0032 "Additional Status"](#0x0032-additional-status),
* [0x0033 "Additional Status 2"](#0x0033--additional-status-2)
* [0x003e "Additional Status 3"](#0x003e-additional-status-3)

### Event Driven messages

#### End of the drive

* [0x0035 "Stroke Data"](#0x0035-stroke-data)
* [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data)
* [0x003d "Force Curve data"](#0x003d-force-curve-data)

#### End of the recovery

* [0x0035 "Stroke Data"](#0x0035-stroke-data)

#### End of Split

* [0x0037 Split Data](#0x0037-split-data)
* [0x0038 Additional Split Data](#0x0038-additional-split-data)

#### End of Workout

* 0x0039 Workout Summery
* 0x003a Additional Workout Summary
* 0x003f Logged Workout

### Pause behaviour

#### Entering a rest interval

When antering a rest interval, no specific messages are sent. However, our trace shows that:

* message [0x0031 General Status](#0x0031-general-status)'s 'IntervalType' is set from `IntervalTypes.INTERVALTYPE_DIST` to `IntervalTypes.INTERVALTYPE_REST`. This element thus should depend on the OpenRowingMonitor's 'sessionState' object.
* message [0x0031 General Status](#0x0031-general-status)'s 'WorkoutState' is set from `WorkoutState.WORKOUTSTATE_INTERVALWORKDISTANCE` to `WorkoutState.WORKOUTSTATE_INTERVALREST`.
* message [0x0031 General Status](#0x0031-general-status)'s 'totalWorkDistance' is increased with the total linear distanceof the ative interval. This suggests that the totalWorkDistance is the absolute startpoint that is maintained in the WorkoutSegment.
* message [0x0032 "Additional Status"](#0x0032-additional-status)'s 'Rest Time' will start counting down from its starting point to 0. 

#### Time behaviour during rest interval

The "Elapsed Time" is stopped counting.

#### Interval numbering during rest interval

Despite being entered on apps as an attribute of an interval, the PM5 reports a rest period as an independent interval. As soon as the rest interval starts, the interval number is increased and the previous split time and distance are transferred to their respected fields.

#### Exiting a rest interval

When exiting a rest interval, a lot of messages are sent:

* [0x0035 "Stroke Data"](#0x0035-stroke-data), with essentially all values set to 0
* [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data), with essentially all values set to 0
* [0x0031 "General Status"](#0x0031-general-status)
* [0x0032 "Additional Status"](#0x0032-additional-status)
* [0x0033 "Additional Status 2"](#0x0033--additional-status-2)
* [0x003e "Additional Status 3"](#0x003e-additional-status-3)
* [0x0037 "Split Data"](#0x0037-split-data)
* [0x0038 "Additional Split Data"](#0x0038-additional-split-data)

## Specific field behaviour

### Elapsed time

According to the documentation ([[1]](#1) and [[2]](#2)), messages [0x0031 "General Status"](#0x0031-general-status), [0x0032 "Additional Status"](#0x0032-additional-status), [0x0033  "Additional Status 2"](#0x0033--additional-status-2), [0x0035 "Stroke Data"](#0x0035-stroke-data), [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data), [0x0037 "Split Data"](#0x0037-split-data) and [0x0038 "Additional Split Data"](#0x0038-additional-split-data) all contain the 24 bit element "Elapsed Time", with a 0.01 second precission. 

The recorded Bluetooth trace shows that:

* the timer isn't active before any movement has commenced, defaults and starts at 0
* The timer is stopped as soon as the session is paused. This suggests that this is based on 'moving time', and not 'absolute time'
* At an interval rollover, this timer is reset to zero,
* At a split rollover, the timer is **NOT** reset but continues.

Thus, this is best mapped to `metrics.interval.timeSpent.moving`.

### Distance

Similar to Elapsed time, messages [0x0031 "General Status"](#0x0031-general-status), [0x0035 "Stroke Data"](#0x0035-stroke-data) and contain [0x0037 "Split Data"](#0x0037-split-data) the 24 bit element "Distance", with a 0.1 meter precission. We also see

* the distance isn't active before any movement has commenced, defaults and starts at 0
* distance being fixed in a pause
* distance is reset upon crossing the interval boundary
* distance continues when crossing a split boundary

Thus, this is best mapped to `metrics.interval.distance.fromStart`.

### Stroke numbering

The messages [0x0035 "Stroke Data"](#0x0035-stroke-data) and [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data) contain the stroke number, which behaves as follows:

* restarts at the end of an interval
* continues when crossing a split

Thus, this is best mapped to `metrics.interval.numberOfStrokes`.

### Split numbering

Messages [0x0033 "Additional Status 2"](#0x0033--additional-status-2), [0x0037 "Split Data"](#0x0037-split-data), [0x0038 "Additional Split Data"](#0x0038-additional-split-data) contain the `interval count`. It:

* initializes at 0,
* is increased when either the split/interval changes,
* is increased when moving from an active to a rest interval

Message 0x003A "Additional Workout Summary" contains the total number of intervals

## Messages

### Time based status messages

#### 0x0031 "General Status"

Messsage 0x0031 "General Status" is implemented in [GeneralStatusCharacteristic.js](../app/peripherals/ble/pm5/rowing-service/status-characteristics/GeneralStatusCharacteristic.js). Some notes:

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`
* As described in [distance](#distance)), `distance` will be mapped to `metrics.interval.distance.fromStart`
* The `Workout state`
  * starts at `WorkoutState.WORKOUTSTATE_WAITTOBEGIN`,
  * changes to `WorkoutState.WORKOUTSTATE_WORKOUTROW` for an active fixed time/distance workout with splits,
  * changes to `WorkoutState.WORKOUTSTATE_INTERVALWORKDISTANCE` for an active distance based interval that is part of a multi-interval session
  * changes to `WorkoutState.WORKOUTSTATE_INTERVALWORKDISTANCETOREST` for marking the transition from an active interval to a rest interval
  * changes to `WorkoutState.WORKOUTSTATE_INTERVALREST` for a rest split/interval
  * changes to `WorkoutState.WORKOUTSTATE_WORKOUTEND` for marking the end of the workout
* The `Total work distance` is initialized at 0, and only increased at the end of the interval to reflect the total linear distance travelled so far by the previous intervals. This is best represented by `metrics.interval.distance.absoluteStart`
* The `Workout Duration` is set to the intended length of the current interval (thus ignoring previous interval lengths). When it is a 'distance' based interval, it is the length in meters, captured by `metrics.interval.distance.target`. On a 'time' based interval, it is a time in 0.01sec precission, best reflected by `metrics.interval.movingTime.target`.
* When the `interval type` is 'time', the difference between `workout duration` and `elapsed time` is shown on ErgData as a countdown timer on most screens. When the `interval type` is 'distance' the difference between `workout duration` and `distance` is shown on ErgData as a countdown timer. So, typically, these fields must have the same frame of reference (i.e. time/distance in interval and interval target)
* Dragfactor is reset per interval

#### 0x0032 "Additional Status"

[0x0032 "Additional Status"](../app/peripherals/ble/pm5/rowing-service/status-characteristics/AdditionalStatusCharacteristic.js),

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`

#### 0x0033  "Additional Status 2"

See the implementation here: [0x0033  "Additional Status 2"](../app/peripherals/ble/pm5/rowing-service/status-characteristics/AdditionalStatus2Characteristic.js),

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`
* As descibed in [Interval count](#split-numbering), the `interval count` will be mapped to `metrics.split.number`
* `Split average power` is initialized at 0
* `Total calories` is initialized at 0, and increases across splits, but is reset to 0 at interval rollovers, this suggests it is scoped at the interval.
* The specifications ([[1]](#1) and [[2]](#2)) contain an error. The `Last Split Time` element has an accuracy of 0.01 seconds, similar to the `Elapsed Time` data element, instead of the described 0.1 sec accuracy. `Last Split Time` will be initialised at 0, and after each split transition is updated to contain the final time of the last split for 'distance' based splits.
* The `Last split distance` is initialized at 0, and remains 0 for distance based splits.

#### 0x003e "Additional Status 3"

### Interupt driven stroke state messages

#### 0x0035 "Stroke Data"

[0x0035 "Stroke Data"](../app/peripherals/ble/pm5/rowing-service/other-characteristics/StrokeDataCharacteristic.js) is sent at the end of both the drive and the recovery

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`
* As described in [distance](#distance)), `distance` will be mapped to `metrics.interval.distance.fromStart`

#### 0x0036 "Additional Stroke Data"

[0x0036 "Additional Stroke Data"](../app/peripherals/ble/pm5/rowing-service/other-characteristics/AdditionalStrokeDataCharacteristic.js) is only sent at the end of the drive

#### 0x003d "Force Curve data"

The force curve is in pounds (lbs).

### Interupt driven split messages

#### 0x0037 "Split Data"

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`
* As described in [distance](#distance)), `distance` will be mapped to `metrics.interval.distance.fromStart`

#### 0x0038 "Additional Split Data"

* As described in [elapsed time](#elapsed-time), `Elapsed time` will be mapped to `metrics.interval.timeSpent.moving`

#### 0x0039 "Workout Summery"

#### 0x003A "Additional Workout Summary"

#### 0x003f "Logged Workout"

## References

<a id="1">[1]</a> Concept 2 PM5 Bluetooth Smart Interface Specification, Revision 1.30, 3/2/2022 <https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf>

<a id="2">[2]</a> Concept2 PM CSAFE Communication Definition, Revision 0.27, 8/8/2023 <https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf>
