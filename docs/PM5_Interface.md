# Description of the PM5 interface

The design goal is to emulate PM5 communication sufficiently for EXR, ErgZone, KinoMap, Aviron, Ergatta, Peleton, FIT, MyRow, Hydrow, Armada, ErgWorld, ErgDude, BoatCoach and Ergometer space. It is *NOT* to completely emulate a full-blown PM5 with racing features or logbook verification.

This is based on the description in Concept 2's design documentation, as well based on recorded traces of bluetooth communication with current PM5's.

## Structural differences

### Workout Hierarchy

OpenRowingMonitor recognizes three levels in a workout: the Session, the underlying Intervals and the Splits in these Intervals. A PM5 recognizes either a workout with one or more Intervals of varying length, or a single workout with several underlying splits.

The [CsafeManagerService.js](../app/peripherals/ble/pm5/csafe-service/CsafeManagerService.js) therefore will map:

* a fixed time/distance PM5 workout to a single OpenRowingMonitor Interval, and add the specified splits as OpenRowingMonitor splits if specified.
* A PM5 workout with multiple intervals to multiple OpenRowingMonitor Intervals, without any splits specified (as they can't be specified by the PM5).

[workoutSegment.js](../app/engine/utils/workoutSegment.js)'s default behaviour with missing split information is to 'inherit' the split parameters of the above interval (in essence making the split boundaries identical to the interval). This makes the splits always contain the most granular division of the workout regardless of how the PM5 has communicated the workout. In reporting back to the app, the splits are thus the basis for reporting in the PM5 emulated reporting.

### Positioning rest intervals

OpenRowingMonitor treats rest intervals similar to normal time based intervals, with the exception that the rowing engine is forced to stop collecting metrics during that interval. A PM5 considers a rest interval an attribute of a normal interval, and it isn't an independent entity. In [CsafeManagerService.js](../app/peripherals/ble/pm5/csafe-service/CsafeManagerService.js) this is managed by adding a rest interval to OpenRowingMonitor's workout schedule. In reporting, this pause will be reported as an interval with only a rest specified.

### Message grouping and timing


## Interpretation of fields

### Elapsed time

According to the documentation ([[1]](#1) and [[2]](#2)), messages [0x0031 "General Status"](../app/peripherals/ble/pm5/rowing-service/status-characteristics/GeneralStatusCharacteristic.js), [0x0032 "Additional Status"](../app/peripherals/ble/pm5/rowing-service/status-characteristics/AdditionalStatusCharacteristic.js), [0x0033  "Additional Status 2"](../app/peripherals/ble/pm5/rowing-service/status-characteristics/AdditionalStatus2Characteristic.js), [0x0035 "Stroke Data"](../app/peripherals/ble/pm5/rowing-service/other-characteristics/StrokeDataCharacteristic.js), [0x0036 "Additional Stroke Data"](../app/peripherals/ble/pm5/rowing-service/other-characteristics/AdditionalStrokeDataCharacteristic.js) all contain the 24 bit element "Elapsed Time", with a 0.01 second precission. 

The recorded Bluetooth trace shows that:

* the timer is already active before any movement
* The timer is stopped as soon as it is paused
* at an interval change, this timer is reset to zero

## References

<a id="1">[1]</a> Concept 2 PM5 Bluetooth Smart Interface Specification, Revision 1.30, 3/2/2022 <https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf>

<a id="2">[2]</a> Concept2 PM CSAFE Communication Definition, Revision 0.27, 8/8/2023 <https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf>
