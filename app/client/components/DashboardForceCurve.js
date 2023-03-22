'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Component that renders a metric of the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property } from 'lit/decorators.js'
import Chart from 'chart.js/auto'

@customElement('dashboard-force-curve')
export class DashboardForceCurve extends AppElement {
  static styles = css`
    canvas {
      margin-top: 24px;
    }
  `
  @property({ type: Object })
    value = []

  chart

  firstUpdated () {
    const ctx = this.renderRoot.querySelector('#chart').getContext('2d')
    this.chart = new Chart(
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
            legend: {
              title: {
                display: true,
                text: 'Force Curve',
                color: 'rgb(255,255,255)',
                font: {
                  size: 32
                },
                padding: {
                }
              },
              labels: {
                boxWidth: 0,
                font: {
                  size: 0
                }
              }
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
    if (this.chart?.data) {
      this.chart.data.datasets[0].data = this.value?.map((data, index) => ({ y: data, x: index }))
      this.forceCurve = this.value
      this.chart.update()
    }

    return html`
    <canvas id="chart"></canvas>
    `
  }
}