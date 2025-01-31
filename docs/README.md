# OpenRowingMonitor

[![Node.js CI](https://github.com/JaapvanEkris/openrowingmonitor/actions/workflows/node.js.yml/badge.svg)](https://github.com/JaapvanEkris/openrowingmonitor/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/JaapvanEkris/openrowingmonitor/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/JaapvanEkris/openrowingmonitor/actions/workflows/codeql-analysis.yml)

<!-- markdownlint-disable-next-line no-inline-html -->
<img width="200" height="200" align="left" src="img/openrowingmonitor_icon.png" alt="OpenRowingMonitor logo" class="dropcap">

OpenRowingMonitor is a free and open source monitor for rowing machines. It allows you to upgrade any rowing machine into a smart trainer that can be used with training applications and games, making rowing much more fun and affordable!

It is an application that runs on relatively cheap hardware (a Raspberry Pi) to calculate rowing specific metrics, such as power, split time, speed, stroke rate, distance and calories. We like this data to be easily accessible, so you can share these metrics for controling games and record these metrics for further analysis to improve your rowing (or bragging rights).

OpenRowingMonitor runs fine on any rowing machine that uses some kind of damping mechanism, as long as you can add something to measure the speed of the flywheel, like magnets. It has already shown to work well with many DIY rowing machines like the [Openergo](https://openergo.webs.com), providing the construction is decent. But OpenRowingMonitor can also be fitted onto existing machines that lack a decent monitor: [you can find a full list of known and supported rowers here](Supported_Rowers.md). If your machine isn't listed, don't worry, it just means that you need to adjust the settings following the [settings adjustment help guide](rower_settings.md) yourself. There is no reason to be anxious, in the [GitHub Discussions](https://github.com/laberning/openrowingmonitor/discussions) there always are friendly people to help you set up your machine and the settings.

## Features

OpenRowingMonitor aims to provide you with metrics directly, connect to watches, apps and games via bluetooth or ANT+ and allow you to export your data to the analysis tool of your choice. These features have been tested intensily, where most features have survived flawlessly over thousands of kilometers of rowing with different types of rowing machines.

<!-- markdownlint-disable-next-line no-inline-html -->
<img src="img/openrowingmonitor_frontend.png" alt="Image showing the main OpenRowingMonitor screen" title="The main screen" width="700"><br clear="left">

The following items describe most of the current features in more detail.

### Rowing Metrics

OpenRowingMonitor implements a physics model to simulate the typical metrics of a rowing boat based on the pull on the handle. The physics model can be tuned to the specifics of a rower by changing some model parameters in the configuration file, where we also provide these [settings for machines known to us](Supported_Rowers.md). The underlying physics engine is structurally validated against a Concept2 PM5 in over 300 sessions (totalling 2.5 million meters), and results deviate less than 0.1% for every individual rowing session.

OpenRowingMonitor can display the following key metrics on the user interface:

* Distance rowed (meters)
* Training Duration
* Power (watts)
* Pace (/500m)
* Strokes per Minute (SPM)
* Calories used (kcal)
* Total number of strokes
* Heart Rate (supports BLE and ANT+ heart rate monitors, ANT+ requires an ANT+ USB stick)
* Drag factor
* Drive duration (seconds)
* Drive length (meters)
* Recovery duration (seconds)
* Distance per stroke (meters)
* Force curve with Peak power (Newtons)

It calculates and can export many other key rowing metrics, including Recovery Heart Rate, Average handle force (Newton), Peak handle force (Newton) and the associated handle force curve, handle velocity curve and handle power curve.

### Web Interface

The web interface visualizes the basic rowing metrics on any device that can run a web browser (i.e. a smartphone that you attach to your rowing machine while training). It shows the rowing statistics in realtime. You can set up the user interface as you like, with the metrics you find important:

<!-- markdownlint-disable-next-line no-inline-html -->
<img src="img/Metrics_Selection.png" title="The metrics selection screen" alt="Image showing the metrics selection screen" width="700"><br clear="left">

Via the Action tile, it can also be used to reset the training metrics and to select the type of bluetooth and ANT+ connection.

If you connect a physical screen directly to the Raspberry Pi, then this interface can also be directly shown on the device. The installation script can set up a web browser in kiosk mode that runs on the Raspberry Pi.

### Bluetooth Low Energy (BLE)

OpenRowingMonitor can recieve recieve heartrate data via BLE. Asides this functionality, OpenRowingMonitor also implements different Bluetooth Low Energy (BLE) protocols so you can use your rowing machine to share rowing metrics with different fitness applications. Some apps use the Fitness Machine Service (FTMS), which is a standardized GATT protocol for different types of fitness machines. Other apps prefer to see a Concept 2 PM5. To help you connect to your app and game of choice, OpenRowingMonitor currently supports the following Bluetooth protocols:

* **Concept2 PM**: OpenRowingMonitor implements part of the Concept2 PM Bluetooth Smart Communication Interface Definition. This is still work in progress and only implements the most common parts of the spec, so it is not guaranteed to work with all applications that support C2 rowing machines. Our interface currently can only report metrics, but can't recieve commands and session parameters from the app yet. It is known to work with [EXR](https://www.exrgame.com) and all the samples from [The Erg Arcade](https://ergarcade.com), for example you can [row in the clouds](https://ergarcade.github.io/mrdoob-clouds/).

* **FTMS Rower**: This is the FTMS profile for rowing machines and supports all rowing specific metrics (such as stroke rate). So far not many training applications for this profile exist, but the market is evolving. We've successfully tested it with [EXR](https://www.exrgame.com) (preferred method), [MyHomeFit](https://myhomefit.de) and [Kinomap](https://www.kinomap.com).

* **FTMS Indoor Bike**: This FTMS profile is used by Smart Bike Trainers and widely adopted by training applications for bike training. It does not support rowing specific metrics. But it can present metrics such as power and distance to the biking application and use cadence for stroke rate. So why not use your virtual rowing bike to row up a mountain in [Zwift](https://www.zwift.com), [Bkool](https://www.bkool.com), [The Sufferfest](https://thesufferfest.com) or similar :-)

* **BLE Cycling Power Profile**: This Bluetooth simulates a bike, which allows you to connect the rower to a bike activity on your (mostly Garmin) sportwatch. It will translate the rowing metrics to the appropriate fields. This profile is only supported by specific watches, so it might provide a solution.

* **BLE Cycling Speed and Cadence Profile**: used for older Garmin Forerunner and Garmin Venu watches and similar types, again simulating a bike activity. Please note to set the wheel circumference to 10mm to make this work well.

### ANT+

You can add a ANT+ USB-stick to your Raspberry Pi, which allows to to recieve data from your ANT+ heartrate monitor. On top of recieving the heartrate data, OpenRowingMonitor can also broadcast rowing metrics via ANT+, which can be recieved by the more expensive series of Garmin smartwatches, which then can calculate metrics like training load etc..

### Export of Training Sessions

OpenRowingMonitor is based on the idea that metrics should be easily accessible for further analysis. Therefore, OpenRowingMonitor can create the following files:

* **Garmin FIT files**: These are binairy files that contain the most interesting metrics of a rowing session. Most modern training analysis tools will accept a FIT-file. You can upload these files to training platforms like [Strava](https://www.strava.com), [Garmin Connect](https://connect.garmin.com), [Intervals.icu](https://intervals.icu/), [RowsAndAll](https://rowsandall.com/) or [Trainingpeaks](https://trainingpeaks.com) to track your training sessions;

* **Training Center XML files (TCX)**: These are XML-files that contain the most essential metrics of a rowing session. Most training analysis tools will accept a tcx-file. You can upload these files to training platforms like [Strava](https://www.strava.com), [Garmin Connect](https://connect.garmin.com), [Intervals.icu](https://intervals.icu/), [RowsAndAll](https://rowsandall.com/) or [Trainingpeaks](https://trainingpeaks.com) to track your training sessions;

* **RowingData** files, which are comma-seperated files with all metrics OpenRowingMonitor can produce. These can be used with [RowingData](https://pypi.org/project/rowingdata/) to display your results locally, or uploaded to [RowsAndAll](https://rowsandall.com/) for a webbased analysis (including dynamic in-stroke metrics). The csv-files can also be processed manually in Excel, allowing your own custom analysis. Please note that for visualising in-stroke metrics in [RowsAndAll](https://rowsandall.com/) (i.e. force, power and handle speed curves), you need their yearly subscription;

* **Raw flywheel measurements of the flywheel**, also in CSV files. These files are great to analyse and replay the specifics of your rowing machine (some Excel visualistion can help with this).

Uploading your sessions to Strava is an integrated feature, for all other platforms this is currently a manual step, see [the integration manual](Integrations.md). The OpenRowingMonitor installer can also set up a network share that contains all training data so it is easy to grab the files from there and manually upload them to the training platform of your choice.

## Installation

You will need a Raspberry Pi Zero 2 W, Raspberry Pi 3, Raspberry Pi 4 with a fresh installation of Raspberry Pi OS Lite for this (the 64Bit kernel is preferred). Currently, a Raspberry Pi 5 will not work (see [this issue](https://github.com/JaapvanEkris/openrowingmonitor/issues/52)). Connect to the device with SSH and folow the [Detailed Installation Instructions](installation.md) for more information on the software installation and for instructions on how to connect the rowing machine. Don't have a Raspberry Pi, but do have an ESP32 lying about? No problem, our sister project ported [OpenRowingMonitor for the ESP32](https://github.com/Abasz/ESPRowingMonitor), which works well (although uses a bit less accurate math due to platform limitations).

Please observe that active support for the Raspberry Pi Zero W has been dropped as of february 2024 (see [this discussion for more information](https://github.com/JaapvanEkris/openrowingmonitor/discussions/33)), due to package conflicts beyond our control. We do [maintain branch where we will backport functional improvements until April 2025](https://github.com/JaapvanEkris/openrowingmonitor/tree/v1beta_updates_Pi_Zero_W), which should run on legacy versions of Raspberry Pi OS (not on Bookworm).

## How it all started

[Lars Berning](https://github.com/laberning) originally started this project, because his rowing machine (Sportstech WRX700) had a very simple monitor and he wanted to build something with a clean interface that calculates more realistic metrics. He laid the foundation of this project. [Jaap van Ekris](https://github.com/JaapvanEkris) joined this project, as he had a NordicTrack Rx800 that he wanted to connect to EXR. Jaap added many improvements to the [Physics engine that powers OpenRowingMonitor](physics_openrowingmonitor.md), making it much more broadly applicable. [Abasz](https://github.com/Abasz) joined as well, adding many improvements to the ANT+ and BLE functionality. Abasz also maintains a much appreciated sister project that ports [OpenRowingMonitor to the ESP32](https://github.com/Abasz/ESPRowingMonitor). But, this is a larger team effort and OpenRowingMonitor had much direct and indirect support by many others during the years, see the [Attribution here](attribution.md).

## Further information

This project is already in a very stable stage, as it is used daily by many rowers. You can see its development [here in the Release notes](Release_Notes.md). We are never done, so more functionality will be added in the future, so check the [Development Roadmap](backlog.md) if you are curious. However, being open source, it might contain some things that are still a bit rough on the edges. Contributions to improve this are always welcome! To get an idea how this all works, you can read the [Archtecture description](Architecture.md), the [Physics of OpenRowingMonitor (for advanced readers)](physics_openrowingmonitor.md) and [Contributing Guidelines](CONTRIBUTING.md) how you can help us improve this project.

Feel free to leave a message in the [GitHub Discussions](https://github.com/JaapvanEkris/openrowingmonitor/discussions) if you have any questions or ideas related to this project.
