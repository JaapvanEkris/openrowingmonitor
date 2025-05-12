# Description of the PM5 interface

The design goal is to emulate PM5 communication sufficiently for EXR, ErgZone, KinoMap, Aviron, Ergatta, Peleton, FIT, MyRow, Hydrow, Armada, ErgWorld, ErgDude, BoatCoach and Ergometer space. It is *NOT* to completely emulate a full-blown PM5 with racing features or logbook verification.

This is based on the description in Concept 2's design documentation, as well based on recorded traces of bluetooth communication with current PM5's.

## Structural deifferences

### Workout Hierarchy

OpenRowingMonitor recognizes three levels in a workout: the Session, the underlying Intervals and the Splits in these Intervals. A PM5 recognizes either a workout with one or more Intervals of varying length, or a single interval with several underlying Splits. 

### Positioning rest intervals

OpenRowingMonitor treats rest intervals similar to normal time based intervals, with the exception that the rowing engine is forced to stop collecting metrics. A PM5 considers a rest interval an attribute of a normal interval.

### Message grouping and timing


## Interpretation of fields

### Elapsed time

## References

https://www.concept2.co.uk/files/pdf/us/monitors/PM5_BluetoothSmartInterfaceDefinition.pdf
https://www.concept2.co.uk/files/pdf/us/monitors/PM5_CSAFECommunicationDefinition.pdf
