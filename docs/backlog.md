# Development Roadmap for Open Rowing Monitor

This is currently is a very minimalistic Backlog for further development of this project.

If you would like to contribute to this project, you are more than welcome, but please read the [Contributing Guidelines](CONTRIBUTING.md) first to get the most out of your valuable time.

## Soon

* Integrate with rowsandall.com and intervals.icu for workout planning (i.e. retrieval of the training/workout plan) and reporting (i.e. uploading a result)
* Improve the user interface (We really need help on this!)
* add user friendly possibility for user to define training interval timers (`server.js`, `SessionManager.js` and the recorders can already handle this, what is missing is the frontend to the web and peripherals to manage this)
* add user friendly possibility for user to define workouts (i.e. settings training **goals** for a session. `server.js`, `SessionManager.js` and the recorders can already handle a large part of this, missing is the frontend to the web and PM5)
* Introduce multiple users with their own parameters (like linked Strava accounts, etc.)
* Clean up the architectual mess that Strava integration currently is (it ping-pongs between GUI and uploader, this can't be the way). At least place it nicely in the recorders section where it belongs. Perhaps switch to the 'Simple OAuth2' NPM as a basis and work from there (as also other plaforms use this).

## Later

* Add calories as interval type
  * Add weight correction factor (see [C2 formula](https://www.concept2.com/training/calorie-calculator))
  * Make Calories a continuous metric (similar to distance) instead of a cycle based one
  * Add it as a stop criterium for the session manager
  * Add it as a workout option to the FIT recorder
  * Modify the PM5 peripheral to broadcast the right data
  * Update the GUI to allow selecting it
* validate FTMS with more training applications and harden implementation (i.e. Holofit and Coxswain)
* figure out where to set the Service Advertising Data (FTMS.pdf p 15)
* add some attributes to BLE DeviceInformationService

## Ideas

* Add GUI indicators for training zones
