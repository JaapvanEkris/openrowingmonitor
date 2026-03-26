/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Component that renders the dashboard
*/

import { AppElement, html, css, TemplateResult } from './AppElement'
import { customElement, property, state } from 'lit/decorators.js'
import './DashboardToolbar'
import './WorkoutDialog'
import { DASHBOARD_METRICS } from '../store/dashboardMetrics'

@customElement('performance-dashboard')
export class PerformanceDashboard extends AppElement {
  static styles = css`
    :host {
      display: grid;
      grid-template:
        "toolbar" auto
        "metrics" 1fr
        / 1fr;
      height: 100vh;
      gap: 1vw;
      box-sizing: border-box;
    }

    dashboard-toolbar {
      grid-area: toolbar;
    }

    .metrics-grid {
      grid-area: metrics;
      display: grid;
      gap: 1vw;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      min-height: 0; /* prevent grid blowout */
    }

    .metrics-grid.rows-3 {
      grid-template-rows: repeat(3, 1fr);
    }

    @media (orientation: portrait) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(4, 1fr);
      }

      .metrics-grid.rows-3 {
        grid-template-rows: repeat(6, 1fr);
      }
    }

    /* This should be defined within the component */
    dashboard-metric,
    dashboard-force-curve {
      background: var(--theme-widget-color);
      text-align: center;
      padding: 0.2em;
      border-radius: var(--theme-border-radius);
      position: relative;
      min-height: 0; /* prevent grid blowout */
    }
  `
  @property()
  appState: Record<string, any> = {}

  @state()
  _dialog?: TemplateResult

  _handleWorkoutOpen = (type: string) => {
    this.sendEvent('workout-open', type)
    this._dialog = html`
      <workout-dialog
        .type=${type}
        @close=${() => { this._dialog = undefined }}
      ></workout-dialog>
    `
  }

  dashboardMetricComponentsFactory = (appState: Record<string, any>) => {
    const metrics = appState.metrics
    const configs = appState.config

    const dashboardMetricComponents: Record<string, unknown> = Object.keys(DASHBOARD_METRICS).reduce((dashboardMetrics: Record<string, unknown>, key) => {
      dashboardMetrics[key] = DASHBOARD_METRICS[key].template(metrics, configs, this._handleWorkoutOpen)

      return dashboardMetrics
    }, {})

    return dashboardMetricComponents
  }

  render () {
    const metricConfig = [...new Set(this.appState.config.guiConfigs.dashboardMetrics as string[])].reduce((prev: unknown[], metricName) => {
      prev.push(this.dashboardMetricComponentsFactory(this.appState)[metricName])
      return prev
    }, [])

    const gridClass = this.appState.config.guiConfigs.maxNumberOfTiles === 12 ? 'rows-3' : ''

    return html`
      <dashboard-toolbar .config=${this.appState.config}></dashboard-toolbar>
      <section class="metrics-grid ${gridClass}">${metricConfig}</section>
      ${this._dialog ? this._dialog : ''}
    `
  }
}
