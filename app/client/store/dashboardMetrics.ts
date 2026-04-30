/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 */

import { html, TemplateResult } from 'lit'
import { formatDistance, formatNumber, secondsToTimeString } from '../lib/helper'
import { iconBolt, iconClock, iconAlarmclock, iconFire, iconHeartbeat, iconPaddle, iconRoute, iconStopwatch, rowerIcon } from '../lib/icons'
import '../components/DashboardForceCurve'
import '../components/DashboardMetric'
import '../components/BatteryIcon'
import type { DashboardMetricDefinition } from './types'

export const DASHBOARD_METRICS: Record<string, DashboardMetricDefinition> = {
  distance: {
    displayName: 'Distance',
    size: 1,
    template: (metrics, config, onWorkoutOpen, slotContent = '') => {
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

      return html`<dashboard-metric
        style="${onWorkoutOpen ? 'cursor:pointer' : ''}"
        @click=${onWorkoutOpen ? () => onWorkoutOpen('distance') : undefined}
        .icon=${config?.guiConfigs?.showIcons ? iconRoute : ''}
        .unit=${linearDistance.unit}
        .value=${linearDistance.distance}
      >
        ${slotContent}
      </dashboard-metric>`
    }
  },

  pace: { displayName: 'Pace/500', size: 1, template: (metrics, config, _onWorkoutOpen, slotContent = '') => simpleMetricFactory(secondsToTimeString(metrics?.cyclePace), '/500m', config?.guiConfigs?.showIcons ? iconStopwatch : '', slotContent) },

  power: { displayName: 'Power', size: 1, template: (metrics, config, _onWorkoutOpen, slotContent = '') => simpleMetricFactory(formatNumber(metrics?.cyclePower), 'watt', config?.guiConfigs?.showIcons ? iconBolt : '', slotContent) },

  stkRate: { displayName: 'Stroke rate', size: 1, template: (metrics, config, _onWorkoutOpen, slotContent = '') => simpleMetricFactory(formatNumber(metrics?.cycleStrokeRate), '/min', config?.guiConfigs?.showIcons ? iconPaddle : '', slotContent) },
  heartRate: {
    displayName: 'Heart rate',
    size: 1,
    template: (metrics, config, _onWorkoutOpen, slotContent = '') => html`<dashboard-metric .icon=${config?.guiConfigs?.showIcons ? iconHeartbeat : ''} unit="bpm" .value=${formatNumber(metrics?.heartrate)}>
      ${(metrics?.heartRateBatteryLevel ?? 0) > 0 ?
        html`<battery-icon .batteryLevel=${metrics?.heartRateBatteryLevel}></battery-icon>` :
        ''}
      ${slotContent}
    </dashboard-metric>`
  },

  totalStk: { displayName: 'Total strokes', size: 1, template: (metrics, config, _onWorkoutOpen, slotContent = '') => simpleMetricFactory(metrics?.interval?.numberOfStrokes, 'stk', config?.guiConfigs?.showIcons ? iconPaddle : '', slotContent) },

  calories: {
    displayName: 'Calories',
    size: 1,
    template: (metrics, config, onWorkoutOpen, slotContent = '') => {
      const calories = metrics?.interval?.type === 'calories' ? Math.max(metrics?.interval?.calories?.toEnd ?? 0, 0) : Math.max(metrics?.interval?.calories?.sinceStart ?? 0, 0)

      return html`<dashboard-metric
        style="${onWorkoutOpen ? 'cursor:pointer' : ''}"
        @click=${onWorkoutOpen ? () => onWorkoutOpen('calories') : undefined}
        .icon=${config?.guiConfigs?.showIcons ? iconFire : ''}
        .unit=${'kcal'}
        .value=${formatNumber(calories ?? 0)}
      >
        ${slotContent}
      </dashboard-metric>`
    }
  },

  timer: {
    displayName: 'Timer',
    size: 1,
    template: (metrics, config, onWorkoutOpen, slotContent = '') => {
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

      return html`<dashboard-metric
        style="${onWorkoutOpen ? 'cursor:pointer' : ''}"
        @click=${onWorkoutOpen ? () => onWorkoutOpen('time') : undefined}
        .icon=${config?.guiConfigs?.showIcons ? icon : ''}
        .unit=${''}
        .value=${secondsToTimeString(time ?? 0)}
      >
        ${slotContent}
      </dashboard-metric>`
    }
  },

  distancePerStk: { displayName: 'Dist per Stroke', size: 1, template: (metrics, config, _onWorkoutOpen, slotContent = '') => simpleMetricFactory(formatNumber(metrics?.cycleDistance, 1), 'm', config?.guiConfigs?.showIcons ? rowerIcon : '', slotContent) },

  dragFactor: { displayName: 'Drag factor', size: 1, template: (metrics, config, _onWorkoutOpen, slotContent = '') => simpleMetricFactory(formatNumber(metrics?.dragFactor), '', config?.guiConfigs?.showIcons ? 'Drag' : '', slotContent) },

  driveLength: { displayName: 'Drive length', size: 1, template: (metrics, config, _onWorkoutOpen, slotContent = '') => simpleMetricFactory(formatNumber(metrics?.driveLength, 2), 'm', config?.guiConfigs?.showIcons ? 'Drive' : '', slotContent) },

  driveDuration: { displayName: 'Drive duration', size: 1, template: (metrics, config, _onWorkoutOpen, slotContent = '') => simpleMetricFactory(formatNumber(metrics?.driveDuration, 2), 'sec', config?.guiConfigs?.showIcons ? 'Drive' : '', slotContent) },

  recoveryDuration: { displayName: 'Recovery duration', size: 1, template: (metrics, config, _onWorkoutOpen, slotContent = '') => simpleMetricFactory(formatNumber(metrics?.recoveryDuration, 2), 'sec', config?.guiConfigs?.showIcons ? 'Recovery' : '', slotContent) },

  forceCurve: { displayName: 'Force curve', size: 2, template: (metrics, config, _onWorkoutOpen, slotContent = '') => html`
    <dashboard-force-curve
      .updateForceCurve=${metrics.metricsContext?.isRecoveryStart}
      .value=${metrics?.driveHandleForceCurve}
      .divisionMode=${config?.guiConfigs?.forceCurveDivisionMode ?? 0}
    >
      ${slotContent}
    </dashboard-force-curve>
  ` },

  peakForce: { displayName: 'Peak Force', size: 1, template: (metrics, _config, _onWorkoutOpen, slotContent = '') => simpleMetricFactory(formatNumber(metrics?.drivePeakHandleForce), 'N', 'Peak Force', slotContent) },

  strokeRatio: {
    displayName: 'Stroke Ratio',
    size: 1,
    template: (metrics, _config, _onWorkoutOpen, slotContent = '') => {
      // Check to make sure both values are truthy
      // no 0, null, or undefined
      const driveDuration = metrics?.driveDuration
      const recoveryDuration = metrics?.recoveryDuration
      let ratio

      if (driveDuration && recoveryDuration) {
        ratio = `1:${(recoveryDuration / driveDuration).toFixed(1)}`
      } else {
        ratio = undefined
      }

      return simpleMetricFactory(ratio, '', 'Ratio', slotContent)
    }
  }
}

/**
  * Helper function to create a simple metric tile
  * @param value The metric to show
  * @param unit The unit of the metric.
  * @param icon The icon or label to display.
  * @param slotContent Optional content to render inside the metric slot (e.g. retile controls).
*/
function simpleMetricFactory (value: string | number | undefined = '--', unit = '', icon: string | TemplateResult = '', slotContent: TemplateResult | string = '') {
  return html`<dashboard-metric .icon=${icon} .unit=${unit} .value=${value}>${slotContent}</dashboard-metric>`
}
