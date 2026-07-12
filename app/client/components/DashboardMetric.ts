/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Component that renders a metric of the dashboard
*/

import { AppElement, html, css } from './AppElement'
import { customElement, property } from 'lit/decorators.js'

@customElement('dashboard-metric')
export class DashboardMetric extends AppElement {
  static styles = css`
    .label, .content {
      padding: 0.1em 0;
    }

    .icon {
      height: 1.8em;
    }

    .metric-value {
        font-size: 150%;
    }

    .metric-value.with-icon {
        font-size: 200%;
    }

    .metric-unit {
        font-size: 80%;
    }
  `

  @property({ type: Object })
  icon: unknown = ''

  @property({ type: String })
  unit = ''

  @property({ type: String })
  value: string | number | undefined

  render () {
    const hasIcon = this.icon !== ''
    return html`
      <div class="${hasIcon ? 'icon' : 'label'}">
        ${this.icon}
        <slot></slot>
      </div>
      <div class="content">
        <span class="metric-value ${hasIcon ? 'with-icon' : ''}">
          ${this.value !== undefined ? this.value : '--'}
        </span>
        <span class="metric-unit">${this.unit}</span>
      </div>
    `
  }
}
