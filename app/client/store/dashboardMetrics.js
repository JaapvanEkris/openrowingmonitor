'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/

import { html } from 'lit'
import { formatDistance, formatNumber, secondsToTimeString } from '../lib/helper'
import { iconBolt, iconClock, iconAlarmclock, iconFire, iconHeartbeat, iconPaddle, iconRoute, iconStopwatch, rowerIcon } from '../lib/icons'
import '../components/DashboardForceCurve.js'
import '../components/DashboardActions.js'
import '../components/DashboardMetric.js'
import '../components/BatteryIcon.js'

export const DASHBOARD_METRICS = {
  distance: {
    displayName: 'Distance',
    size: 1,
    template: (metrics, config) => {
      let distance
      switch (true) {
        case (metrics?.interval?.type === 'rest' && metrics?.pauseCountdownTime > 0):
          distance = 0
          break
        case (metrics?.interval?.type === 'distance'):
          distance = Math.max(metrics?.interval?.distance?.toEnd, 0)
          break
        default:
          distance = Math.max(metrics?.interval?.distance?.fromStart, 0)
      }
      const linearDistance = formatDistance(distance ?? 0)

      return simpleMetricFactory(linearDistance.distance, linearDistance.unit, config?.guiConfigs?.showIcons ? iconRoute : '')
    }
  },

  pace: { displayName: 'Pace/500', size: 1, template: (metrics, config) => simpleMetricFactory(secondsToTimeString(metrics?.cyclePace), '/500m', config?.guiConfigs?.showIcons ? iconStopwatch : '') },

  power: { displayName: 'Power', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.cyclePower), 'watt', config?.guiConfigs?.showIcons ? iconBolt : '') },

  stkRate: { displayName: 'Stroke rate', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.cycleStrokeRate), '/min', config?.guiConfigs?.showIcons ? iconPaddle : '') },
  heartRate: {
    displayName: 'Heart rate',
    size: 1,
    template: (metrics, config) => html`<dashboard-metric .icon=${config?.guiConfigs?.showIcons ? iconHeartbeat : ''} unit="bpm" .value=${formatNumber(metrics?.heartrate)}>
      ${metrics?.heartRateBatteryLevel > 0 ?
        html`<battery-icon .batteryLevel=${metrics?.heartRateBatteryLevel}></battery-icon>` :
        ''}
    </dashboard-metric>`
  },

  totalStk: { displayName: 'Total strokes', size: 1, template: (metrics, config) => simpleMetricFactory(metrics?.totalNumberOfStrokes, 'stk', config?.guiConfigs?.showIcons ? iconPaddle : '') },

  calories: {
    displayName: 'Calories',
    size: 1,
    template: (metrics, config) => {
      const calories = metrics?.interval?.type === 'Calories' ? Math.max(metrics?.interval?.TargetCalories - metrics?.interval?.Calories, 0) : metrics?.totalCalories

      return simpleMetricFactory(formatNumber(calories ?? 0), 'kcal', config?.guiConfigs?.showIcons ? iconFire : '')
    }
  },

  timer: {
    displayName: 'Timer',
    size: 1,
    template: (metrics, config) => {
      let time
      let icon
      switch (true) {
        case (metrics?.interval?.type === 'rest' && metrics?.pauseCountdownTime > 0):
          time = metrics?.pauseCountdownTime
          icon = iconAlarmclock
          break
        case (metrics?.interval?.type === 'time'):
          time = Math.max(metrics?.interval?.movingTime?.toEnd, 0)
          icon = iconClock
          break
        default:
          time = Math.max(metrics?.interval?.movingTime?.sinceStart, 0)
          icon = iconClock
      }

      return simpleMetricFactory(secondsToTimeString(time ?? 0), '', config?.guiConfigs?.showIcons ? icon : '')
    }
  },

  distancePerStk: { displayName: 'Dist per Stroke', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.cycleDistance, 1), 'm', config?.guiConfigs?.showIcons ? rowerIcon : '') },

  dragFactor: { displayName: 'Drag factor', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.dragFactor), '', config?.guiConfigs?.showIcons ? 'Drag' : '') },

  driveLength: { displayName: 'Drive length', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.driveLength, 2), 'm', config?.guiConfigs?.showIcons ? 'Drive' : '') },

  driveDuration: { displayName: 'Drive duration', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.driveDuration, 2), 'sec', config?.guiConfigs?.showIcons ? 'Drive' : '') },

  recoveryDuration: { displayName: 'Recovery duration', size: 1, template: (metrics, config) => simpleMetricFactory(formatNumber(metrics?.recoveryDuration, 2), 'sec', config?.guiConfigs?.showIcons ? 'Recovery' : '') },

  forceCurve: { displayName: 'Force curve', size: 2, template: (metrics) => html`<dashboard-force-curve .value=${metrics?.driveHandleForceCurve} style="grid-column: span 2"></dashboard-force-curve>` },

  actions: { displayName: 'Actions', size: 1, template: (_, config) => html`<dashboard-actions .config=${config}></dashboard-actions>` }
}

/**
  * Helper function to create a simple metric tile
  * @param {string | number} value The metric to show
  * @param {string} unit The unit of the metric.
  * @param {string | import('lit').TemplateResult<2>} icon The number of decimal places to round to (default: 0).
*/
function simpleMetricFactory (value = '--', unit = '', icon = '') {
  return html`<dashboard-metric .icon=${icon} .unit=${unit} .value=${value}></dashboard-metric>`
}
