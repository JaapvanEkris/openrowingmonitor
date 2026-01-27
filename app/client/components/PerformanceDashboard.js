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
      display: grid;
      grid-template-rows: auto 1fr;
      height: 100vh;
      gap: 1vw;
      box-sizing: border-box;
    }

    .metrics-grid {
      display: grid;
      gap: 1vw;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
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

    dashboard-metric,
    dashboard-force-curve {
      background: var(--theme-widget-color);
      text-align: center;
      padding: 0.5em 0.2em 0;
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

    const gridClass = this.appState.config.guiConfigs.maxNumberOfTiles === 12 ? 'rows-3' : ''

    return html`
      <dashboard-toolbar .config=${this.appState.config}></dashboard-toolbar>
      <section class="metrics-grid ${gridClass}">${metricConfig}</section>
    `
  }
}
