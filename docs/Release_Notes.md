# OpenRowingMonitor Release Notes

## From 0.9.0 to 0.9.5 (February 2025)

Main contributors: [Jaap van Ekris](https://github.com/JaapvanEkris) and [Abasz](https://github.com/Abasz)

### New functionality in 0.9.5

- Added **FIT-File support**: you an now automatically generate a FIT-file after a rowing session, which alows for a more detailed reporting than the tcx-format, and is commonly accepted by most platforms
- **Introduction of the session manager**, which provides support for intervals, splits, rest intervals and spontanuous pauses in the session and also adds these to the FIT, tcx and RowingData recordings. Please note, setting predetermined intervals and splits in a user friendly way (via PM5 and webinterface) is still a ToDo that is intended for 1.0.0.
- **Improvement of Magnetic rower support**: the new session manager makes sure that the session is nicely stopped, even when the flywheel has stopped quite abruptly before pause timeouts have time to kick in. This is the case on some magnetic rowers which have an extreme high drag, resulting in very short spin down times of their flywheel.

### Bugfixes and robustness improvements in 0.9.5

- **Improvement of the architecture**: we cleaned up the old architecture and went to a more message bus structure where clients are responsible for listening to the datatransmissions they are interested in. See [the architecture description](Architecture.md) for a deep-dive of the implementation. Key benefit is that this is more maintainable as it allows serving data more easily to totally different clients (webGUI, recorders and BLE/ANT+) with totally different needs, making future enhancements easier.
- **Improvement of Bluetooth stability**: we moved away from abandonware's BLE NoBle/BleNo implementation and moved to stoprocent's implementation, as that package is better maintained and works better with newer installs of BlueZ, which should fix some issues on Raspberry Pi Bookworm. Unfortunatly, none of the NoBle/BleNo descendents are immune to some specific BlueZ issues (see known issues).
- **Performance improvement of the TS estimator**, further reducing CPU load, which significantly improves accuracy of the measurements and metrics as the Linux kernel has an easier job keeping the time accurate.
- **Removed a lot of memory leaks**, although only being problematic in large simulations (i.e. over 3000K), we want to keep our code to behave nice
- **Improved robustness of the stroke detection algorithm**
- **Validation of the engine against a PM5 for over 3000KM**, where the deviation is a maximum of 0.1%

### Known issues in 0.9.5

- **Bluetooth Heartrate can't be switched dynamically**: due to some underlying changes in the OS, BLE heartrate monitors can't be activated through the GUI without crashing the BLE metrics broadcast (see [the description of issue 69](https://github.com/JaapvanEkris/openrowingmonitor/issues/69)). As this is an issue in the OS, and all previous versions of OpenRowingMonitor are also affected by this issue. Version 0.9.5 has a workaround implemented that mitigates this at startup. So configuring the use of a BLE heartrate monitor in the config file should work.

## From 0.8.4 to 0.9.0 (January 2024)

Main contributors: [Jaap van Ekris](https://github.com/JaapvanEkris) and [Abasz](https://github.com/Abasz)

### New functionality in 0.9.0

- **Added support for ANT+ rowing metrics broadcast**
- **Allow the user to change the GUI layout and metrics**, including displaying the force curve and support for larger screens
- **Allow user to turn on or off ANT+ and BLE functionality** and dynamically switch between ANT+ and BLE HR monitors from the GUI
- **Added the option for more complex workouts**, as a hook for the PM5 and webinterface (these are partially a ToDo, as the PM5 workout interface is still in development)
- **Added reporting of PM5 Interval-types to the PM5**

### Bugfixes and robustness improvements in 0.9.0

- **Added support for the newest version of Raspberry Pi OS (Bookworm)**, moved from Node.js v16 (EOL) to Node.js v20 (current) and upgraded packages where possible.
- **Improved the accuracy, responsiveness and efficiency** of both the Linear and Quadratic Theil-Sen algorithms. For larger 'flankLength' machines, this results in 50% reduction in CPU use, while increasing the responsiveness and accuracy of the resulting forcecurve and powercurve.
- **Drag calculation and recovery slope calculation are more robust against outliers and stroke detection errors** by also moving them to the Linear Theil-Sen algorithm.
- **Added a configuration sanity check** which logs obvious errors and (if possible) repairs settings, after several users messed up their config and got completely stuck. This configuration sanity check also provides an automated upgrade path for 0.8.2 (old config) users to 0.9.0 (new config), as all the newly added configuration items between these two versions are automatically detected, logged and repaired.
- **Added restart limits** to prevent infinite boot loops of the app crashing and rebooting when there is a config error
- **Fixed the GPIO tick rollover**, which led to a minor hickup in data in rows over 30 minutes
- **Made Flywheel.js more robust** against faulty GPIO data
- **Fixed a lot of small memory leaks** which were to untidy closure of dynamic data structures. Although this wasn't encountered in regular training sessions, it did show in long simulations (over 10.000K);
- **Fixed an application crash** in the RowingData generation when the target directory doesn't exist yet;
- **Improved the structure of the peripherals** to allow a more robust BLE and ANT use
- **Validation of the engine against a PM5 for over 3000KM**, where the deviation is a maximum of 0.1%

### Removed support in 0.9.0

- **Support has been dropped for the Raspberry Pi Zero W**, as WebAssembly will not work on Node.js V16 on ArmV6, and other core packages require at least Node V18 to function on newer versions of the Raspberry Pi OS (see [this discussion](https://github.com/JaapvanEkris/openrowingmonitor/discussions/33))

## From 0.8.2 to 0.8.4 (January 2023)

Main contributors: [Jaap van Ekris](https://github.com/JaapvanEkris) and [Abasz](https://github.com/Abasz)

### New Functionality in 0.8.4

- **New Metrics**: With the new rowing engine, new metrics are introduced, including Force curve, Peak force, average force, power curve, handle speed curve, VO2Max (early beta), Heart Rate Recovery. All have over 1000 kilometers of testing under their belt, and have shown to work reliably;
- **Added Cycling Power Profile and Cycling Speed/Cadence bluetooth profiles** for compatibility with more smartwatches
- **Improved metrics through BLE FTMS and BLE C2-PM5**: Based on the new engine, many metrics are added to both FTMS Rower and PM5, making them as complete as they can be. Most metrics also have over a 1000 km of testing with EXR, and both types of interface have been used with EXR intensly.
- **New export format**: There is a RowingData export, which can export all metrics in .csv, which is accepted by both RowingData and RowsAndAll. It is also useable for users to read their data into Excel. This export brings the force curve to users, although it will require a small subscription to see it in RowsAndAll;
- **Simpler set-up**: a better out-of-the-box experience for new users. We trimmed the number of required settings, and for many cases we’ve succeeded: several settings are brought down to their key elements (like a minimal handle force, which can be set more easily for all rowers) or can be told by looking at the logs (like the recovery slope). For several other settings, their need to set them perfectly has been reduced, requiring less tweaking before OpenRowingMonitor starts producing good data. To support this, there also is a new setup document, to help users set up their own rower;
- **Switch to 64Bit**: OpenRowingMonitor supports the 64 Bit Lite core, which has a PREEEMPT-kernel. The setup-script accepts this as well, as this should be the preferred kernel to use. The PREEMPT-kernel is optimized for low latency measurements, like IoT applications. As PREEMPT kernels can handle a lot higher priority for the GPIO-thread, this setting has been switched from a binary setting to a priority setting.
- **An initial stub for session mangement**: As a first step towards sessions and splits, a session object in Server.js is added as a placeholder for session targets. If unfilled, the code will act as in version 0.8.2: you can row without any limitations. If a target is set, it will termintate the session at the exact right time. As is with the PM5, ORM counts down if a target is set. The current stub isn't ideal yet, as we want the user to be able to set these targets through the webGUI or through BLE. However, it is a first step towards functional completeness as it lays a preliminary foundation for such functionality.

### Bugfixes and robustness improvements in 0.8.4

- **Totally redesigned rowing engine**: Linear and Quadratic Regression models are now the core of the rowing engine, leaving the classical linear approximation model. The new model is much more robust against noise, and thus completely removing the need for any noise filtering from OpenRowingMonitor for any of the known rowers. In the over 1000 kilometers of testing, it has proven to work extremely reliable and robust;
- **Improved logging**: the logging has been more focussed on helping the user fix a bad setting. I removed several metrics, but added several others as they tell much more about the underlying state of the engine and its settings (for example the drive time and drive length). Goal is to have users be able to tune their engine based on the log.
- **Finite State Machine based state management**: OpenRowingEngine will now maintain an explicit state for the rower, and RowingStatistics will maintain an explicit state for the session. Aside reducing the code complexity significantly, it greatly impoved robustness.
- **Added a new GPIO-library**, making measurement of the flywheel data much more accurate and allowing to "debounce" the measurements, as many sensors have this issue

## From 0.8.1 to 0.8.2 (Febuary 2022)

Main contributor: [Lars Berning](https://github.com/laberning)

### New Functionality in 0.8.2

- Added Strava support

## From 0.8.0 to 0.8.1 (September 2021)

Main contributor: [Jaap van Ekris](https://github.com/JaapvanEkris)

### Bugfixes and robustness improvements in 0.8.1

- **Refactoring of the Rowing Engine**, as [Dave Vernooy's engine (ErgWare)](https://dvernooy.github.io/projects/ergware/) is good, but its variable naming left a bit to be desired. The underlying physics has been described in [the physics of OpenRowingMonitor](physics_openrowingmonitor.md), and is largely based on the work of [Dave Vernooy](https://dvernooy.github.io/projects/ergware/) and [Anu Dudhia](http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html).

## 0.7.0 (March 2021)

Initial release, Main contributor: [Lars Berning](https://github.com/laberning), porting of [Dave Vernooy's ErgWare](https://dvernooy.github.io/projects/ergware/) to JavaScript and addition of Bluetooth.
