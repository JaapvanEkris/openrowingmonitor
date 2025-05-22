# Description of the PM5 interface

The design goal is to emulate PM5 communication sufficiently for EXR, ErgZone, KinoMap, Aviron, Ergatta, Peleton, FIT, MyRow, Hydrow, Armada, ErgWorld, ErgDude, BoatCoach and Ergometer space. It explicitly is **NOT** to completely emulate a full-blown PM5 with racing features or logbook verification. Also features that might lead to cheating or uploading results to the Concept2 logbook are explicitly excluded. We aim to have maximum compatibility with beformentioned apps. We do test on ErgData, as that is the definitive source how Concept2's data is to be interpreted, excluding interpretation errors by independent software developers.

This interface emulation is partially based on the description in Concept 2's API documentation ([[1]](#1) and [[2]](#2)). As this documentation is inconclusive about the timing/triggers for messages, as well as the exact definition of the values used, a large part is also based on analysis of the communication via recorded bluetooth traces with current PM5's.

## Structural differences

### Workout Hierarchy

OpenRowingMonitor recognizes three levels in a workout: the Session, the underlying Intervals and the Splits in these Intervals. A PM5 recognizes either a workout with one or more Intervals of varying length, or a single workout with several underlying splits with identical length. Some apps (ErgZone) even optimize workouts with multiple identical intervals to a workout with splits.

The [CsafeManagerService.js](../app/peripherals/ble/pm5/csafe-service/CsafeManagerService.js) therefore will map:

* a fixed time/distance PM5 workout to a single OpenRowingMonitor Interval, and add the specified splits as OpenRowingMonitor splits if specified.
* A PM5 workout with multiple intervals to multiple OpenRowingMonitor Intervals, without any splits specified (as they can't be specified by the PM5).

[workoutSegment.js](../app/engine/utils/workoutSegment.js)'s default behaviour with missing split information is to 'inherit' the split parameters of the above interval (in essence making the split boundaries identical to the interval). This makes the splits always contain the most granular division of the workout regardless of how the PM5 has communicated the workout. In reporting back to the app, the splits are thus the basis for reporting in the PM5 emulated reporting.

### Positioning rest intervals

OpenRowingMonitor treats rest intervals similar to normal time based intervals, with the exception that the rowing engine is forced to stop collecting metrics during that interval. A PM5 considers a rest interval an attribute of a normal interval, and it isn't an independent entity. In [CsafeManagerService.js](../app/peripherals/ble/pm5/csafe-service/CsafeManagerService.js) this is managed by adding a rest interval to OpenRowingMonitor's workout schedule.

In reporting, we indeed see the PM5 skipping the split/interval reporting when the pause starts, and including the rest data with the split reporting after the pause has ended. This is consistent with the approach that a rest interval only is an extension of an active interval. In OpenRowingMonitor this behaviour is replicated by not reporting the start of a pause as new split, and combining the data from the active split and the rest split. Although the underlying datasets are largely disjunct (as rest intervals have little data associated with them), a key issue is the reporting of the IntervalType, WorkoutState and workoutDurationType in [0x0031 General Status](#0x0031-general-status), and the intervalType [0x0037 "Split Data"](#0x0037-split-data). 

In starting a pause our traces show that message [0x0031 General Status](#0x0031-general-status)'s 'IntervalType' is set from `IntervalTypes.INTERVALTYPE_DIST` to `IntervalTypes.INTERVALTYPE_REST`. [0x0037 "Split Data"](#0x0037-split-data)'s 'IntervalType' reports an `IntervalTypes.INTERVALTYPE_DIST`. For the GeneralStatus message, the workout target clearly contains an element of OpenRowingMonitor's 'sessionState' object (i.e. verify if the sessionState is paused).

### Message grouping and timing

Based on the Bluetooth trace we can group the messages as well as identify their trigger. This grouping is implemented in the [Pm5RowingService.js](../app/peripherals/ble/pm5/rowing-service/Pm5RowingService.js).

#### Time driven status updates

On every broadcast interval, the following messages are sent:

* [0x0031 "General Status"](#0x0031-general-status),
* [0x0032 "Additional Status"](#0x0032-additional-status),
* [0x0033 "Additional Status 2"](#0x0033--additional-status-2)
* [0x003e "Additional Status 3"](#0x003e-additional-status-3)

#### Event Driven messages

##### End of the drive

* [0x0035 "Stroke Data"](#0x0035-stroke-data)
* [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data)
* [0x003d "Force Curve data"](#0x003d-force-curve-data)

##### End of the recovery

* [0x0035 "Stroke Data"](#0x0035-stroke-data)
* [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data)
* [0x003d "Force Curve data"](#0x003d-force-curve-data)

##### End of Split

* [0x0037 Split Data](#0x0037-split-data)
* [0x0038 Additional Split Data](#0x0038-additional-split-data)

##### End of Workout

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

### Specific field behaviour

#### Elapsed time

According to the documentation ([[1]](#1) and [[2]](#2)), messages [0x0031 "General Status"](#0x0031-general-status), [0x0032 "Additional Status"](#0x0032-additional-status), [0x0033  "Additional Status 2"](#0x0033--additional-status-2), [0x0035 "Stroke Data"](#0x0035-stroke-data), [0x0036 "Additional Stroke Data"](#0x0036-additional-stroke-data), [0x0037 "Split Data"](#0x0037-split-data) and [0x0038 "Additional Split Data"](#0x0038-additional-split-data) all contain the 24 bit element "Elapsed Time", with a 0.01 second precission. 

The recorded Bluetooth trace shows that:

* the timer is already active before any movement has commenced, although tests suggests that it can be left to zero until rowing commences for all apps.
* The timer is stopped as soon as the session is paused
* at an interval change, this timer is reset to zero

Thus, this is best mapped to metrics.interval.timeSpent.moving

### Distance

Similar to Elapsed time, messages [0x0031 "General Status"](#0x0031-general-status), [0x0035 "Stroke Data"](#0x0035-stroke-data) and contain [0x0037 "Split Data"](#0x0037-split-data) the 24 bit element "Distance", with a 0.1 meter precission. We also see distance being fixed in a pause and reset upon crossing the interval boundary. Thus, this is similar to metrics.interval.distance.fromStart.

### Interval numbering

Interval numbering changes when the split/interval changes, even when moving from an active to a rest interval. However, our trace shows it starts with 3.

### Stroke numbering

Stroke numbering restarts at the end of an interval

## Messages

### Time based status messages

#### 0x0031 "General Status"

Messsage 0x0031 "General Status" is implemented in [GeneralStatusCharacteristic.js](../app/peripherals/ble/pm5/rowing-service/status-characteristics/GeneralStatusCharacteristic.js). Some notes:

* Testing shows that at an interval change, the time and distance are reset (see [elapsed time](#elapsed-time) and [distance](#distance)). In a pause/rest, both time and distance are stopped and maintain the end position of the interval (see [pause behaviour](#pause-behaviour)).
* When the interval type is 'time' the difference between "workout duration" and "elapsed time" is shown on ErgData as a countdown timer on most screens. When the interval type is 'distance' the difference between "workout duration" and "distance" is shown on ErgData as a countdown timer. So, typically, these fields must have the same frame of reference (i.e. time/distance in interval and interval target)

#### 0x0032 "Additional Status"

[0x0032 "Additional Status"](../app/peripherals/ble/pm5/rowing-service/status-characteristics/AdditionalStatusCharacteristic.js),

#### 0x0033  "Additional Status 2"

[0x0033  "Additional Status 2"](../app/peripherals/ble/pm5/rowing-service/status-characteristics/AdditionalStatus2Characteristic.js),

The specifications ([[1]](#1) and [[2]](#2)) contain an error. The "Last Split Time" element has an accuracy of 0.01 seconds, similar to the "Elapsed Time" data element, instead of the described 0.1 sec accuracy.

#### 0x003e "Additional Status 3"



### Interupt driven stroke state messages

#### 0x0035 "Stroke Data"

[0x0035 "Stroke Data"](../app/peripherals/ble/pm5/rowing-service/other-characteristics/StrokeDataCharacteristic.js) is sent at the end of both the drive and the recovery

#### 0x0036 "Additional Stroke Data"

[0x0036 "Additional Stroke Data"](../app/peripherals/ble/pm5/rowing-service/other-characteristics/AdditionalStrokeDataCharacteristic.js) is only sent at the end of the drive

#### 0x003d "Force Curve data"

The force curve is in pounds (lbs).

### Interupt driven split messages

#### 0x0037 "Split Data"



#### 0x0038 "Additional Split Data"



## References

<a id="1">[1]</a> Concept 2 PM5 Bluetooth Smart Interface Specification, Revision 1.30, 3/2/2022 <https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf>

<a id="2">[2]</a> Concept2 PM CSAFE Communication Definition, Revision 0.27, 8/8/2023 <https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf>
