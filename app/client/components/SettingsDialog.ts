/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Component that renders the action buttons of the dashboard
*/

import { AppElement, html, css } from './AppElement'
import { customElement, property, query, state } from 'lit/decorators.js'
import { iconSettings } from '../lib/icons'
import './AppDialog'
import type { GuiConfig } from '../store/types'

@customElement('settings-dialog')
export class DashboardActions extends AppElement {
  static styles = css`
    .settings-dialog {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .grid-config {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .grid-config fieldset {
      border: 1px solid var(--theme-font-color);
      border-radius: var(--theme-border-radius);
      padding: 6px 10px;
    }

    .grid-config legend {
      font-size: 0.6em;
      text-align: left;
    }

    .grid-config label {
      display: flex;
      flex-direction: column;
      font-size: 0.6em;
      margin-top: 6px;
    }

    .grid-config input[type="range"] {
      width: 100%;
      cursor: pointer;
    }

    input[type="checkbox"] {
      cursor: pointer;
      align-self: center;
      width: 1.5em;
      height: 1.5em;
    }

    label > span {
      cursor: pointer;
      -webkit-user-select: none;
      user-select: none;
    }

    .icon {
      height: 1.6em;
    }

    .dialog-title {
      text-align: center;
    }

    .show-icons-selector {
      display: flex;
      gap: 8px;
    }

    .experimental-settings {
      display: flex;
      flex-direction: column;
    }

    .experimental-settings label {
      width: fit-content;
      margin-top: 8px;
      font-size: 0.7em;
    }

    app-dialog > *:last-child {
      margin-bottom: -24px;
    }
  `

  @property({ type: Object })
   config!: GuiConfig

  @query('input[name="showIcons"]')
  _showIconInput!: HTMLInputElement

  @query('input[name="trueBlackTheme"]')
  _trueBlackThemeInput!: HTMLInputElement

  @state()
  _columns = 4

  @state()
  _rows = 2

  @state()
  _isPortrait = false

  @state()
  _showIcons = true

  @state()
  _trueBlackTheme = false

  _orientationMediaQuery: MediaQueryList | null = null
  _handleOrientationChange = (e: MediaQueryListEvent) => {
    ;[this._columns, this._rows] = [this._rows, this._columns]
    this._isPortrait = e.matches
  }

  connectedCallback () {
    super.connectedCallback()
    this._orientationMediaQuery = window.matchMedia('(orientation: portrait)')
    this._orientationMediaQuery.addEventListener('change', this._handleOrientationChange)
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    this._orientationMediaQuery?.removeEventListener('change', this._handleOrientationChange)
  }

  render () {
    return html`
    <app-dialog class="settings-dialog" .isValid=${true} @close=${this.close}>
    <p class="dialog-title">${iconSettings}<br/>Settings</p>

    <div class="grid-config">
      <fieldset>
        <legend>Grid layout (${this._isPortrait ? 'portrait' : 'landscape'})</legend>
        <label>
          <span>Columns: ${this._columns}</span>
          <input
            type="range" min="1" .max=${this._isPortrait ? '4' : '8'}
            .value=${String(this._columns)}
            @input=${(e: Event) => { this._columns = parseInt((e.target as HTMLInputElement).value, 10) }}
          />
        </label>
        <label>
          <span>Rows: ${this._rows}</span>
          <input
            type="range" min="1" .max=${this._isPortrait ? '8' : '4'}
            .value=${String(this._rows)}
            @input=${(e: Event) => { this._rows = parseInt((e.target as HTMLInputElement).value, 10) }}
          />
        </label>
      </fieldset>
    </div>

    <p class="show-icons-selector">
      <label>
        <span>Show icons</span>
        <input @change=${this.toggleIcons} name="showIcons" type="checkbox" />
      </label>
    </p>
    <p class="experimental-settings">
      Experimental settings:
      <label>
        <span>True Black theme (OLED/AMOLED)</span>
        <input @change=${this.toggleTrueBlackTheme} name="trueBlackTheme" type="checkbox" />
      </label>
    </p>
    </app-dialog>
  `
  }

  firstUpdated () {
    this._isPortrait = window.matchMedia('(orientation: portrait)').matches
    const orientConfig = this._isPortrait ? this.config.gridConfig.portrait : this.config.gridConfig.landscape
    this._columns = orientConfig.columns
    this._rows = orientConfig.rows
    this._showIcons = this.config.showIcons
    this._trueBlackTheme = this.config.trueBlackTheme ?? false
    this._showIconInput.checked = this._showIcons
    this._trueBlackThemeInput.checked = this._trueBlackTheme
  }

  toggleIcons (e: Event) {
    this._showIcons = (e.target as HTMLInputElement).checked
  }

  toggleTrueBlackTheme (e: Event) {
    this._trueBlackTheme = (e.target as HTMLInputElement).checked
  }

  close (event: CustomEvent) {
    this.dispatchEvent(new CustomEvent('close'))
    if (event.detail === 'confirm') {
      const gridConfig = this._isPortrait ?
        {
          landscape: { columns: this._rows, rows: this._columns },
          portrait: { columns: this._columns, rows: this._rows }
        } :
        {
          landscape: { columns: this._columns, rows: this._rows },
          portrait: { columns: this._rows, rows: this._columns }
        }
      this.sendEvent('changeGuiSetting', {
        gridConfig,
        showIcons: this._showIcons,
        trueBlackTheme: this._trueBlackTheme
      })
    }
  }
}
