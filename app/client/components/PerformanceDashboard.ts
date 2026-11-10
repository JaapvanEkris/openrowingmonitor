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
import { DASHBOARD_METRICS, layoutMetricsForGrid } from '../store/dashboardMetrics'
import { APP_STATE } from '../store/appState'
import { iconGrip } from '../lib/icons'
import { moveMetric } from '../lib/retile-utils'
import { TileDragController } from './TileDragController'
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

  _isPortrait = false

  _tileDrag = new TileDragController(this, () => this._gridElement(), (from, insertBefore) => {
    if (this._localMetrics) { this._setLocalMetrics(moveMetric(this._localMetrics, from, insertBefore)) }
  })

  // The metric whose grip should get the focus after a keyboard move re-rendered the tiles
  _focusAfterMove: string | null = null

  _orientationMediaQuery: MediaQueryList | null = null
  _handleOrientationChange = () => {
    if (this._retileMode && this._localMetrics) {
      // Keep the edits made in the orientation we are leaving, as leaving retile mode would
      const previousMetricsKey = this._isPortrait ? 'portraitDashboardMetrics' : 'landscapeDashboardMetrics'
      this.sendEvent('changeGuiSetting', { [previousMetricsKey]: this._localMetrics })
    }
    this._computeGridConfig()
    if (this._retileMode) {
      this._setLocalMetrics(this._getOrientationMetrics())
    }
  }

  connectedCallback () {
    super.connectedCallback()
    this.addEventListener('retile-mode-changed', this._handleRetileModeChanged as EventListener)
    this.addEventListener('revert-layout', this._handleRevertLayout)
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
        if (this._localMetrics) {
          this._setLocalMetrics(this._localMetrics)
        }
      }
    }
  }

  _computeGridConfig () {
    const gridConfig = this.appState?.config?.guiConfigs?.gridConfig ?? APP_STATE.config.guiConfigs.gridConfig
    this._isPortrait = window.matchMedia('(orientation: portrait)').matches
    const orientationConfig: GridOrientationConfig = this._isPortrait ? gridConfig.portrait : gridConfig.landscape

    this._columns = orientationConfig.columns
    this._rows = orientationConfig.rows
  }

  _layout (metrics: string[]) {
    return layoutMetricsForGrid(metrics, this._columns, this._rows)
  }

  // _localMetrics always holds the list as the grid shows it, so a tile's position is its index in this list
  _setLocalMetrics (metrics: string[]) {
    this._localMetrics = this._layout(metrics).metrics
  }

  _getOrientationMetrics (): string[] {
    const isPortrait = window.matchMedia('(orientation: portrait)').matches
    const guiConfigs = this.appState?.config?.guiConfigs ?? APP_STATE.config.guiConfigs
    return isPortrait ? guiConfigs.portraitDashboardMetrics : guiConfigs.landscapeDashboardMetrics
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    this.removeEventListener('retile-mode-changed', this._handleRetileModeChanged as EventListener)
    this.removeEventListener('revert-layout', this._handleRevertLayout)
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
      this._setLocalMetrics(this._getOrientationMetrics())
    } else if (!this._retileMode && wasActive) {
      this._tileDrag.cancel()
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
    this._setLocalMetrics(newMetrics)
  }

  // Compares against the saved layout as the grid shows it, so entering retile mode alone (which lays the list out) is no change
  _hasLayoutChanges (): boolean {
    if (!this._retileMode || !this._localMetrics) { return false }
    const savedLayout = this._layout(this._getOrientationMetrics()).metrics
    return savedLayout.length !== this._localMetrics.length || savedLayout.some((key, index) => key !== this._localMetrics?.[index])
  }

  // Undoes the retile edits that have not been submitted yet, by going back to the saved layout of this orientation
  _handleRevertLayout = () => {
    if (this._retileMode) {
      this._setLocalMetrics(this._getOrientationMetrics())
    }
  }

  /**
   * Lists the metrics that can be added (no index) or can replace the tile at replaceIndex,
   * i.e. the ones that are not on the dashboard yet and whose resulting layout still fits the grid
   */
  _getAvailableMetrics (replaceIndex?: number): string[] {
    const currentMetrics = this._localMetrics ?? []
    const currentSet = new Set(currentMetrics)
    return Object.keys(DASHBOARD_METRICS).filter((key) => {
      if (currentSet.has(key)) { return false }
      const candidate = [...currentMetrics]
      if (replaceIndex === undefined) {
        candidate.push(key)
      } else {
        candidate[replaceIndex] = key
      }
      return this._layout(candidate).metrics.length === candidate.length
    })
  }

  _handleMetricAction = (index: number, value: string) => {
    if (value === 'remove') {
      this._removeMetric(index)
    } else if (value) {
      this._replaceMetricDirect(index, value)
    }
  }

  _gridElement (): HTMLElement | null {
    return this.renderRoot?.querySelector('.metrics-grid') ?? null
  }

  _handleGripKeydown (event: KeyboardEvent, index: number) {
    if (!this._localMetrics || this._tileDrag.drag) { return }
    const moves: Record<string, number> = { ArrowLeft: index - 1, ArrowUp: index - 1, ArrowRight: index + 2, ArrowDown: index + 2 }
    const insertBefore = moves[event.key]
    if (insertBefore === undefined) { return }
    event.preventDefault()
    this._focusAfterMove = this._localMetrics[index]
    this._setLocalMetrics(moveMetric(this._localMetrics, index, insertBefore))
  }

  updated (changedProperties: Map<string, unknown>) {
    super.updated(changedProperties)
    if (this._focusAfterMove && this._localMetrics) {
      const index = this._localMetrics.indexOf(this._focusAfterMove)
      this._focusAfterMove = null
      // The move can put a new tile element here, which only shows its slotted grip (and can focus it) after its own first render
      const tile = this._gridElement()?.children[index] as (HTMLElement & { updateComplete?: Promise<unknown> }) | undefined
      void (tile?.updateComplete ?? Promise.resolve()).then(() => tile?.querySelector<HTMLElement>('.retile-grip')?.focus())
    }
  }

  _renderMetricWithControls (componentFactory: (slotContent?: TemplateResult | string) => TemplateResult, index: number): TemplateResult {
    const availableMetrics = this._getAvailableMetrics(index)

    const controls = html`
      <div class="retile-controls" @click=${(e: Event) => e.stopPropagation()}>
        <span
          class="retile-grip"
          tabindex="0"
          title="Drag to move this tile"
          aria-label="Move tile (drag, or use the arrow keys)"
          @pointerdown=${(e: PointerEvent) => this._tileDrag.start(e, index, this._localMetrics?.length ?? 0)}
          @pointermove=${(e: PointerEvent) => this._tileDrag.move(e)}
          @pointerup=${(e: PointerEvent) => this._tileDrag.finish(e)}
          @pointercancel=${this._tileDrag.cancel}
          @lostpointercapture=${this._tileDrag.cancel}
          @keydown=${(e: KeyboardEvent) => this._handleGripKeydown(e, index)}
        >${iconGrip}</span>
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

  _renderAddTile (): TemplateResult {
    const availableMetrics = this._getAvailableMetrics()

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
    this._setLocalMetrics([...this._localMetrics, metricKey])
  }

  _replaceMetricDirect = (index: number, metricKey: string) => {
    if (!this._localMetrics || !metricKey) { return }
    const newMetrics = [...this._localMetrics]
    newMetrics[index] = metricKey
    this._setLocalMetrics(newMetrics)
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
    // In retile mode _localMetrics is already laid out, so the tile index matches its index in _localMetrics
    const { metrics, usedCells } = this._layout(this._localMetrics ?? this._getOrientationMetrics())
    const componentFactories = this.dashboardMetricComponentsFactory(this.appState)

    const metricConfig = metrics.reduce((prev: TemplateResult[], metricName, index) => {
      const componentFactory = componentFactories[metricName]
      if (this._retileMode) {
        prev.push(this._renderMetricWithControls(componentFactory, index))
      } else {
        prev.push(componentFactory())
      }
      return prev
    }, [])

    if (this._retileMode && usedCells < this._columns * this._rows) {
      metricConfig.push(this._renderAddTile())
    }

    return html`
      <dashboard-toolbar .config=${this.appState.config} .layoutChanged=${this._hasLayoutChanges()}></dashboard-toolbar>
      <section
        class="metrics-grid"
        style="--grid-columns: ${this._columns}; --grid-rows: ${this._rows};"
      >${metricConfig}${this._tileDrag.renderDropIndicator()}</section>
      ${this._dialog ? this._dialog : ''}
    `
  }
}
