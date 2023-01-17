# Known rowers and their support status

| Brand | Type | Rower type | Measurement type | HW Modification needed | Support status | Rower profile | Basic Metrics | Advanced Metrics | Limitations | Remarks |
| ----- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| Abilica | Winrower 2.0 | Air rower | Handle drive wheel | No | Known to work | - | Yes | No | Static distance | see [this discussion](https://github.com/laberning/openrowingmonitor/discussions/48) |
| Concept 2 | Model B, C | Air rower | Flywheel | Modification to electrical signal | In development | - | - | - | - | [Concept 2 Model C discussion](https://github.com/laberning/openrowingmonitor/issues/77) |
| | Model D, E | Air rower | Flywheel | Modification to electrical signal | Active support | Concept2_RowErg | Yes | Yes | None | [Concept 2 Model D, Model E and RowErg setup](hardware_setup_Concept2_RowErg.md) |
| | RowErg | Air rower | Flywheel | Modification to electrical signal | Active support | Concept2_RowErg | Yes | Yes | None | [Concept 2 Model D, Model E and RowErg setup](hardware_setup_Concept2_RowErg.md) |
| Decathlon | Rower 120 | Physical friction | Flywheel | Adding sensor and adding magnets to the flywheel | In development | - | - | - | - | see [this discussion](https://github.com/laberning/openrowingmonitor/issues/110) |
| DKN | R-320 | Air Rower | Flywheel | No | Full support | DKN_R320 | Yes | No | Static drag | - |
| FDF | Neon Pro V | Air rower | Flywheel | Sensor replacement | Known to work | - | Yes | - | - | - | see [this discussion](https://github.com/laberning/openrowingmonitor/discussions/87) |
| ForceUSA | R3 | Air Rower | Flywheel | No | Supported | ForceUSA_R3 | Yes | Yes | None | - |
| NordicTrack | RX800 | Hybrid Magnetic and Air rower | Flywheel | None | Full support | NordicTrack_RX800 | Yes | Yes | None | Also known under ProForm brand |
| Sportplus | MR-SP-08 | Water rower | Handle drive wheel | In development | - | - | - | - | see [this discussion](https://github.com/laberning/openrowingmonitor/discussions/95) |
| Sportstech | WRX700 | Water rower | Impellor | Add one magnet | Active support | Sportstech_WRX700 | Yes | Yes | Static drag | see [Sportstech WRX700 setup](hardware_setup_WRX700.md)
| White label | Air Rower | Air rower | Fywheel | None | Supported | Generic_Air_Rower | Yes | Yes | None | Sold under different brand names |
| Open ergo | - | Air rower | Flywheel | Addition of magnets en sensor | Known to work | - | Yes | Yes | None | Machine specific profile is needed, but is done before, see [example 1](https://github.com/laberning/openrowingmonitor/discussions/80), [example 2](https://github.com/laberning/openrowingmonitor/discussions/105) and [example 3](https://github.com/laberning/openrowingmonitor/discussions/115) |

If your machine isn't listed, it just means that you need to [adjust the software settings following the settings adjustment guide](rower_settings.md) yourself. But don't worry, in the [GitHub Discussions](https://github.com/laberning/openrowingmonitor/discussions) there always are friendly people to help you set up your machine and the settings.

## Support status
* **Active support**: These are the testmachines of the developers, these are tested almost on a daily basis. These settings are automatically modified to facilitate updates of the rowing engine;
* **Full support**: We actively maintain a the configuration, including automatically updating these settings to facilitate chages of the rowing engine, and are part of the regression test set;
* **Supported**: Users have reported a working configuration, and this configuration is part of `rowerProfiles.js`, but we lack the raw data samples to maintain the rower for future updates;
* **Configuration known**: Users have reported a working configuration, but it isn't actively supported by these users;
* **Known to work**: Users have reported that the rower is known to work, but the configuration is not known by us;
* **In development**: Users are known to be working to get the rower connected, but the configuration is not yet known by us.

Please note: the support status largely depends on the willingness of users to report their settings and provide decent samples of their data. So when you have a machine, please provide this information.

## Basic Metrics
Basic metrics include:
* Distance rowed,
* Training Duration,
* Power,
* Pace,
* Strokes per Minute,
* Drive time,
* Recovery Time,
* Calories used,
* Total number of strokes,
* Heart Rate

## Extended Metrics
Extended metrics include:
* Drag factor,
* Drive length,
* Average handle force,
* Peak handle force,
* Handle force curve,
* Handle velocity curve,
* Handle power curve.

## Limitations
* **None**: No limitations, drag calculation and distance per stroke are dynamic based on flywheel behaviour and automatically adapt to environmental conditions;
* **Static drag**: the drag calculation is fixed, so changes in air/water properties due to temperature or settings are not automatically adjusted;
* **Static distance**: the distance per impulse is fixed, thus making the measurement of a more forceful stroke impossible.
