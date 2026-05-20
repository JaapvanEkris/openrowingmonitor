/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Component that renders the dashboard
*/

import { AppElement, html, TemplateResult } from './AppElement'
import { performanceDashboardStyles } from './PerformanceDashboard.styles'
import { customElement, property, state } from 'lit/decorators.js'
import './DashboardToolbar'
import './SettingsDialog'
import './WorkoutDialog'
import { DASHBOARD_METRICS } from '../store/dashboardMetrics'
import { APP_STATE } from '../store/appState'
import type { AppState, GridOrientationConfig } from '../store/types'

@customElement('performance-dashboard')
export class PerformanceDashboard extends AppElement {
  static styles = performanceDashboardStyles

  @property({ type: Object })
  declare appState: AppState

  @state()
  _retileMode = false

  @state()
  _localMetrics: string[] | null = null

  @state()
  _dialog: TemplateResult | null = null

  @state()
  _columns = 4

  @state()
  _rows = 2

  @state()
  _maxGridSlots = 8

  _orientationMediaQuery: MediaQueryList | null = null
  _handleOrientationChange = () => {
    this._computeGridConfig()
    if (this._retileMode) {
      this._localMetrics = this._getOrientationMetrics()
    }
  }

  connectedCallback () {
    super.connectedCallback()
    this.addEventListener('retile-mode-changed', this._handleRetileModeChanged as EventListener)
    this.addEventListener('reset-layout-to-default', this._handleResetToDefault)
    this.addEventListener('open-settings', this._handleOpenSettings)
    this._orientationMediaQuery = window.matchMedia('(orientation: portrait)')
    this._orientationMediaQuery.addEventListener('change', this._handleOrientationChange)
  }

  willUpdate (changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties)

    if (changedProperties.has('appState')) {
      const oldAppState = changedProperties.get('appState') as AppState | undefined
      const oldGridConfig = oldAppState?.config?.guiConfigs?.gridConfig
      const newGridConfig = this.appState?.config?.guiConfigs?.gridConfig

      if (oldGridConfig !== newGridConfig) {
        this._computeGridConfig()
      }
    }
  }

  _computeGridConfig () {
    const gridConfig = this.appState?.config?.guiConfigs?.gridConfig ?? APP_STATE.config.guiConfigs.gridConfig
    const isPortrait = window.matchMedia('(orientation: portrait)').matches
    const orientationConfig: GridOrientationConfig = isPortrait ? gridConfig.portrait : gridConfig.landscape

    this._columns = orientationConfig.columns
    this._rows = orientationConfig.rows
    this._maxGridSlots = this._columns * this._rows
  }

  _getOrientationMetrics (): string[] {
    const isPortrait = window.matchMedia('(orientation: portrait)').matches
    const guiConfigs = this.appState?.config?.guiConfigs ?? APP_STATE.config.guiConfigs
    return isPortrait ? guiConfigs.portraitDashboardMetrics : guiConfigs.landscapeDashboardMetrics
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    this.removeEventListener('retile-mode-changed', this._handleRetileModeChanged as EventListener)
    this.removeEventListener('reset-layout-to-default', this._handleResetToDefault)
    this.removeEventListener('open-settings', this._handleOpenSettings)
    this._orientationMediaQuery?.removeEventListener('change', this._handleOrientationChange)
  }

  _handleOpenSettings = () => {
    this._dialog = html`
      <settings-dialog
        .config=${this.appState.config.guiConfigs}
        @close=${() => { this._dialog = null }}
      ></settings-dialog>
    `
  }

  _handleWorkoutOpen = (type: string) => {
    this.sendEvent('workout-open', type)
    this._dialog = html`
      <workout-dialog
        .type=${type}
        @close=${() => { this._dialog = null }}
      ></workout-dialog>
    `
  }

  _handleRetileModeChanged = (event: CustomEvent<{ active: boolean }>) => {
    const wasActive = this._retileMode
    this._retileMode = event.detail.active

    if (this._retileMode && !wasActive) {
      this._localMetrics = [...this._getOrientationMetrics()]
    } else if (!this._retileMode && wasActive) {
      if (this._localMetrics) {
        const isPortrait = window.matchMedia('(orientation: portrait)').matches
        const metricsKey = isPortrait ? 'portraitDashboardMetrics' : 'landscapeDashboardMetrics'
        this.sendEvent('changeGuiSetting', { [metricsKey]: this._localMetrics })
      }
      this._localMetrics = null
    }
  }

  _removeMetric = (index: number) => {
    if (!this._localMetrics) { return }
    const newMetrics = [...this._localMetrics]
    newMetrics.splice(index, 1)
    this._localMetrics = newMetrics
  }

  _handleResetToDefault = () => {
    if (this._retileMode) {
      const isPortrait = window.matchMedia('(orientation: portrait)').matches
      const defaultMetrics = APP_STATE.config.guiConfigs
      this._localMetrics = isPortrait ?
        [...defaultMetrics.portraitDashboardMetrics] :
        [...defaultMetrics.landscapeDashboardMetrics]
    }
  }

  _getAvailableMetrics (availableSlots = Infinity): string[] {
    const currentSet = new Set(this._localMetrics ?? [])
    return Object.keys(DASHBOARD_METRICS).filter((key) => {
      if (currentSet.has(key)) { return false }
      const metricSize = DASHBOARD_METRICS[key]?.size || 1
      return metricSize <= availableSlots
    })
  }

  _handleMetricAction = (index: number, value: string) => {
    if (value === 'remove') {
      this._removeMetric(index)
    } else if (value) {
      this._replaceMetricDirect(index, value)
    }
  }

  _renderMetricWithControls (componentFactory: (slotContent?: TemplateResult | string) => TemplateResult, index: number, metricName: string, availableSlots: number): TemplateResult {
    const currentMetricSize = DASHBOARD_METRICS[metricName]?.size || 1
    const slotsIfReplaced = availableSlots + currentMetricSize
    const availableMetrics = this._getAvailableMetrics(slotsIfReplaced)

    const controls = html`
      <div class="retile-controls" @click=${(e: Event) => e.stopPropagation()}>
        <select
          class="retile-select"
          @click=${(e: Event) => e.stopPropagation()}
          @change=${(e: Event) => this._handleMetricAction(index, (e.target as HTMLSelectElement).value)}
          title="Tile Actions"
        >
          <option value="" disabled selected>Tile Actions</option>
          <option value="remove">Remove</option>
          <optgroup label="Replace With...">
            ${availableMetrics.map((key) => html`
              <option value=${key}>${DASHBOARD_METRICS[key].displayName}</option>
            `)}
          </optgroup>
        </select>
      </div>
    `

    return componentFactory(controls)
  }

  _renderAddTile (availableSlots: number): TemplateResult {
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
        ${availableMetrics.map((key) => html`
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

  _addMetricDirect = (metricKey: string) => {
    if (!this._localMetrics || !metricKey) { return }
    this._localMetrics = [...this._localMetrics, metricKey]
  }

  _replaceMetricDirect = (index: number, metricKey: string) => {
    if (!this._localMetrics || !metricKey) { return }
    const newMetrics = [...this._localMetrics]
    newMetrics[index] = metricKey
    this._localMetrics = newMetrics
  }

  dashboardMetricComponentsFactory = (appState: AppState) => {
    const metrics = appState.metrics
    const configs = appState.config
    const workoutHandler = this._retileMode ? undefined : this._handleWorkoutOpen

    const dashboardMetricComponents: Record<string, (slotContent?: TemplateResult | string) => TemplateResult> = Object.keys(DASHBOARD_METRICS).reduce((dashboardMetrics: Record<string, (slotContent?: TemplateResult | string) => TemplateResult>, key) => {
      dashboardMetrics[key] = (slotContent?: TemplateResult | string) => DASHBOARD_METRICS[key].template(metrics, configs, workoutHandler, slotContent)

      return dashboardMetrics
    }, {})

    return dashboardMetricComponents
  }

  render () {
    const metrics = this._localMetrics ?? this._getOrientationMetrics()
    const uniqueMetrics = [...new Set(metrics)]
    const currentGridSlots = uniqueMetrics.reduce((sum, key) => sum + (DASHBOARD_METRICS[key]?.size || 1), 0)
    const availableSlots = this._maxGridSlots - currentGridSlots

    const metricConfig = uniqueMetrics.reduce((prev: TemplateResult[], metricName, index) => {
      const componentFactory = this.dashboardMetricComponentsFactory(this.appState)[metricName]
      if (this._retileMode) {
        prev.push(this._renderMetricWithControls(componentFactory, index, metricName, availableSlots))
      } else {
        prev.push(componentFactory())
      }
      return prev
    }, [])

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
