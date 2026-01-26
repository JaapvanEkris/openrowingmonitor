'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Toolbar component combining settings and action buttons
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, state } from 'lit/decorators.js'
import { iconSettings, iconUndo, iconExpand, iconCompress, iconPoweroff, iconBluetooth, iconUpload, iconHeartbeat, iconAntplus } from '../lib/icons.js'
import './SettingsDialog.js'
import './AppDialog.js'

@customElement('dashboard-toolbar')
export class DashboardToolbar extends AppElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--theme-widget-color);
      padding: 0.3em 0.5em;
      border-radius: var(--theme-border-radius);
      gap: 0.5em;
    }

    .button-group {
      display: flex;
      gap: 0.3em;
      align-items: center;
      flex-wrap: wrap;
    }

    button {
      position: relative;
      outline: none;
      background-color: var(--theme-button-color);
      border: 0;
      border-radius: var(--theme-border-radius);
      color: var(--theme-font-color);
      font-size: 0.4em;
      text-decoration: none;
      display: inline-flex;
      width: 2.5em;
      min-width: 2.5em;
      height: 2.5em;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }

    button:hover {
      filter: brightness(150%);
    }

    button > div.text {
      position: absolute;
      left: 2px;
      bottom: 2px;
      font-size: 40%;
    }

    .icon {
      height: 1.2em;
    }

    .peripheral-mode-container {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: 0.1em;
    }

    .peripheral-mode {
      font-size: 0.3em;
      text-align: center;
    }

    #fullscreen-icon {
      display: inline-flex;
    }

    #windowed-icon {
      display: none;
    }

    @media (display-mode: fullscreen) {
      #fullscreen-icon {
        display: none;
      }
      #windowed-icon {
        display: inline-flex;
      }
    }
  `

  @property({ type: Object })
    config = {}

  @state()
    _appMode = 'BROWSER'

  @state()
    _dialog

  render () {
    return html`
      <div class="button-group">
        <button @click=${this.openSettings} title="Settings">
          ${iconSettings}
        </button>
        <button @click=${this.reset} title="Reset">
          ${iconUndo}
        </button>
        ${this.renderOptionalButtons()}
      </div>

      <div class="button-group">
        <button @click=${this.switchHrmPeripheralMode} title="Heart Rate Monitor">
          ${iconHeartbeat}
          <div class="text">${this.config?.hrmPeripheralMode}</div>
        </button>
        <button @click=${this.switchAntPeripheralMode} title="ANT+ Mode">
          ${iconAntplus}
          <div class="text">${this.config?.antPeripheralMode}</div>
        </button>
        <div class="peripheral-mode-container">
          <button @click=${this.switchBlePeripheralMode} title="Bluetooth Mode">
            ${iconBluetooth}
          </button>
          <div class="peripheral-mode">${this.blePeripheralMode()}</div>
        </div>
      </div>

      ${this._dialog ? this._dialog : ''}
    `
  }

  firstUpdated () {
    switch (new URLSearchParams(window.location.search).get('mode')) {
      case 'standalone':
        this._appMode = 'STANDALONE'
        break
      case 'kiosk':
        this._appMode = 'KIOSK'
        break
      default:
        this._appMode = 'BROWSER'
    }
  }

  renderOptionalButtons () {
    const buttons = []
    if (this._appMode === 'BROWSER' && document.documentElement.requestFullscreen) {
      buttons.push(html`
        <button @click=${this.toggleFullscreen} title="Toggle Fullscreen">
          <div id="fullscreen-icon">${iconExpand}</div>
          <div id="windowed-icon">${iconCompress}</div>
        </button>
      `)
    }
    if (this._appMode === 'KIOSK' && this.config?.shutdownEnabled) {
      buttons.push(html`
        <button @click=${this.shutdown} title="Shutdown">${iconPoweroff}</button>
      `)
    }
    if (this.config?.uploadEnabled) {
      buttons.push(html`
        <button @click=${this.uploadTraining} title="Upload Training">${iconUpload}</button>
      `)
    }
    return buttons
  }

  blePeripheralMode () {
    const value = this.config?.blePeripheralMode
    switch (value) {
      case 'PM5':
        return 'C2 PM5'
      case 'FTMSBIKE':
        return 'FTMS Bike'
      case 'CSC':
        return 'Bike Speed + Cadence'
      case 'CPS':
        return 'Bike Power'
      case 'FTMS':
        return 'FTMS Rower'
      default:
        return 'Off'
    }
  }

  openSettings () {
    this._dialog = html`<settings-dialog .config=${this.config.guiConfigs} @close=${() => {
      this._dialog = undefined
    }}></settings-dialog>`
  }

  toggleFullscreen () {
    const fullscreenElement = document.getElementsByTagName('web-app')[0]
    if (!document.fullscreenElement) {
      fullscreenElement.requestFullscreen({ navigationUI: 'hide' })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  reset () {
    this.sendEvent('triggerAction', { command: 'reset' })
  }

  switchBlePeripheralMode () {
    this.sendEvent('triggerAction', { command: 'switchBlePeripheralMode' })
  }

  switchAntPeripheralMode () {
    this.sendEvent('triggerAction', { command: 'switchAntPeripheralMode' })
  }

  switchHrmPeripheralMode () {
    this.sendEvent('triggerAction', { command: 'switchHrmMode' })
  }

  uploadTraining () {
    this._dialog = html`
      <app-dialog @close=${(event) => {
        this._dialog = undefined
        if (event.detail === 'confirm') {
          this.sendEvent('triggerAction', { command: 'upload' })
        }
      }}>
        <legend>${iconUpload}<br/>Upload training?</legend>
        <p>Do you want to finish your workout and upload it to webservices (Strava, Intervals.icu and RowsAndAll)?</p>
      </app-dialog>
    `
  }

  shutdown () {
    this._dialog = html`
      <app-dialog @close=${(event) => {
        this._dialog = undefined
        if (event.detail === 'confirm') {
          this.sendEvent('triggerAction', { command: 'shutdown' })
        }
      }}>
        <legend>${iconPoweroff}<br/>Shutdown Open Rowing Monitor?</legend>
        <p>Do you want to shutdown the device?</p>
      </app-dialog>
    `
  }
}
