/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Component that renders a workout goal picker dialog
*/
import { AppElement, html, css } from './AppElement'
import { customElement, property, state } from 'lit/decorators.js'
import './AppDialog'
import { workoutConfig, buildWorkoutPlan } from '../lib/workout-utils'

@customElement('workout-dialog')
export class WorkoutDialog extends AppElement {
  static styles = css`
    :host {
      position: absolute;
    }

    .total-display {
      text-align: center;
      font-size: 200%;
      font-weight: bold;
      color: var(--theme-font-color);
      line-height: 1;
      padding: 0.2em 0 0.1em;
    }

    .total-unit {
      text-align: center;
      font-size: 45%;
      color: var(--theme-font-color);
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .increment-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.3em;
      width: 100%;

      @media (max-width: 425px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    button {
      padding: 0.6em 0.4em;
      background: var(--theme-widget-color);
      color: var(--theme-font-color);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--theme-border-radius);
      font-family: var(--theme-font-family);
      font-size: 50%;
      font-weight: bold;
      cursor: pointer;
      text-align: center;
      white-space: nowrap;
      user-select: none;

      &:hover {
        filter: brightness(130%);
      }

      &:active {
        filter: brightness(150%);
      }
    }

    .reset-btn {
      grid-column: 1 / -1;
    }

    legend {
      text-align: center;
    }
  `

  @property({ type: String })
  type = 'distance'

  @state()
  _total = 0

  get _config () {
    return workoutConfig[this.type] ?? workoutConfig.distance
  }

  render () {
    const cfg = this._config
    return html`
      <app-dialog .isValid=${this._total > 0} @close=${this._onClose}>
        <legend>${cfg.title}</legend>
        <div class="total-display">${this._total > 0 ? cfg.format(this._total) : '0'}</div>
        <div class="total-unit">${cfg.unit}</div>
        <div class="increment-row">
          ${cfg.increments.map((inc) => html`
            <button @click=${() => this._increment(inc.value)}>${inc.label}</button>
          `)}
          <button class="reset-btn" @click=${this._reset}>Reset</button>
        </div>
      </app-dialog>
    `
  }

  _increment (value: number) {
    this._total += value
  }

  _reset () {
    this._total = 0
  }

  _onClose (event: CustomEvent) {
    if (event.detail === 'confirm' && this._total > 0) {
      const plan = buildWorkoutPlan(this.type, this._total)
      this.sendEvent('triggerAction', { command: 'updateIntervalSettings', data: plan })
    }
    this.dispatchEvent(new CustomEvent('close'))
  }
}
