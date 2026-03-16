/*
  Open Rowing Monitor - Workout goal popup
  Opened by clicking the Distance or Timer dashboard tiles.
  Imported as an ES module from index.js.
*/
  // --- Styles ---
  const style = document.createElement('style')
  style.textContent = `
    #workout-popup {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(400px, calc(100vw - 24px));
      background: var(--theme-background-color);
      border: 1px solid var(--theme-button-color);
      border-radius: var(--theme-border-radius);
      padding: 16px;
      z-index: 9999;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    }
    #workout-popup.show { display: flex; }

    #workout-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,28,0.6);
      z-index: 9998;
    }
    #workout-overlay.show { display: block; }

    .popup-title {
      font-size: 11px;
      color: #aaa;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-family: var(--theme-font-family);
    }

    .total-display {
      text-align: center;
      font-size: 48px;
      font-weight: bold;
      color: var(--theme-font-color);
      line-height: 1;
      padding: 8px 0 4px;
      font-family: var(--theme-font-family);
    }

    .total-unit {
      text-align: center;
      font-size: 12px;
      color: #aaa;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: -4px;
      font-family: var(--theme-font-family);
    }

    .inc-row { display: flex; gap: 6px; }

    .inc {
      flex: 1;
      padding: 16px 4px;
      background: var(--theme-widget-color);
      color: var(--theme-font-color);
      border: 1px solid var(--theme-button-color);
      border-radius: var(--theme-border-radius);
      font-family: var(--theme-font-family);
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
      text-align: center;
    }
    .inc:active { background: var(--theme-button-color); }

    .popup-btns { display: flex; gap: 6px; margin-top: 4px; }

    .popup-cancel {
      flex: 1; padding: 12px;
      background: transparent;
      color: var(--theme-font-color);
      border: 1px solid var(--theme-button-color);
      border-radius: var(--theme-border-radius);
      font-family: var(--theme-font-family);
      font-size: 14px; cursor: pointer;
    }

    .popup-reset {
      flex: 1; padding: 12px;
      background: transparent;
      color: #aaa;
      border: 1px solid var(--theme-button-color);
      border-radius: var(--theme-border-radius);
      font-family: var(--theme-font-family);
      font-size: 14px; cursor: pointer;
    }

    .popup-confirm {
      flex: 2; padding: 12px;
      background: var(--theme-button-color);
      color: var(--theme-font-color);
      border: 1px solid var(--theme-button-color);
      border-radius: var(--theme-border-radius);
      font-family: var(--theme-font-family);
      font-size: 14px; font-weight: bold; cursor: pointer;
    }
    .popup-confirm:active   { filter: brightness(130%); }
    .popup-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
  `
  document.head.appendChild(style)

  // --- HTML ---
  const overlay = document.createElement('div')
  overlay.id = 'workout-overlay'

  const popup = document.createElement('div')
  popup.id = 'workout-popup'
  popup.innerHTML = `
    <div class="popup-title" id="popup-title">Set Distance</div>
    <div class="total-display" id="total-display">0</div>
    <div class="total-unit" id="total-unit">metres</div>
    <div class="inc-row" id="inc-row"></div>
    <div class="popup-btns">
      <button class="popup-cancel" id="wb-cancel">Cancel</button>
      <button class="popup-reset" id="wb-reset">Reset</button>
      <button class="popup-confirm" id="confirm-btn" disabled>Set Workout</button>
    </div>
  `

  document.body.appendChild(overlay)
  document.body.appendChild(popup)

  // --- Config ---
  const workoutConfig = {
    distance: {
      title: 'Set Distance',
      unit: 'metres',
      increments: [
        { label: '+100m', value: 100 },
        { label: '+500m', value: 500 },
        { label: '+1K',   value: 1000 },
        { label: '+2K',   value: 2000 },
      ],
      format: v => v >= 1000 ? (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'K' : v + 'm'
    },
    time: {
      title: 'Set Time',
      unit: 'minutes',
      increments: [
        { label: '+1 min',  value: 60 },
        { label: '+5 min',  value: 300 },
        { label: '+10 min', value: 600 },
        { label: '+20 min', value: 1200 }
      ],
      format: v => {
        const m = Math.floor(v / 60)
        const s = v % 60
        return s > 0 ? `${m}m ${s}s` : `${m}m`
      }
    }
  }

  // --- State ---
  let currentType = null
  let total = 0

  // --- Functions ---
  function openPopup (type) {
    currentType = type
    total = 0
    const cfg = workoutConfig[type]
    document.getElementById('popup-title').textContent = cfg.title
    document.getElementById('total-unit').textContent = cfg.unit
    updateDisplay()

    const row = document.getElementById('inc-row')
    row.innerHTML = ''
    cfg.increments.forEach(inc => {
      const btn = document.createElement('button')
      btn.className = 'inc'
      btn.textContent = inc.label
      btn.addEventListener('click', () => { total += inc.value; updateDisplay() })
      row.appendChild(btn)
    })

    overlay.classList.add('show')
    popup.classList.add('show')
  }

  function updateDisplay () {
    const cfg = workoutConfig[currentType]
    document.getElementById('total-display').textContent = total > 0 ? cfg.format(total) : '0'
    document.getElementById('confirm-btn').disabled = total <= 0
  }

  function closePopup () {
    popup.classList.remove('show')
    overlay.classList.remove('show')
    currentType = null
    total = 0
  }

  function confirmWorkout () {
    if (total <= 0) return
    const type = currentType
    const val = total
    closePopup()

    const plan = type === 'distance'
      ? [{ type: 'distance', targetDistance: String(val), targetTime: '0' }]
      : [{ type: 'time',     targetDistance: '0',         targetTime: String(val) }]

    try {
      const ws = new WebSocket(`ws://${location.host}/websocket`)
      ws.onopen = () => {
        ws.send(JSON.stringify({ command: 'updateIntervalSettings', data: plan }))
        ws.close()
      }
    } catch (e) {
      // silently ignore connection failures
    }
  }

  // --- Event wiring ---
  document.getElementById('wb-cancel').addEventListener('click', closePopup)
  document.getElementById('wb-reset').addEventListener('click', () => { total = 0; updateDisplay() })
  document.getElementById('confirm-btn').addEventListener('click', confirmWorkout)
  overlay.addEventListener('click', closePopup)

  // Listen for tile clicks dispatched from dashboardMetrics.js
  window.addEventListener('workout-open', e => openPopup(/** @type {CustomEvent} */ (e).detail))
