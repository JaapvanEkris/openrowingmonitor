# Development Roadmap for Open Rowing Monitor

This is currently is a very minimalistic Backlog for further development of this project.

If you would like to contribute to this project, you are more than welcome, but please read the [Contributing Guidelines](CONTRIBUTING.md) first to get the most out of your valuable time.

## 0.9.7 (currently in development)

* Add a lot of testcases to complete unit/integration testing of all functions used. Especially:
  * Testing core objects, like the Theil-Senn regression analysis functions (not the algorithm), as well as their integrated behaviour
  * Testing all the `workoutSegment.js` object metrics and cutting capabilities
* Add calories as interval type
  * Describe the physics
  * Add weight correction factor (see [C2 formula](https://www.concept2.com/training/calorie-calculator))
  * Add moving uo and down the slide to the work performed definitions where relevant
  * Make Calories a continuous metric (similar to distance) instead of a cycle based one
  * Add it as a stop criterium for the session manager
  * Add 'Calories' to the PM5 CSafe workout definition command set
  * Add 'Calories' to the MQTT command set
  * Add it as a workout option to the FIT recorder
  * Modify the PM5 peripheral to broadcast the right data
  * Update the GUI to allow selecting it

## Soon

* Improve the user interface (We really need help on this!)
* Move to the Wayland window manager, to keep in step with Raspberry Pi OS
* Introduce training plans (i.e. a distance/time to row):
  * Integrate with rowsandall.com to retrieve training planning
  * Integrate with intervals.icu to retrieve training planning
  * add user friendly possibility for user to define training interval timers in the web frontend
* Introduce workout plans (i.e. intervals with **goals** like a target HR or pace):
  * Update `server.js`, `SessionManager.js` and the recorders to handle a minimum or maximum pace/HR per interval
  * Integrate with intervals.icu to retrieve training targets
  * add user friendly possibility for user to define workouts with targets via the GUI
  * add user friendly possibility for user to define workouts with targets via the PM5

## Later

* validate FTMS with more training applications and harden implementation (i.e. Holofit and Coxswain)
* figure out where to set the Service Advertising Data (FTMS.pdf p 15)
* add some attributes to BLE DeviceInformationService
* Introduce multiple users with their own parameters (like linked rowsandall.com and intervals.icu accounts, etc.)

## Ideas

* Add GUI indicators for training zones
