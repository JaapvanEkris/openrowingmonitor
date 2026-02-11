'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Component that renders a metric of the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, state } from 'lit/decorators.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Chart, Filler, Legend, LinearScale, LineController, LineElement, PointElement } from 'chart.js'

@customElement('dashboard-force-curve')
export class DashboardForceCurve extends AppElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
    }

    .title {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      font-size: 80%;
      text-align: center;
      padding: 0.2em 0;
      z-index: 1;  /* ensures title stays above canvas */
    }

    canvas {
      width: 100%;
      height: 100%;
    }
  `

  constructor () {
    super()
    Chart.register(ChartDataLabels, Legend, Filler, LinearScale, LineController, PointElement, LineElement)
  }

  @property({
    type: Boolean,
  })
    updateForceCurve = false

  @property({
    type: Array,
  })
    value = []


  @state()
    _chart

  shouldUpdate () {
    return this.updateForceCurve
  }
    
  willUpdate () {
    if (this._chart?.data) {
      this._chart.data.datasets[0].data = this.value?.map((data, index) => ({ y: data, x: index }))
    }
  }
  
  // Updated runs _after_ DOM elements exist, which is what chart.js expects.
  updated() {
    this._chart.update()
  }

  firstUpdated () {
    const ctx = this.renderRoot.querySelector('#chart').getContext('2d')
    this._chart = new Chart(
      ctx,
      {
        type: 'line',
        data: {
          datasets: [
            {
              fill: true,
              data: this.value?.map((data, index) => ({ y: data, x: index })),
              pointRadius: 1,
              borderColor: 'rgb(255,255,255)',
              backgroundColor: 'rgb(220,220,220)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              display: false
            },
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              type: 'linear',
              display: false
            },
            y: {
              ticks: {
                color: 'rgb(255,255,255)'
              }
            }
          },
          animations: {
            tension: {
              duration: 200,
              easing: 'easeInQuad'
            },
            y: {
              duration: 200,
              easing: 'easeInQuad'
            },
            x: {
              duration: 200,
              easing: 'easeInQuad'
            }
          }
        }
      }
    )
  }

  render () {
    return html`
      <!== Only show label if no chart -->
      ${this._chart && this._chart?.data.datasets[0].data.length ?
        '' :
        html`<div class="title"> Force Curve </div>`
      }
      <canvas id="chart"></canvas>
    `
  }
}
