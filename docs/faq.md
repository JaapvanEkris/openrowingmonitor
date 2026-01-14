# OpenRowingMonitor — Community FAQ (Enriched for LLM use)

This FAQ consolidates community knowledge from GitHub discussions into dense, LLM-friendly answers. It complements the [official OpenRowingMonitor documentation](./README.md) by capturing real-world user experiences, troubleshooting workflows, and hardware-specific insights that emerge from community discussions.

## How to Use This FAQ

This document works best alongside the official documentation:

- **For first-time setup:** Start with the [Installation Guide](./installation.md) and [README](./README.md), then refer to this FAQ for specific hardware questions
- **For troubleshooting:** Use this FAQ to find community-validated solutions and diagnostic workflows
- **For hardware selection:** See [Supported Rowers](./Supported_Rowers.md) first, then consult FAQ entries #2-#7 for sensor and hardware specifics
- **For configuration:** Reference [Rower Settings Guide](./rower_settings.md) for parameter explanations, and this FAQ for tuning guidance based on community experience

Each FAQ entry contains:

- **Short answer:** Quick solution or guidance
- **What / Why / How:** Contextual explanation and step-by-step approach
- **Community-proven specifics:** Real part numbers, config snippets, and examples from working setups
- **Failure modes:** Common mistakes and how to avoid them
- **Paraphrases:** Alternative phrasings to help with search/query matching
- **Tags & References:** Links to official docs and relevant GitHub discussions

Note: This document is authored for machines first and humans second — answers are deliberately contextual and include examples, failure modes, and recommended next steps.

---

## 1) What is the best way to start with ORM (first-time setup)?

**Short answer:** Assess your current hardware setup, determine what changes are needed for ORM compatibility, then follow the installation documentation.

What / Why / How

- What: Before installing, understand what hardware you have and what needs to be added or modified for ORM to work.
- Why: ORM requires rotational impulse detection from the flywheel — most rowers need additional sensors. Knowing your hardware situation upfront prevents troubleshooting later.
- How (assessment checklist):
  1. **Identify your rower model** — Check the [Supported Rowers list](./Supported_Rowers.md) to see if your model is already documented (also see [Entry #2](#2-how-do-i-check-if-my-rower-is-compatible))
  2. **Determine sensor compatibility** — Inspect existing sensors; understand if they're compatible or if you need to add new ones (see [Entry #3](#3-should-i-use-a-hall-sensor-or-a-reed-switch) and [Entry #6](#6-which-hall-sensor-modules-are-known-to-work))
  3. **Plan sensor installation** — If no compatible sensor exists, you'll need to add a magnet + hall/reed/IR/other sensor; decide on magnet count (see [Entry #7](#7-how-many-magnets-should-i-use-and-where-should-they-be-placed))
  4. **Choose your platform** — Raspberry Pi Zero 2 W, Pi 3, Pi 4 are supported (see [Entry #10](#10-installation-on-raspberry-pi-pi-zero-2-common-errors--fixes) for platform-specific issues)
  5. **Follow install docs** — See official [Installation Guide](./installation.md) for platform-specific setup steps
  6. **Test sensor pulses** — Rotate flywheel manually and verify impulses in debug logs before full configuration (see [Entry #13](#13-where-are-logs-and-raw-data-stored--how-do-i-get-them-for-debugging))
  7. **Configure rower profile** — Set `numOfImpulsesPerRevolution` and select/tune a rower profile from `config/rowerProfiles.js` (see [Rower Settings Guide](./rower_settings.md))

Community experience

- New users often solved their first blockers by ensuring the flywheel produced clean impulses before trying tuning.
- Recommended: Record a CSV of raw impulse data first (`recordings/` folder), this helps with debugging and parameter tuning later.

Debug commands (ORM on Pi):

```bash
# Stop service and run manually to see logs
sudo systemctl stop openrowingmonitor
cd /opt/openrowingmonitor && sudo npm start
# Check GPIO17 for pulses (short circuit gpio17 and gnd to test)
```

Paraphrases

- "How do I get started with OpenRowingMonitor?"  
- "First steps to run ORM on my Pi"
- "What hardware do I need for ORM?"

Tags: getting-started, hardware-assessment, installation

References:

- Official documentation: [Installation Guide](./installation.md), [Rower Settings Guide](./rower_settings.md), [Supported Rowers](./Supported_Rowers.md)
- Hardware setup guides: [Concept2 RowErg Setup](./hardware_setup_Concept2_RowErg.md), [WRX700 Setup](./hardware_setup_WRX700.md)
- Setup process: [Check that ORM works](./rower_settings.md#check-that-openrowingmonitor-works-correctly), [Hardware connection guide](./rower_settings.md#making-sure-the-hardware-is-connected-correctly-and-works-as-intended)

---

## 2) How do I check if my rower is compatible?

**Short answer:** Any rower with a rotating flywheel or shaft is potentially compatible — you just need a way to detect that rotation reliably.

What / Why / How

- What: ORM calculates power and strokes from rotational dynamics. Compatibility means the ability to measure rotational impulses from the flywheel or drive shaft.
- Why: The fundamental requirement is consistent, measurable rotation — the specific mechanism (air, water, magnetic resistance) doesn't matter for compatibility.
- How:
  1. **Check for existing sensor** — Open your rower housing and look for magnets or sensors near the flywheel/shaft
  2. **Verify rotation detection** — If a sensor exists, determine if it produces digital pulses (compatible) or requires signal conditioning
  3. **Add sensor if needed** — If no sensor exists, add a magnet to the flywheel and a hall sensor nearby (see [Entry #6](#6-which-hall-sensor-modules-are-known-to-work))
  4. **Test pulse detection** — Manually spin the flywheel and verify pulses in debug logs

General principle: **Every rower is compatible if it has a rotating flywheel or shaft where rotation can be detected.** The challenge is adding the appropriate sensor if one doesn't exist.

Compatible rowers confirmed by community:

See the [official Supported Rowers documentation](./Supported_Rowers.md) for an up-to-date list with full support status. Community-confirmed models include:

- **Air rowers:** DKN R-320, Concept2 (see [Entry #17](#17-older-concept2-rowers-model-c-and-earlier--sensor-compatibility)), ForceUSA R3, Xebex Air Rower V2
- **Water rowers:** WaterRower, Sportstech WRX700 (see [WRX700 setup guide](./hardware_setup_WRX700.md)), Joroto MR380, Skandika Nytta
- **Magnetic rowers:** NordicTrack RX800, ISE SY-1750
- **Hybrid rowers:** JLL Ventus 2, NordicTrack RX800
- **DIY rowers:** OpenErgo builds (see [discussions](https://github.com/laberning/openrowingmonitor/discussions/80))

For detailed hardware requirements and setup steps for specific models, see the [Supported Rowers](./Supported_Rowers.md) page.

Community tips

- If unsure try opening the rower housing and look for existing magnets and sensor
- Even handle-mounted sensors can sometimes work if they measure handle travel consistently, though they might not provide better data than the built in monitor

Paraphrases

- "Will ORM work on my [brand/model]?"  
- "How to check compatibility for my rowing machine"
- "Is every rower compatible with ORM?"

Tags: compatibility, hardware, getting-started

References:

- Official documentation: [Supported Rowers](./Supported_Rowers.md), [Rower Settings Guide](./rower_settings.md), [README](./README.md)
- GitHub discussions: [DIY Openergo builds](https://github.com/laberning/openrowingmonitor/discussions/80), [Setup discussions](https://github.com/laberning/openrowingmonitor/discussions/105)

---

## 3) Should I use a Hall sensor or a Reed switch?

**Short answer:** Use a **Hall effect sensor** if possible; reed switches inferior though simpler from an electronics perspective.

What / Why / How

- What: Hall sensors detect magnetic fields electronically and yield clean digital impulses. Reeds are mechanical contact closures.
- Why: Hall sensors do not suffer contact bounce and are more tolerant to aligment issues; they produce more stable timing and cleaner power estimates. Community reports: *"the noise seems to disappear even with no debounce"* when switching from reed to Hall.
- How: Mount a small magnet on the flywheel and position the hall sensor so it trips once per magnet pass. Configure `numOfImpulsesPerRevolution` if more than one magnet is present. Use **falling-edge triggering with internal pull-up** for cleanest signals.

Community-proven specifics
[Confirmed working hall sensors](#6-which-hall-sensor-modules-are-known-to-work)

Failure modes

- Wrong polarity or missing pull-up → no pulses detected.
- Hall module designed for 5V used directly on 3.3V MCU → unreliable readings or no detection.
- **Magnetic polarity issue:** One user with FDF Neon Pro V discovered alternating N/S magnets (3 adjacent with south pole facing sensor, next 3 with north) caused measurement inconsistencies because KY-003 is biased toward N/S detection. Check magnet orientation consistency if multiple magnets are present.
- Vibration from rower on hard floor in case of using reed → spurious pulses. Solution: place rower on soft foam mat (reduced noise dramatically for one NordicTrack user: *"almost all noise has gone... no more missed strokes!"*).

Paraphrases

- "Should I use hall or reed sensors?"  
- "Which sensor is less noisy for ORM?"  
- "Best sensor to detect flywheel rotation?"

Tags: sensors, wiring, hardware, configuration, KY-003, A3144, hall-effect

References:

- Official documentation: [Rower Settings Guide - Hardware Connection](./rower_settings.md#setting-up-the-hardware-connection), [WRX700 Setup](./hardware_setup_WRX700.md), [Concept2 RowErg Setup](./hardware_setup_Concept2_RowErg.md)
- GitHub discussions: [Sensor types discussion](https://github.com/laberning/openrowingmonitor/discussions/38), [Concept2 Model B #151](https://github.com/laberning/openrowingmonitor/discussions/151)

---

## 4) My rower already has reed switches on the handle — can I reuse them for ORM?

**Short answer:** Not directly — handle reed switches measure linear handle travel and usually don't provide the rotational timing ORM needs.

What / Why / How

- What: Handle-mounted reeds detect translation/position, not flywheel rotation.
- Why: ORM models power and strokes from rotational dynamics; using handle sensors often yields inconsistent timing and incorrect power.
- How: Keep the handle sensor for the rower's stock electronics if needed, but add a dedicated flywheel magnet + hall sensor for ORM. See [Entry #6](#6-which-hall-sensor-modules-are-known-to-work) for sensor recommendations.

Community experience

- Multiple users tried reuse; successful conversions ultimately added a new flywheel sensor and ignored the handle switch for ORM.
- NordicTrack RX800 user planned a two-way switch to toggle between stock controller and ORM, eventually added dedicated flywheel sensor.

Paraphrases

- "Can I use my handle reed switch for ORM?"  
- "Do handle sensors give correct strokes for ORM?"

Tags: sensors, hardware, compatibility

References:

- Official documentation: [Rower Settings Guide](./rower_settings.md), [Supported Rowers](./Supported_Rowers.md)
- GitHub discussions: [Two reeds on the hanlde](https://github.com/laberning/openrowingmonitor/discussions/95), [Two reeds measuring the handle](https://github.com/JaapvanEkris/openrowingmonitor/discussions/24), [Reed switch under the seat](https://github.com/laberning/openrowingmonitor/discussions/171)

---

## 5) Reed switches bounce — can I reduce bounce reliably?

**Short answer:** You can reduce bounce mechanically and with software debounce, but it often cannot reach the reliability of Hall sensors.

What / Why / How

- What: Bounce is mechanical contact chatter when the reed closes. Watch this [excellent explanation of how reed switches work](https://www.youtube.com/watch?v=7LimjYS04FQ&t=278s) to understand the mechanical bounce phenomenon.
- Why: Bounce causes double counts, false high cadence, or power spikes when signals are interpreted as clean impulses.
- How: Improve mechanical mounting (rigid bracket), orient magnet face perpendicular to the switch, increase spacing slightly, and use software debounce (short window filtering). If issues persist, replace with Hall sensor (see [Entry #6](#6-which-hall-sensor-modules-are-known-to-work)).

Community-proven techniques

- Rigid mounts and careful magnet spacing reduce, but do not eliminate, bounce. Users combining mechanical improvements with software debounce saw partial success.
- Quote from user who switched: *"the noise seems to disappear even with no debounce"* — Hall sensors fundamentally eliminate the bounce problem.
- Vibration damping mat under the rower helped one user eliminate spurious pulses that were mistaken for bounce.

Failure modes

- Flexible mounting bracket amplifies mechanical resonance → persistent double-counts
- Too-close magnet → continuous trigger instead of discrete pulses

Paraphrases

- "How to stop reed switches double-counting?"  
- "Reed switch debouncing tips for ORM"

Tags: sensors, troubleshooting, reed-switches

References:

- Official documentation: [Rower Settings Guide - Hardware Connection](./rower_settings.md#setting-up-the-hardware-connection)
- External resources: [Reed Switch Mechanics (YouTube)](https://www.youtube.com/watch?v=7LimjYS04FQ&t=278s)
- GitHub discussions: [Home-built rower reed switch bounce](https://github.com/laberning/openrowingmonitor/discussions/80), [Reed switch noise and debounce](https://github.com/laberning/openrowingmonitor/discussions/115), [Visualized examples of bounce issues](https://github.com/JaapvanEkris/openrowingmonitor/discussions/28), [Extensive discussion on reed bounce](https://github.com/laberning/openrowingmonitor/discussions/122)

---

## 6) Which Hall sensor modules are known to work?

**Short answer:** DRV5023, KY-003, A3144, and similar digital hall sensors work well; pick modules rated for your system voltage (3.3V for Raspberry Pi).

What / Why / How

- What: Small digital hall sensors produce clean digital outputs suitable for GPIO input.
- Why: They are inexpensive, widely available, and eliminate mechanical bounce issues.
- How: Confirm the module uses 3.3V logic (or include level shifting for 5V sensors), wire Vcc, GND and output with a pull-up if needed, and test pulses by rotating the flywheel.

Community-proven specifics

| Sensor | Voltage | Notes | Community Reports |
| --- | --- | --- | --- |
| **DRV5023** | 2.5V-5.5V | Best option for low-power 3.3V systems. Works reliably with Raspberry Pi without level shifting. | Confirmed working |
| **KY-003** | 3.3V-5V | Popular module, clean signal. Remove LED/resistor for voltage safety. Use falling-edge + internal pull-up. | Multiple confirmed working on DKN R-320 and other models |
| **A3144** | 4.5V-24V | Requires 5V supply minimum. Cannot be powered from RPi 3.3V directly. It has an **E** variant rated 3.8V which might work unreliably from 3.3V. Needs level shifter for 3.3V GPIO. | Requires voltage consideration |
| **OH137** | 3.3V-5V | Alternative hall sensor option | Mentioned in discussions |
| **TL4905L** | 4.5V-12V | Alternative hall sensor. Can pair with LM393 comparator for adjustable sensitivity with weak magnets. | For weak magnet scenarios |
| **Optical alternative** | Varies | IR LED + receiver modules | When magnetic sensing is problematic |

Wiring recommendations:

- **Pi GPIO:** Connect sensor output to GPIO17 (default), use internal pull-up, configure for falling-edge interrupt.

Failure modes

- Using a 5V-only sensor on a 3.3V MCU without level shifting can cause unreliable reads or damage the MCU.
- Polarity-sensitive: ensure magnet is oriented with correct pole toward sensor.

Paraphrases

- "Which hall sensor part number should I buy?"  
- "What hall sensors do people use for ORM?"
- "KY-003 wiring for Raspberry Pi"
- "Best hall sensor for 3.3V Raspberry Pi"

Tags: sensors, hardware, hall-effect, specifications

References:

- Official documentation: [WRX700 Hardware Setup](./hardware_setup_WRX700.md), [Concept2 RowErg Setup](./hardware_setup_Concept2_RowErg.md), [Rower Settings Guide](./rower_settings.md)
- GitHub discussions: [Concept2 Model C sensors](https://github.com/laberning/openrowingmonitor/discussions/38), [Home-built rower sensors](https://github.com/laberning/openrowingmonitor/discussions/80), [Low power hall sensor](https://github.com/laberning/openrowingmonitor/discussions/186)

---

## 7) How many magnets should I use and where should they be placed?

**Short answer:** Start with **1 magnet** for simplest setup; advanced users can use 3 or 6 magnets for higher resolution, but placement precision becomes more important. Machinces that produce less rotation per stroke (tipically water rowers an magnetically breaked rowers) more magnets provides great improvement.

What / Why / How

- What: Magnets produce discrete pulses; count and configure impulses per revolution to avoid miscalculated cadence.
- Why: ORM converts impulses into rotational speed — extra impulses per revolution will multiply power estimates unless configured. More magnets = higher timing resolution but more complexity.
- How:
  - **1 magnet (recommended for beginners):** Easiest to set up, no magnet placement issues. Place anywhere on the flywheel where it can be stabally mounted so passes the sensor once per revolution.
  - **3 magnets (intermediate):** Higher resolution timing, requires even spacing (120° apart). Good for high-speed flywheels or when you need finer stroke detection.
  - **6 magnets (advanced):** Maximum resolution, but placement precision is critical — uneven spacing causes timing jitter. Generally a 3D printed bracket can help with placement.

Community experience

- Uneven magnet polarity caused timing errors (see [Entry #3](#3-should-i-use-a-hall-sensor-or-a-reed-switch) for polarity issue details).
- More magnets = higher resolution timing, but also more complexity in configuration and higher risk of noise/error amplification.
- Start with 1 magnet. If it works well, you can experiment with 3. Only move to 6 if you're an advanced user and need the extra resolution.

Example configuration:

```javascript
rowerSettings: Object.assign(rowerProfiles.WRX700, {
  numOfImpulsesPerRevolution: 1  // or 3, or 6 depending on magnet count
})
```

Failure modes

- `numOfImpulsesPerRevolution` wrong → cadence shows 2x, 4x, etc. of actual rate
- Inconsistent magnet spacing → timing jitter, unstable power readings
- Alternating polarity (N/S/N/S) → detection bias with some sensors

Paraphrases

- "Do I need more than one magnet?"  
- "How to set numOfImpulsesPerRevolution"
- "Should I use 1 or 3 magnets on my flywheel?"

Tags: sensors, configuration, magnets, setup

References:

- Official documentation: [Rower Settings Guide - Critical Parameters](./rower_settings.md#critical-parameters-you-must-change-or-review-for-noise-reduction), [WRX700 Setup](./hardware_setup_WRX700.md)
- Configuration files: `config/rowerProfiles.js`, `config/default.config.js`
- GitHub discussions: [Chart on magment placement issues](https://github.com/JaapvanEkris/openrowingmonitor/discussions/28)

---

## 8) Where to measure sprocket radius and why it matters?

**Short answer:** Measure the effective sprocket radius at the point where the chain/belt contacts the pulley, not the outer edge of any cover.

What / Why / How

- What: `sprocketRadius` affects translation between rotations and handle travel; erroneous measurement introduces scaling errors in distances and power (but not in stroke detection in general).
- Why: Using the wrong radius (e.g. measuring rim instead of contact point) causes consistent over- or under-estimation of metrics.
- How: Remove covers if necessary and measure the radius to the point where the belt/chain contacts the pulley; verify by running a controlled rotation and checking the derived distance against a known value.

Paraphrases

- "How do I measure sprocket radius?"  
- "Why is my distance off — is the sprocket radius wrong?"

Tags: configuration, calibration

References:

- Official documentation: [Rower Settings Guide - Basic Metrics](./rower_settings.md#settings-required-to-get-the-basic-metrics-right), [Sprocekt radius setting documentation](./rower_settings.md#sprocketRadius)
- Configuration files: `config/rowerProfiles.js` (see sprocketRadius examples)
- GitHub discussions: [Where to measure sprocket radius](https://github.com/laberning/openrowingmonitor/discussions/142)

---

## 9) How do I calibrate ORM to match Concept2 or measure flywheel inertia?

**Short answer:** Use the recommended calibration workflow: Row at known pace/power, compare ORM readings to reference device, then iteratively adjust `dragFactor` and `flywheelInertia` until metrics align.

What / Why / How

- What: Calibration aligns ORM metrics (pace/watts) with reference devices like Concept2 by tuning physical parameters.
- Why: Differences in flywheel inertia, friction, and gearing alter energy transfer — calibration compensates for these machine-specific characteristics.
- How: Set initial estimates → row test session → compare calculated dragFactor to manual dragFactor → adjust `flywheelInertia` until they converge. See the [Rower Settings Guide - Setting the flywheel inertia](./rower_settings.md#setting-the-flywheel-inertia) for complete workflow.

Key parameters for calibration:

- `flywheelInertia` — rotational inertia of flywheel (in kg\*m²). Affects calculated dragFactor and handle force/power along with distance, speed etc.
- `dragFactor` — damping/resistance coefficient of flywheel. Machine and damper-setting dependent.
- `autoAdjustDragFactor` — when true, dynamically calculates dragFactor during recovery phase (requires accurate `flywheelInertia`)
- `dragFactorSmoothing` — running median filter length (default 5 strokes) to reduce noise in auto-calculated dragFactor
- `minimumDragQuality` — minimum "Goodness of Fit" (0.0-1.0) required to accept calculated dragFactor
- `numOfImpulsesPerRevolution` — must be correct first (see [Entry #7](#7-how-many-magnets-should-i-use-and-where-should-they-be-placed))

**Important:** Even with perfect calibration, incorrect stroke detection parameters can cause issues. If metrics seem wrong or strokes are being missed, review stroke detection first (see [Entry #15](#15-strokes-are-getting-lost--diagnostic-flow) and [Entry #16](#16-understanding-and-tuning-stroke-detection-parameters)).

Calibration workflow from documentation:

1. Set initial `dragFactor` manually by rowing at known pace (e.g., 200m in 1 minute ≈ 20 strokes at 2:30/500m)
2. Set estimated `flywheelInertia` (use [Dave Vernooy's method](https://dvernooy.github.io/projects/ergware/) or estimate from similar machines)
3. Row test session and check logs for: *"Calculated drag factor: X, slope: Y, Goodness of Fit: Z"*
4. Analyse calculated distance if its plausible:
   - If calculated distance seems too low: increase `flywheelInertia` / `dragFactor`
   - If calculated distance seems too high: decrease `flywheelInertia` / `dragFactor`
5. Repeat until satisfied
6. Optionally enable `autoAdjustDragFactor: true` for dynamic adjustment so change only `flywheelInertia`

Community-proven methods:

- Measure inertia with [swing period with stopwatch](https://github.com/laberning/openrowingmonitor/discussions/113): let flywheel spin down from known RPM, measure time for N revolutions
- Try 3D modelling the flywheel and use [CAD to calculate inertia](https://github.com/laberning/openrowingmonitor/discussions/171)
- Compare to known machines: Concept2 RowErg dragFactor ranges 80-220, typical flywheelInertia ~0.1 kg\*m²
- Trial and error: *"Most people are hesitant to take apart their rower, so most people guess their inertia"* (Discussion #80)
- Physics reference: [Oxford Rowing Physics](http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html) explains underlying theory

Paraphrases:

- "How to calibrate ORM to Concept2?"
- "How to measure flywheel inertia for my rower?"
- "Why is my calculated dragFactor different from manual dragFactor?"

Tags: calibration, metrics, concept2, dragFactor, flywheelInertia

References:

- Official documentation: [Physics of OpenRowingMonitor](./physics_openrowingmonitor.md), [Rower Settings Guide - Calibration](./rower_settings.md#setting-the-flywheel-inertia), [Rower Settings Guide - Drag Factor](./rower_settings.md#setting-the-dragfactor), [Architecture](./Architecture.md)
- Configuration files: `config/rowerProfiles.js` (see Concept2 profiles for reference), `config/default.config.js`
- External resources: [Oxford Rowing Physics](http://eodg.atm.ox.ac.uk/user/dudhia/rowing/physics/ergometer.html), [Dave Vernooy's Flywheel Moment of Inertia Method](https://dvernooy.github.io/projects/ergware/)
- GitHub discussions: [Swinging method](https://github.com/laberning/openrowingmonitor/discussions/113), [CAD method](https://github.com/laberning/openrowingmonitor/discussions/171)

---

## 10) Installation on Raspberry Pi (Pi Zero 2 common errors & fixes)

**Short answer:** Pi Zero 2 is supported, but common issues are OS image mismatches, permissions, and missing directories — check `dataDirectory` and run the install with correct permissions.

What / Why / How

- What: Most install failures are environment/permissions related (mkdir permission denied) or due to older system images.
- Why: Install scripts may try to create `/home/pi/data` or similar directories as the `pi` user; running as a different user or missing home directories triggers errors.
- How: Ensure you run the install as the intended user (`pi`), create the `dataDirectory` manually with appropriate ownership (chown), and ensure Node.js and other dependencies match recommended versions.

Common errors and fixes:

**ARMv6 NodeJS error (Pi Zero W original):**

```text
## You appear to be running on ARMv6 hardware. Unfortunately this is not 
currently supported by the NodeSource Linux distributions.
```

Fix: Use manual Node.js install from nodejs.org tarballs (linux-armv6l). See: <https://hassancorrigan.com/blog/install-nodejs-on-a-raspberry-pi-zero/>

**GPIO EBUSY error:**

```text
Error: EBUSY: resource busy or locked, write
at exportGpio...
```

Fix: GPIO pin conflict with another service (often touchscreen driver). Change GPIO pin in config:

```javascript
gpioPin: 16  // instead of default 17
```

**ENODEV Bluetooth error:**

```text
UnhandledPromiseRejectionWarning: Error: ENODEV, No such device
at Hci.init...
```

Fix: BT device not initialized. Check `hciuart` service. Try `sudo systemctl restart bluetooth`.

**Config syntax error:**

User mistake: `gpioPin: 16` without trailing comma caused parse error. Remember JavaScript object syntax:

```javascript
export default {
  gpioPin: 16,  // <-- trailing comma important!
  rowerSettings: ...
}
```

Tested platforms:

- Pi Zero W (ARMv6) — works with manual Node.js install
- Pi Zero 2 W — works with standard install
- Pi 3 B — works, good for touchscreen setups
- Pi 4 — works, plenty of headroom

Paraphrases

- "Install fails on Pi Zero 2 — what should I check?"  
- "mkdir: cannot create directory /home/pi Permission denied during install"

Tags: installation, pi, troubleshooting

References:

- Official documentation: [Installation Guide](./installation.md), [Improving Raspberry Performance](./Improving_Raspberry_Performance.md), [README - Requirements](./README.md#requirements)
- Installation scripts: `install/install.sh`
- GitHub discussions: [Pi Zero W #33](https://github.com/JaapvanEkris/openrowingmonitor/discussions/33), [Pi 5 compatibility #52](https://github.com/JaapvanEkris/openrowingmonitor/issues/52)

---

## 11) I can't get Strava upload (TCX/FIT) to work — what am I doing wrong?

**Short answer:** Check that TCX/FIT files are actually being created and that `dataDirectory` (`data` folder per default) is correct; verify API keys/Strava settings and prefer manual file upload for debugging.

What / Why / How

- What: Issues are usually due to empty TCX files, incorrect local file paths, or auth/config problems with Strava.
- Why: If `createTcxFiles` is false or `dataDirectory` isn't set/accessible, files won't be created for upload.
- How: Enable `createTcxFiles: true`, verify that files appear in set `dataDirectory`, inspect TCX content for empty trackpoints, and verify Strava auth tokens and upload logs.

Alternative routes to Garmin/Strava:

1. Use app like MyHomeFit that connects to ORM via BLE FTMS and handles export
2. Manual TCX/FIT file upload to Strava website
3. For Garmin: ANT+ or Concept2 logbook sync (limited support for non-C2 equipment)

Paraphrases

- "Why does Strava upload fail?"  
- "My TCX files are empty — what next?"

Tags: data, tcx, strava, export

References:

- Official documentation: [Integrations Guide](./Integrations.md), [README - Export of Training Sessions](./README.md#export-of-training-sessions)
- Configuration files: `config/default.config.js` (see `createTcxFiles`, `createFitFiles`, `dataDirectory` settings)
- GitHub discussions: [Strava status](https://github.com/JaapvanEkris/openrowingmonitor/discussions/64)

---

## 12) How do I connect ORM to fitness apps via Bluetooth or ANT+?

**Short answer:** ORM implements several BLE standard profile including FTMS Rower (or PM5 emulation); connect from apps like ErgData, Coxswain, MyHomeFit, or ergometer-space.org. When having ANT+ stick ORM can broadcast data via ANT+ too.

What / Why / How

- What: ORM implements most known fitness related BLE profiles and optionally Concept2 PM5 emulation.
- Why: Standard BLE profiles allow connection to fitness apps, watches, and training platforms.
- How: Enable the desired BLE profile in config (or via the GUI), ensure Pi's Bluetooth is working, and scan from your app/device.

Tested apps and platforms:

- **ErgData (Concept2)** — *"the Concept2 ErgData app recognizes the OpenRowMonitor as a Concept2 rower"* (using PM5 emulation)
- **MyHomeFit** — confirmed working with FTMS Rower profile
- **Coxswain** — mentioned as target for validation
- **ergometer-space.org** — works with C2 emulation mode
- **Garmin watches** — limited; FTMS Rower not universally supported on older watches. ANT+ may be needed.

ANT+ support (requires USB stick):

```javascript
// Enable in config.js
heartrateMonitorANT: true  // for HR monitors
```

Compatible USB sticks: Garmin USB, USB2 ANT+, mini ANT+ stick, off-brand clones.

Note on Garmin watches: *"many sports watches are capable of ANT+, and not many are supporting BLE (at least that is the current status for Garmin)"* — consider ANT+ if targeting Garmin ecosystem.

Paraphrases

- "How to connect ORM to ErgData?"
- "Which apps work with OpenRowingMonitor?"
- "ORM Bluetooth setup for Garmin"

Tags: bluetooth, FTMS, apps, connectivity

References:

- Official documentation: [README - Device Connections](./README.md#device-connections-via-bluetooth-ant-and-mqtt), [Integrations Guide](./Integrations.md), [PM5 Interface](./PM5_Interface.md)
- Configuration files: `config/default.config.js` (see BLE and ANT+ settings)

---

## 13) Where are logs and raw data stored — how do I get them for debugging?

**Short answer:** Real-time logs stream via `journalctl`; data/TCX files go to `dataDirectory` (default `~/data/`); raw rowing data (CSV) appears in `recordings/` when enabled. Enable debug logging in `config.js` to see stroke detection details.

What / Why / How

- What: ORM writes real-time logs to systemd journal (view with `journalctl`), stores data in the set `dataDirectory`, and optionally records raw sensor pulses (CSV) in `recordings/`.
- Why: Logs show live stroke detection, phase transitions, and calculated metrics; raw data reveals sensor quality issues; stored data allows TCX/FIT export.
- How: Enable `createRawDataFiles: true` and set desired `loglevel` in `config.js`; use `journalctl -u openrowingmonitor -f` to view real-time logs; check `dataDirectory` for session exports.

Enable detailed logging in `config/config.js`:

```javascript
loglevel: {
  default: 'debug',      // 'error', 'warn', 'info', 'debug', 'trace'
  RowingEngine: 'debug'  // stroke detection logs
}
```

View real-time logs:

```bash
journalctl -u openrowingmonitor -f              # Live stream
journalctl -u openrowingmonitor -n 50 -f        # Last 50 lines + follow
```

Example debug output (healthy stroke):

```text
*** RECOVERY phase started at time: 1.5644 sec
*** DRIVE phase started at time: 3.6013 sec
*** Calculated drag factor: 105.6459, Goodness of Fit: 0.9435
stroke: 1, dist: 7.5m, speed: 1.80m/s, pace: 4:38/500m, power: 17W
```

Check file locations:

```bash
ls -lh ~/data/          # TCX/session files
ls -lh ~/recordings/             # Raw CSV sensor data (if enabled)
```

Paraphrases

- "Where does ORM write TCX files?"  
- "How do I get raw recordings for troubleshooting?"
- "What do stroke detection logs look like?"

Tags: data, logs, troubleshooting

References:

- Official documentation: [Rower Settings Guide - Detailed Logging](./rower_settings.md#setting-up-a-more-detailed-logging-for-a-better-insight-into-openrowingmonitor), [Installation Guide](./installation.md#check-if-openrowingmonitor-runs-without-issue)
- Configuration files: `config/default.config.js` (see `loglevel`, `createRawDataFiles`, `dataDirectory` settings)

---

## 14) How do I set up a 3–5" GPIO LCD or small touchscreen (display / kiosk)?

**Short answer:** Pick a supported display, install its kernel module or driver for your Pi, and run ORM in kiosk mode; the install script can optionally set this up. Verify display driver compatibility with GPIO17 (sensor pin) before installation.

What / Why / How

- What: Physical displays require framebuffer/touch drivers and X11 running in kiosk mode to show the web interface.
- Why: Framebuffer and touch drivers differ across display panels; compatibility depends on choosing a panel with Pi support and verifying GPIO conflicts.
- How: Install display drivers per panel documentation, run the ORM installer and select kiosk mode when prompted, then verify `webbrowserkiosk` service is running with `sudo systemctl status webbrowserkiosk`.

Installation setup:

During the ORM install script, you'll be prompted:

```shell
Do you want to set up a web browser in kiosk mode to display the interface on a screen? (y/n)
```

Answer `y` to install and enable the `webbrowserkiosk` service. This will:

- Install X11 and required dependencies
- Create `/lib/systemd/system/webbrowserkiosk.service`

Verify kiosk setup:

```bash
sudo systemctl status webbrowserkiosk    # Check if running
sudo systemctl restart webbrowserkiosk   # Restart if needed
journalctl -u webbrowserkiosk -f         # View logs
```

Display compatibility notes:

- **Raspberry Pi 7" official touchscreen** — confirmed working with Pi 3 B / Pi 4
- **3.5" GPIO LCD (SPI)** — requires driver install; verify it doesn't conflict with GPIO17 (default sensor pin). If conflict, change sensor pin in `config.js` to `gpioPin: 16` or another free pin
- **HDMI external display** — works without special drivers; best for Pi 4

Performance tips for Pi Zero:

- Kiosk mode uses significant RAM; Pi Zero may struggle
- Set priority in `webbrowserkiosk.service` with `Nice=19` to lower browser priority vs. rowing engine
- Consider using a headless setup (smartphone as display) if performance is poor

Paraphrases

- "How to run ORM on a small LCD?"  
- "Install physical display guide for Raspberry Pi"
- "Touchscreen setup for ORM"

Tags: display, installation, kiosk, hardware

References:

- Official documentation: [Installation Guide - Check if Screen runs](./installation.md#check-if-openrowingmonitor-screen-runs-without-issue-if-installed), [README - Web Interface](./README.md#web-interface)
- Installation scripts: `install/install.sh` (prompts for kiosk setup), `install/webbrowserkiosk.sh` (manual setup), `install/webbrowserkiosk.service` (systemd service)
- GitHub discussions: [Display and touchscreen setup guide](https://github.com/JaapvanEkris/openrowingmonitor/discussions/148)

---

## 15) Strokes are getting lost — diagnostic flow

**Short answer:** Lost strokes can be caused by sensor/signal issues OR incorrect configuration parameters — follow a systematic diagnostic to isolate the problem.

Diagnostic flow (How)

1. **Verify sensor pulses:** Rotate the flywheel by hand and confirm pulses in logs.  
2. **Check sensor hardware:** Verify sensor distance, polarity, and mounting rigidity.
3. **Inspect mechanical setup:** Look for flex/vibration in mounts, try vibration damping mat.  
4. **Review configuration parameters:** Even with clean pulses, wrong `minimumDriveTime`/`minimumRecoveryTime` or `numOfImpulsesPerRevolution` settings can cause missed strokes.
5. **Analyze logs:** Capture a raw trace showing noise filter corrections and phase detection messages.
6. **Share for community review:** If still failing, post your trace and config for community analysis.

Understanding the noise filter log messages:

```text
noise filter corrected currentDt, 0.717792967 was not between 
minimumTimeBetweenImpulses and maximumTimeBetweenImpulses, changed to 0.437900443
```

This means timing was outside expected bounds — could indicate noise, missed pulses, or **incorrect configuration parameters**.

Phase detection log messages:

```text
Time: 0.7407 sec, impuls 2: flank suggests no power (-1413.4 rad/s2), 
but waiting for recoveryPhaseLength (1.2000 sec) to exceed minimumRecoveryTime (1.2 sec)
```

The algorithm is waiting for phase transitions — tune `minimumRecoveryTime` if strokes are being missed even with clean sensor signals.

Community experience

- Many lost-stroke reports were fixed by **adjusting `minimumDriveTime` and calibration parameters** rather than changing sensor hardware.
- For high-speed air rowers with many magnets: stroke detection can fail due to measurement error amplification — filtering parameters need tuning.
- **Configuration is as important as hardware:** Clean signals don't guarantee stroke detection if parameters are wrong for your rower's characteristics.

Paraphrases

- "Why is ORM missing my strokes?"  
- "Strokes not detected intermittently — help"
- "Clean sensor signal but strokes still lost"

Tags: troubleshooting, stroke-detection, configuration, calibration

References:

- Official documentation: [Rower Settings Guide - Stroke Detection](./rower_settings.md#setting-up-stroke-detection), [Architecture - Rowing Engine](./Architecture.md), [Physics of ORM](./physics_openrowingmonitor.md)
- Source code: `app/engine/Flywheel.js`, `app/engine/Rower.js` (stroke detection logic)

---

## 16) Understanding and tuning stroke detection parameters

**Short answer:** Stroke detection relies on timing between impulses and phase detection (drive vs recovery). Key parameters: `minimumTimeBetweenImpulses`, `maximumTimeBetweenImpulses`, `minimumDriveTime`, `minimumRecoveryTime`, `flankLength`, `minimumForceBeforeStroke`, `minimumStrokeQuality`, `autoAdjustDragFactor`.

What / Why / How

- What: The algorithm converts impulse timing into angular velocity, detects acceleration/deceleration flanks, and determines stroke phases.
- Why: Different rowers have vastly different characteristics — calibration is needed.
- How: Start with a profile close to your rower type, record raw data, analyze in spreadsheet if needed, tune parameters based on observed patterns.

Tuning approach:

1. Record raw CSV data
2. Plot in Excel/spreadsheet: time vs angular velocity
3. Identify clear drive/recovery phases visually
4. Adjust flankLength (minimum consecutive confirming samples) and other settings
5. Adjust min/max time bounds based on your flywheel speed
6. Simulate previous rowing sessions for faster tuning

**How to run session simulations:**

Enable session replay in `app/server.js` by uncommenting and modifying the following:

```javascript
import { replayRowingSession } from './recorders/RowingReplayer.js'

// At startup, add:
replayRowingSession(handleRotationImpulse, {
  filename: 'recordings/DKNR320.csv',  // or your recorded CSV file
  realtime: false,                      // true = replay at original speed; false = instant
  loop: false                           // true = loop continuously (requires realtime: true)
})
```

After making parameter changes in `config/config.js`, restart the service to see results instantly without needing to row again:

```bash
sudo systemctl restart openrowingmonitor
journalctl -u openrowingmonitor -f  # View logs with new parameters applied
```

**Finding recorded sessions:**

Recorded raw CSV files are stored in:

- `recordings/` — Example recordings included with ORM (DKNR320.csv, WRX700_2magnets.csv, etc.)
- `~/data/` — Your previous session recordings (if `createRawDataFiles: true` was enabled)

Paraphrases

- "How to tune stroke detection?"
- "What does flankLength mean?"
- "ORM parameters explained"

Tags: calibration, parameters, stroke-detection, advanced

References:

- Official documentation: [Rower Settings Guide - Complete Parameter List](./rower_settings.md), [Physics of ORM](./physics_openrowingmonitor.md), [Architecture](./Architecture.md)
- Configuration files: `config/rowerProfiles.js` (reference profiles), `config/default.config.js` (all available parameters)
- Source code: `app/engine/Flywheel.js` (flank detection implementation)

---

## 17) Older Concept2 rowers (Model C and earlier) — sensor compatibility

**Short answer:** Concept2 Model C and earlier models use coil based sensor that changes resistance based on a magnetic field. These are **not directly compatible** with ORM (or rather with the Rpi). You need to add a new sensor (hall, reed, or optical) to use ORM with these machines.

What / Why / How

- What: Older Concept2 rowers (Model C and earlier) use specialized VR (Variable Reluctance) sensors that output analog sine waves, not digital pulses that ORM expects.
- Why: VR sensors generate AC like voltage proportional which requires amplificaton and coversion to digital signal (e.g. with a comparator)
- How: The factory VR sensor won't work with ORM. You have two options:
  1. **Add a new sensor (recommended):** Install a magnet on the flywheel and add a hall sensor nearby (see [Entry #6](#6-which-hall-sensor-modules-are-known-to-work)). This is the simplest and most reliable approach.
  2. **Signal conditioning (advanced):** If you must use the existing VR sensor, you'll need to amplify the signal and convert it digital with a comparator (so actually simpler to go with new sensor unless you want to keep compatibility with factory monitor at the same time)

Paraphrases

- "Does Concept2 Model C work with ORM?"
- "How to use factory sensor on old Concept2?"
- "Concept2 VR sensor compatibility"

Tags: concept2, sensors, hardware, compatibility, VR-sensor

References:

- Official documentation: [Concept2 RowErg Hardware Setup](./hardware_setup_Concept2_RowErg.md), [Supported Rowers - Concept2 entries](./Supported_Rowers.md)
- Configuration files: `config/rowerProfiles.js` (see Concept2_Model_C and Concept2_RowErg profiles)
- External resources: [MAX9924 Breakout (OSH Park)](https://oshwlab.com/jpbpcb/rower2)
- GitHub discussions: [Concept2 Model B #151](https://github.com/laberning/openrowingmonitor/discussions/151), [Concept2 Model C #157](https://github.com/laberning/openrowingmonitor/discussions/157), [Concept2 setups #38](https://github.com/laberning/openrowingmonitor/discussions/38), [Model C issue #77](https://github.com/laberning/openrowingmonitor/issues/77)

---

## Quick Reference: Common Error Messages

| Error Message | Likely Cause | Fix |
| ------------- | ------------ | --- |
| `*** WARNING: currentDt of X sec is above maximumTimeBetweenImpulses` | Flywheel spinning too slow or sensor missed pulses | Normal during startup/spindown. If persistent during rowing: check sensor alignment, verify magnet strength, ensure secure mounting. May indicate stroke detection issue. |
| `*** WARNING: currentDt of X sec is below minimumTimeBetweenImpulses` | Flywheel spinning too fast or switch bounce | Check `numOfImpulsesPerRevolution` is correct (count magnets). If in startup phase and skipped: adjust `gpioMinimumPulseLength`. Switch bounce: try changing `gpioTriggeredFlank` from 'Up' to 'Down'. |
| `EBUSY: resource busy or locked, write` (GPIO) | GPIO pin already in use or config syntax error | Common cause: missing comma after `gpioPin: 16` should be `gpioPin: 16,`. Also check: touchscreen driver conflicts, change to different pin (e.g., GPIO 16). |
| `ENODEV, No such device` (Bluetooth) | Bluetooth hardware unavailable | Pi model has no BLE (e.g., Pi 2). Solution: set `bluetoothMode: 'OFF'`, `heartRateMode: 'OFF'`, `antplusMode: 'OFF'` in config.js. |
| `file has not been written, as there was not enough data recorded` | Session under 10 seconds | Row for at least 10 seconds. Minimum session time defined in `minimumDataAvailable()` function (10s minimum). |
| `Delta Time trend is upwards, suggests no power, but waiting for drive phase length to exceed minimumDriveTime` | Normal phase detection log | **Not an error** — algorithm waiting for `minimumDriveTime` threshold. Only adjust if strokes consistently missed: lower `minimumDriveTime` slightly (e.g., 0.3s instead of 0.4s). |
| `Delta Time trend is downwards, suggesting power, but waiting for recovery phase length to exceed minimumRecoveryTime` | Normal phase detection log | **Not an error** — algorithm waiting for `minimumRecoveryTime` threshold. Only adjust if recovery phases cut short: lower `minimumRecoveryTime` (e.g., 1.0s instead of 1.2s). |
| `Error: Module did not self-register` or `pigpio error -1 in gpioInitialise` | Incorrect pigpio installation | Run `sudo apt install pigpio` then reinstall ORM. On major Node.js version changes: `cd /opt/openrowingmonitor && npm rebuild`. |
| `Can't lock /var/run/pigpio.pid` | Pigpio daemon already running | Stop daemon: `sudo killall pigpiod`. ORM runs pigpio in-process, doesn't need daemon. |
| Config parse error (unexpected token) | JavaScript syntax error in config.js | Check for missing trailing commas or formatting error in config object. Valid: `gpioPin: 16,` Invalid: `gpioPin: 16` (missing comma before next property). You can use any online tool to validate |
