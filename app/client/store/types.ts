/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Type definitions for the client-side application state
*/
import { TemplateResult } from 'lit'

export interface MetricsContext {
  isMoving: boolean
  isDriveStart: boolean
  isRecoveryStart: boolean
  isSessionStart: boolean
  isIntervalEnd: boolean
  isSplitEnd: boolean
  isPauseStart: boolean
  isPauseEnd: boolean
  isSessionStop: boolean
  isUnplannedPause: boolean
}

export interface RangeStats {
  average: number
  minimum: number
  maximum: number
}

export interface DistanceData {
  absoluteStart?: number
  fromStart: number
  target?: number
  toEnd: number
  projectedEnd?: number
}

export interface MovingTimeData {
  absoluteStart?: number
  sinceStart: number
  target?: number
  toEnd: number
  projectedEnd?: number
}

export interface CaloriesData {
  absoluteStart?: number
  sinceStart: number
  target?: number
  toEnd: number
  totalSpent?: number
  averagePerHour?: number
}

export interface IntervalData {
  type: string
  numberOfStrokes?: number
  distance: DistanceData
  movingTime: MovingTimeData
  calories?: CaloriesData
  linearVelocity?: RangeStats
  pace?: RangeStats
  power?: RangeStats
  work?: { absoluteStart: number, sinceStart: number }
  caloriesSpent?: { total: number, moving: number, rest: number }
  timeSpent?: { total: number, moving: number, rest: number }
  strokeDistance?: RangeStats
  strokerate?: RangeStats
  dragfactor?: RangeStats
}

export interface RowingMetrics {
  metricsContext?: MetricsContext
  sessionState: string
  strokeState: string
  timestamp?: Date
  totalMovingTime: number
  pauseCountdownTime: number
  totalLinearDistance: number
  totalNumberOfStrokes: number
  cyclePower?: number
  instantPower?: number
  totalWork?: number
  strokeWork?: number
  totalCalories?: number
  strokeCalories?: number
  totalCaloriesPerMinute?: number
  totalCaloriesPerHour?: number
  cycleDuration?: number
  cycleDistance?: number
  cycleStrokeRate?: number
  cyclePace: number
  cycleLinearVelocity?: number
  driveDuration?: number
  driveLength?: number
  driveDistance?: number
  driveLastStartTime?: number
  driveAverageHandleForce?: number
  drivePeakHandleForce?: number
  driveHandleForceCurve: number[]
  driveHandleVelocityCurve?: number[]
  driveHandlePowerCurve?: number[]
  recoveryDuration?: number
  dragFactor?: number
  heartrate?: number
  heartRateBatteryLevel?: number
  interval: IntervalData
  workout?: IntervalData
}

export interface GuiConfig {
  dashboardMetrics: string[]
  showIcons: boolean
  maxNumberOfTiles: number
  trueBlackTheme: boolean
  forceCurveDivisionMode: number
}

export interface AppConfig {
  blePeripheralMode: string
  hrmPeripheralMode: string
  antPeripheralMode: string
  uploadEnabled: boolean
  shutdownEnabled: boolean
  guiConfigs: GuiConfig
}

export interface AppState {
  metrics: RowingMetrics
  config: AppConfig
}

export interface DashboardMetricDefinition {
  displayName: string
  size: number
  template: (metrics: RowingMetrics, config?: AppConfig, onWorkoutOpen?: (type: string) => void) => TemplateResult
}
