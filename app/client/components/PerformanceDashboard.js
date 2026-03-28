'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Component that renders the dashboard
*/

import { AppElement, html, css } from './AppElement.js'
import { customElement, property, state } from 'lit/decorators.js'
import './DashboardToolbar.js'
import './SettingsDialog.js'
import { DASHBOARD_METRICS } from '../store/dashboardMetrics.js'
import { APP_STATE } from '../store/appState.js'

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
      grid-template-columns: repeat(var(--grid-columns, 4), 1fr);
      grid-template-rows: repeat(var(--grid-rows, 2), 1fr);
      min-height: 0; /* prevent grid blowout */
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

    .retile-controls {
      display: flex;
    }

    .retile-select {
      font-size: 0.4em;
      background: var(--theme-button-color);
      color: var(--theme-font-color);
      cursor: pointer;
      border: none;
      border-radius: var(--theme-border-radius);
    }

    .add-tile {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      background: var(--theme-widget-color);
      border: 2px dashed var(--theme-font-color);
      border-radius: var(--theme-border-radius);
      padding: 8px;
      min-height: 80px;
      max-height: 100%;
      overflow-y: auto;
    }

    .add-tile.empty {
      justify-content: center;
      align-items: center;
    }

    .add-tile-message {
      font-size: 0.6em;
      color: var(--theme-font-color);
      opacity: 0.7;
    }

    .add-tile-option {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
      width: 100%;
    }

    .add-tile-option input[type="radio"] {
      cursor: pointer;
      width: 1em;
      height: 1em;
      flex-shrink: 0;
    }

    .add-tile-option label {
      cursor: pointer;
      font-size: 0.5em;
      -webkit-user-select: none;
      user-select: none;
      flex: 1;
    }
  `
  @property()
  accessor appState = {}

  @state()
  accessor _retileMode = false

  @state()
  accessor _localMetrics = null  // null means use appState, array means local override

  @state()
  accessor _dialog = null

  // Computed grid state (derived in willUpdate)
  @state()
  accessor _columns = 4

  @state()
  accessor _rows = 2

  @state()
  accessor _maxGridSlots = 8

  connectedCallback () {
    super.connectedCallback()
    this.addEventListener('retile-mode-changed', this._handleRetileModeChanged)
    this.addEventListener('reset-layout-to-default', this._handleResetToDefault)
    this.addEventListener('open-settings', this._handleOpenSettings)
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties)
    
    // Recompute grid config only when grid config specifically changes
    if (changedProperties.has('appState')) {
      const oldAppState = changedProperties.get('appState')
      const oldGridConfig = oldAppState?.config?.guiConfigs?.gridConfig
      const newGridConfig = this.appState?.config?.guiConfigs?.gridConfig
      
      if (oldGridConfig !== newGridConfig) {
        this._computeGridConfig()
      }
    }

    // Trim metrics if they exceed max slots
    if (changedProperties.has('_localMetrics') && this._localMetrics) {
      let currentSlots = this._localMetrics.reduce((sum, key) => sum + (DASHBOARD_METRICS[key]?.size || 1), 0)
      
      if (currentSlots > this._maxGridSlots) {
        const newMetrics = [...this._localMetrics]
        while (currentSlots > this._maxGridSlots && newMetrics.length > 0) {
          const removed = newMetrics.pop()
          currentSlots -= (DASHBOARD_METRICS[removed]?.size || 1)
        }
        this._localMetrics = newMetrics
      }
    }
  }

  _computeGridConfig() {
    const gridConfig = this.appState?.config?.guiConfigs?.gridConfig || APP_STATE.config.guiConfigs.gridConfig
    const isPortrait = window.matchMedia('(orientation: portrait)').matches
    const orientationConfig = isPortrait ? gridConfig.portrait : gridConfig.landscape
    
    this._columns = orientationConfig.columns
    this._rows = orientationConfig.rows
    this._maxGridSlots = this._columns * this._rows
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    this.removeEventListener('retile-mode-changed', this._handleRetileModeChanged)
    this.removeEventListener('reset-layout-to-default', this._handleResetToDefault)
    this.removeEventListener('open-settings', this._handleOpenSettings)
  }

  _handleOpenSettings = () => {
    this._dialog = html`
      <settings-dialog 
        .config=${this.appState.config.guiConfigs} 
        .dashboardMetrics=${this.appState.config.guiConfigs.dashboardMetrics}
        @close=${() => { this._dialog = null }}
      ></settings-dialog>
    `
  }

  _handleRetileModeChanged = (event) => {
    const wasActive = this._retileMode
    this._retileMode = event.detail.active

    if (this._retileMode && !wasActive) {
      // Entering retile mode: copy current metrics to local state
      this._localMetrics = [...this.appState.config.guiConfigs.dashboardMetrics]
    } else if (!this._retileMode && wasActive) {
      // Exiting retile mode: save local state to app state
      if (this._localMetrics) {
        this.sendEvent('changeGuiSetting', {
          dashboardMetrics: this._localMetrics
        })
      }
      this._localMetrics = null
    }
  }

  _removeMetric = (index) => {
    if (!this._localMetrics) {
      return
    }
    const newMetrics = [...this._localMetrics]
    newMetrics.splice(index, 1)
    this._localMetrics = newMetrics
  }

  _handleResetToDefault = () => {
    if (this._retileMode) {
      this._localMetrics = [...APP_STATE.config.guiConfigs.dashboardMetrics]
    }
  }

  _getAvailableMetrics (availableSlots = Infinity) {
    const currentSet = new Set(this._localMetrics ?? [])
    return Object.keys(DASHBOARD_METRICS).filter(key => {
      // Must not already be on the dashboard
      if (currentSet.has(key)) {
        return false
      }
      // Must fit in remaining slots (if checking slots)
      const metricSize = DASHBOARD_METRICS[key]?.size || 1
      return metricSize <= availableSlots
    })
  }

  _handleMetricAction = (index, value) => {
    if (value === 'remove') {
      this._removeMetric(index)
    } else if (value) {
      this._replaceMetricDirect(index, value)
    }
  }

  _renderMetricWithControls (componentFactory, index, metricName, availableSlots) {
    const currentMetricSize = DASHBOARD_METRICS[metricName]?.size || 1
    const slotsIfReplaced = availableSlots + currentMetricSize
    const availableMetrics = this._getAvailableMetrics(slotsIfReplaced)

    const controls = html`
      <div class="retile-controls">
        <select 
          class="retile-select" 
          @change=${(e) => this._handleMetricAction(index, e.target.value)}
          title="Tile Actions"
        >
          <option value="" disabled selected>Tile Actions</option>
          <option value="remove">Remove</option>
          <optgroup label="Replace With...">
            ${availableMetrics.map(key => html`
              <option value=${key}>${DASHBOARD_METRICS[key].displayName}</option>
            `)}
          </optgroup>
        </select>
      </div>
    `

    // Render the component with controls passed as slotted content
    return componentFactory(controls)
  }

  _renderAddTile (availableSlots) {
    const availableMetrics = this._getAvailableMetrics(availableSlots)

    if (availableMetrics.length === 0) {
      return html`
        <div class="add-tile empty">
          <span class="add-tile-message">All metrics in use or won't fit</span>
        </div>
      `
    }

    return html`
      <div class="add-tile">
        ${availableMetrics.map(key => html`
          <div class="add-tile-option">
            <input 
              type="radio" 
              name="add-metric" 
              id=${`add-${key}`} 
              value=${key}
              @change=${() => this._addMetricDirect(key)}
            />
            <label for=${`add-${key}`}>${DASHBOARD_METRICS[key].displayName}</label>
          </div>
        `)}
      </div>
    `
  }

  _addMetricDirect = (metricKey) => {
    if (!this._localMetrics || !metricKey) {
      return
    }
    this._localMetrics = [...this._localMetrics, metricKey]
  }

  _replaceMetricDirect = (index, metricKey) => {
    if (!this._localMetrics || !metricKey) {
      return
    }
    const newMetrics = [...this._localMetrics]
    newMetrics[index] = metricKey
    this._localMetrics = newMetrics
  }

  dashboardMetricComponentsFactory = (appState) => {
    const metrics = appState.metrics
    const configs = appState.config

    const dashboardMetricComponents = Object.keys(DASHBOARD_METRICS).reduce((dashboardMetrics, key) => {
      dashboardMetrics[key] = (slotContent) => DASHBOARD_METRICS[key].template(metrics, configs, slotContent)

      return dashboardMetrics
    }, {})

    return dashboardMetricComponents
  }

  render () {
    const metrics = this._localMetrics ?? this.appState?.config?.guiConfigs?.dashboardMetrics ?? []
    const uniqueMetrics = [...new Set(metrics)]
    const currentGridSlots = uniqueMetrics.reduce((sum, key) => sum + (DASHBOARD_METRICS[key]?.size || 1), 0)
    const availableSlots = this._maxGridSlots - currentGridSlots

    const metricConfig = uniqueMetrics.reduce((prev, metricName, index) => {
      const componentFactory = this.dashboardMetricComponentsFactory(this.appState)[metricName]
      if (this._retileMode) {
        prev.push(this._renderMetricWithControls(componentFactory, index, metricName, availableSlots))
      } else {
        prev.push(componentFactory())
      }
      return prev
    }, [])

    // Add empty "Add" tile when in retile mode if there is room for another standard tile
    if (this._retileMode && currentGridSlots < this._maxGridSlots) {
      metricConfig.push(this._renderAddTile(availableSlots))
    }

    return html`
      <dashboard-toolbar .config=${this.appState.config}></dashboard-toolbar>
      <section 
        class="metrics-grid" 
        style="--grid-columns: ${this._columns}; --grid-rows: ${this._rows};"
      >${metricConfig}</section>
      ${this._dialog ? this._dialog : ''}
    `
  }
}
