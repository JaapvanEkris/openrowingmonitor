# From 0.8.4 to 0.9.0 (January 2024)

## New functionality:

- Added support for ANT+ rowing metrics broadcast
- Allow the user to change the GUI layout and metrics, including displaying the force curve
- Allow user to turn on or off ANT+ and BLE functionality and dynamically switch between ANT+ and BLE HR monitors from the GUI
- Added the option for more complex workouts, as a hook for the PM5 and webinterface (these are a ToDo where the PM5 workout interface is still in development)
- Added reporting of PM5 Interval-types to the PM5

## Added some bugfixes/robustness improvements:

- Added a configuration sanity check which logs obvious errors and (if possible) repairs settings, after several users messed up their config and got completely stuck.
- The configuration sanity check also provides an automated upgrade path for 0.8.3 (old config) users to 0.9.0 (new config), as all the newly added configuration items between these two versions are automatically detected, logged and repaired.
- Added restart limits to prevent infinite boot loops of the app crashing and rebooting when there is a config error
- Fixed the GPIO tick rollover, which led to a minor hickup in data in rows over 30 minutes
- Made Flywheel.js more robust against faulty GPIO data
- Fixed an application crash in the RowingData generation when the target directory doesn't exist yet
- Improved the structure of the peripherals to allow a more robust BLE and ANT use
- Improved the accuracy, responsiveness and efficiency of both the Linear and Quadratic the Theil-Sen algorithms. For larger 'flankLength' machines, this will result in 50% reduction in CPU use, while increasing the responsiveness and accuracy of the forcecurve and powercurve.
- Drag calculation and recovery slope calculation are now down with Linear Theil-Sen algorithm, making this calculation more robust against outliers

# From 0.8.2 to 0.8.4 (January 2023)

## New Functionality

This new version brought some major changes to the rowing engine:

- Totally renewed rowing engine: Linear and Quadratic Regression models are now the core of the rowing engine. This model is much more robust against noise, and thus removing the need for any noise filtering from OpenRowingMonitor or any of the known rowers. In the over 1000 kilometers of testing, it has proven to work extremely reliable and robust;
- Simpler set-up: I had the explicit aim to get a better out-of-the-box experience for new users. I tried to trim the number of required settings, and for many cases I’ve succeeded: several settings are brought down to their key elements (like a minimal handle force, which can be set more easily fror all rowers) or can be told by looking at the logs (like the recovery slope). For several other settings, their need to set them perfectly has been reduced, requiring less tweaking before Open Rowing Monitor starts producing good data. To support this, there also is a new setup document, to help users set up their own rower;
- New Metrics: Force curve, Peak force, average force, power curve, handle speed curve, VO2Max (early beta), Heart Rate Recovery. All have over 1000 kilometers of testing under their belt, and have sown to work reliably;
- New export format: There is a RowingData export, which can export all metrics in .csv, which is accepted by both RowingData and RowsAndAll. It is also useable for users to read their data into Excel. This export brings the force curve to users, although it will require a small subscription to see it;
- Finite State Machine based state management: OpenRowingEngine will now maintain an explicit state for the rower, and RowingStatistics will maintain an explicit state for the session. Aside reducing the code complexity significantly, it greatly impoved robustness.
- An initial stub for session mangement: As a first step towards sessions and splits, a session object in Server.js is added as a placeholder for session targets. If unfilled, the code will act as in version 0.8.4: you can row without any limitations. If a target is set, it will termintate the session at the exact right time. As is with the PM5, ORM counts down if a target is set. The current stub isn't ideal yet, as we want the user to be able to set these targets through the webGUI or through BLE. However, it is a first step towards functional completeness as it lays a preliminary foundation for such functionality.
- Improved metrics through BLE: Based on the new engine, I have added many metrics in both FTMS Rower and PM5, making it as complete as it can be. Most metrics also have over a 1000 km of testing with EXR, and both types of interface have been used with EXR intensly. I also added an additional configuration parameter for the BLE-interface, its updateinterval. Although the default of 1000ms is good, EXR likes a higher frequency and it works better if the interval is much shorter.
- Improved logging: the logging has been more focussed on helping the user fix a bad setting. I removed several metrics, but added several others as they tell much more about the underlying state of the engine and its settings (for example the drive time and drive length). Goal is to have users be able to tune their engine based on the log.
- Switch to 64Bit: ORM supports the 64 Bit core, which has a PREEEMPT-kernel. The setup-script accepts this as well, as this should be the preferred kernel to use. The PREEMPT-kernel is optimized for low latency measurements, like IoT applications. As PREEMPT kernels can handle a lot higher priority for the GPIO-thread, this setting has been switched from a binary setting to a priority setting.

#From 0.8.1 to 0.8.2 (Febuary 2022)
- Added Strava support

#From 0.8.0 to 0.8.1 (Febuary 2022)
- Refactoring of the Rowing Engine, as [Dave Vernooy's engine (ErgWare)](https://dvernooy.github.io/projects/ergware/) is good, but its variable naming leaves a bit to be desired.
