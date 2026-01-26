'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Component that renders the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property } from 'lit/decorators.js'
import './DashboardToolbar.js'
import { DASHBOARD_METRICS } from '../store/dashboardMetrics.js'

@customElement('performance-dashboard')
export class PerformanceDashboard extends AppElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      padding: 1vw;
      gap: 1vw;
    }

    .metrics-grid {
      display: grid;
      flex: 1;
      grid-gap: 1vw;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (orientation: portrait) {
      .metrics-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-rows: repeat(4, minmax(0, 1fr));
      }
    }

    dashboard-metric, dashboard-force-curve {
      background: var(--theme-widget-color);
      text-align: center;
      position: relative;
      padding: 0.5em 0.2em 0 0.2em;
      border-radius: var(--theme-border-radius);
    }
  `
  @property()
    appState = {}

  dashboardMetricComponentsFactory = (appState) => {
    const metrics = appState.metrics
    const configs = appState.config

    const dashboardMetricComponents = Object.keys(DASHBOARD_METRICS).reduce((dashboardMetrics, key) => {
      dashboardMetrics[key] = DASHBOARD_METRICS[key].template(metrics, configs)

      return dashboardMetrics
    }, {})

    return dashboardMetricComponents
  }

  render () {
    const metricConfig = [...new Set(this.appState.config.guiConfigs.dashboardMetrics)].reduce((prev, metricName) => {
      prev.push(this.dashboardMetricComponentsFactory(this.appState)[metricName])
      return prev
    }, [])

    return html`
      <dashboard-toolbar .config=${this.appState.config}></dashboard-toolbar>
      
      <div class="metrics-grid">
        <style type="text/css">
          .metrics-grid {
            ${this.appState.config.guiConfigs.maxNumberOfTiles === 12 ? 'grid-template-rows: repeat(3, minmax(0, 1fr));' : 'grid-template-rows: repeat(2, minmax(0, 1fr));'}
          }
        </style>
        ${metricConfig}
      </div>
    `
  }
}
