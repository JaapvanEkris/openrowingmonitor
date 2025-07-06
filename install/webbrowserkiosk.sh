#!/bin/bash
#
#  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
#
#  Runs the Web Frontend in a Firefox browser in fullscreen kiosk mode
#
xset s off
xset s noblank
xset -dpms
openbox-session &

# Start Firefox in kiosk mode
nice -n 5 firefox --display=:0 --kiosk-monitor 0 --kiosk http://127.0.0.1/?mode=kiosk
