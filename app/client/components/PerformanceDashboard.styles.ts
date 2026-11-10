/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Styles for the PerformanceDashboard component
*/

import { css } from './AppElement'

export const performanceDashboardStyles = css`
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
    position: relative; /* anchors the drop indicator */
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

  /* Overlays the bottom of the tile, so the controls keep the icon and the metric value visible */
  .retile-controls {
    display: flex;
    position: absolute;
    bottom: 0.2em;
    left: 0.2em;
    right: 0.2em;
    z-index: 10;
  }

  .retile-grip {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.5em;
    padding: 0 0.3em;
    cursor: grab;
    touch-action: none; /* a drag on the grip moves the tile, it must not scroll or zoom the page */
    border-radius: var(--theme-border-radius);
  }

  .retile-grip .icon {
    height: 1.4em;
  }

  .retile-grip:focus-visible {
    outline: 2px solid var(--theme-font-color);
  }

  .dragging {
    opacity: 0.8;
    z-index: 20;
    box-shadow: 0 0.3em 1em rgb(0 0 0 / 50%);
    cursor: grabbing;
  }

  .drop-indicator {
    position: absolute;
    width: 0.3em;
    transform: translateX(-50%);
    background: var(--theme-font-color);
    border-radius: 0.15em;
    pointer-events: none;
    z-index: 30;
  }

  .retile-select {
    font-size: 0.4em;
    padding: 4px 8px;
    min-width: 80px;
    width: 100%;
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
