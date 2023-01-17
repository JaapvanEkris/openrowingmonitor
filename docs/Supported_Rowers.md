# Known rowers and their support status

See table:

| Brand | Type | Rower type | Measurement type | HW Modification needed | Support status | Rower profile | Basic Metrics | Advanced Metrics | Limitations | Remarks |



* FDF Neon Pro V rower: known to work, see [this discussion](https://github.com/laberning/openrowingmonitor/discussions/87);
* ForceUSA R3: supported Air rower, dynamic drag calculation and all metrics available including force curves;
* NordickTrack RX800: fully supported hybrid Magnetic/Air rower, dynamic drag calculation and all metrics available including force curves;
* Sportplus MR-SP-08: work in progress, see [this discussion](https://github.com/laberning/openrowingmonitor/discussions/95);
* [Sportstech WRX700](hardware_setup_WRX700.md): fully supported water rower, static drag calculation, all metrics available including force curves;
* [OpenErgo machines](https://openergo.webs.com/): several machines have been made to work, see [example 1](https://github.com/laberning/openrowingmonitor/discussions/80), [example 2](https://github.com/laberning/openrowingmonitor/discussions/105) and [example 3](https://github.com/laberning/openrowingmonitor/discussions/115)

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
* Time
* Distance
* Power
* 

## Limitations
* **None**: No limitations, drag calculation and distance per stroke are dynamic based on flywheel behaviour;
* **Static drag**: the drag calculation is fixed, so changes in air/water properties due to temperature or settings are not automatically adjusted;
* **Static distance**: the distance per impulse is fixed, thus making the measurement of a more forceful stroke impossible.
