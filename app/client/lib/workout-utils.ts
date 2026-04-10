/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor

  Pure logic for workout goal configuration, extracted for testability
*/

export interface WorkoutIncrement {
  label: string
  value: number
}

export interface WorkoutTypeConfig {
  title: string
  unit: string
  increments: WorkoutIncrement[]
  format: (v: number) => string | number
}

export const workoutConfig: Record<string, WorkoutTypeConfig> = {
  distance: {
    title: 'Set Distance',
    unit: 'meters',
    increments: [
      { label: '+100m', value: 100 },
      { label: '+500m', value: 500 },
      { label: '+1K', value: 1000 },
      { label: '+2K', value: 2000 }
    ],
    format (v: number) {
      return v >= 99999.5 ? (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'K' : v
    }
  },
  time: {
    title: 'Set Time',
    unit: 'minutes',
    increments: [
      { label: '+1 min', value: 60 },
      { label: '+5 min', value: 300 },
      { label: '+10 min', value: 600 },
      { label: '+20 min', value: 1200 }
    ],
    format: (v: number) => {
      const minutes = v / 60
      return minutes % 1 === 0 ? `${minutes}` : `${minutes.toFixed(2)}`
    }
  },
  calories: {
    title: 'Set Calories',
    unit: 'kcal',
    increments: [
      { label: '+10 kcal', value: 10 },
      { label: '+50 kcal', value: 50 },
      { label: '+100 kcal', value: 100 },
      { label: '+500 kcal', value: 500 }
    ],
    format: (v: number) => v
  }
}

export function buildWorkoutPlan (type: string, val: number) {
  if (type === 'distance') {
    return [{ type: 'distance', targetDistance: String(val), targetTime: '0' }]
  }
  if (type === 'time') {
    return [{ type: 'time', targetDistance: '0', targetTime: String(val) }]
  }
  return [{ type: 'calories', targetCalories: String(val) }]
}
