'use strict'
/**
 * @copyright {@link https://github.com/JaapvanEkris/openrowingmonitor|OpenRowingMonitor}
 *
 * @file This file contains a collection of artificial curves for testing purposses, shared among the several regression and curve ploting algorithms
 * For each curve they have an algebraicly derived second derivative, first derivative, plain function, first integral and second integral
 * This allows feeding a regression algoirthm the second integral, and test the speed against the first integral and the acceleration against the plain function
 * Aside for testing for mathematical correctness of these regression functions, this also helps in identifying too agressive smoothing effects, etc..
 *
 * It also contains fuzzing functions, to inject artificial noise
 * The clean ('plain') versions are used/stored in CurveMetrics.test.ts, the firstIntegral and secondIntegral are used in MovingWindowRegressor.test.ts
 */
/* eslint-disable max-lines -- This sets up quite complex functons for testing, we need a lot of code for it */
export interface cartesianCoordinates {
  readonly x: number
  readonly y: number
}

export interface curveFunctionResult {
  readonly secondDerivative: cartesianCoordinates
  readonly firstDerivative: cartesianCoordinates
  readonly plain: cartesianCoordinates
  readonly firstIntegral: cartesianCoordinates
  readonly secondIntegral: cartesianCoordinates
}

/**
 * Basic parabola
 * Curve is defined from x = 0 to x = 200
 * Peak is at x = 100, any y = 600
 */
export function parabola (x: Readonly<number>): curveFunctionResult {
  const secondDerivY: number = -6 / 50
  const firstDerivY: number = 12 - ((6 / 50) * x)
  const y: number = (12 * x) - ((3 / 50) * Math.pow(x, 2))
  const firstIntY: number = (6 * Math.pow(x, 2)) - ((1 / 50) * Math.pow(x, 3))
  const secondIntY: number = (2 * Math.pow(x, 3)) - ((1 / 200) * Math.pow(x, 4))
  return {
    secondDerivative: {
      x,
      y: secondDerivY
    },
    firstDerivative: {
      x,
      y: firstDerivY
    },
    plain: {
      x,
      y
    },
    firstIntegral: {
      x,
      y: firstIntY
    },
    secondIntegral: {
      x,
      y: secondIntY
    }
  }
}

/**
 * A combination of two lines
 * Curve is defined from x = 0 to x = 100
 * Peak and curve transtion are at x = 50, and y = 600 (peak is a shared datapoints in all curves)
 */
export function pyramid (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  if (x < 51) {
    secondDerivY = 0
    firstDerivY = 12
    y = 12 * x
    firstIntY = 6 * Math.pow(x, 2)
    secondIntY = 2 * Math.pow(x, 3)
  } else {
    secondDerivY = 0
    firstDerivY = -12
    y = 1200 - (12 * x)
    firstIntY = (1200 * x) - 6 * Math.pow(x, 2) - 30000
    secondIntY = (600 * Math.pow(x, 2)) - 2 * Math.pow(x, 3) - (30000 * x) + 500000
  }
  return {
    secondDerivative: {
      x,
      y: secondDerivY
    },
    firstDerivative: {
      x,
      y: firstDerivY
    },
    plain: {
      x,
      y
    },
    firstIntegral: {
      x,
      y: firstIntY
    },
    secondIntegral: {
      x,
      y: secondIntY
    }
  }
}

/**
 * Two consequtive basic parabolas
 * Curve is defined from x = 0 to x = 200
 * Peaks are at x = 50 and x = 150, with y = 600
 * Shared datapoint is at x = 100, with y = 0
 */
export function camel (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  if (x < 101) {
    secondDerivY = -12 / 25
    firstDerivY = 24 - ((12 / 25) * x)
    y = (24 * x) - ((6 / 25) * Math.pow(x, 2))
    firstIntY = (12 * Math.pow(x, 2)) - ((2 / 25) * Math.pow(x, 3))
    secondIntY = (4 * Math.pow(x, 3)) - ((1 / 50) * Math.pow(x, 4))
  } else {
    secondDerivY = -12 / 25
    firstDerivY = 24 - ((12 / 25) * x)
    y = (72 * x) - ((6 / 25) * Math.pow(x, 2)) - 4800
    firstIntY = (36 * Math.pow(x, 2)) - ((2 / 25) * Math.pow(x, 3)) - (4800 * x) + 240000
    secondIntY = (12 * Math.pow(x, 3)) - ((1 / 50) * Math.pow(x, 4)) - (2400 * Math.pow(x, 2)) + (240000 * x) - 8000000
  }
  return {
    secondDerivative: {
      x,
      y: secondDerivY
    },
    firstDerivative: {
      x,
      y: firstDerivY
    },
    plain: {
      x,
      y
    },
    firstIntegral: {
      x,
      y: firstIntY
    },
    secondIntegral: {
      x,
      y: secondIntY
    }
  }
}

/**
 * Two partially overlapping parabolas
 * Curve is defined from x = 0 to x = 200
 * Peak is at x = 90 with y = 600
 * Shared datapoint is x = 138, y = (1288/3)
 */
export function dromedaryLeft (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  if (x < 139) {
    secondDerivY = -4 / 27
    firstDerivY = (40 / 3) - ((4 / 27) * x)
    y = ((40 / 3) * x) - ((2 / 27) * Math.pow(x, 2))
    firstIntY = ((20 / 3) * Math.pow(x, 2)) - ((2 / 81) * Math.pow(x, 3))
    secondIntY = ((20 / 9) * Math.pow(x, 3)) - ((1 / 162) * Math.pow(x, 4))
  } else {
    secondDerivY = -2539 / 4092
    firstDerivY = (133585 / 1364) - ((2539 / 4092) * x)
    y = ((133585 / 1364) * x) - ((2539 / 8184) * Math.pow(x, 2)) - (7342750 / 1023)
    firstIntY = ((133585 / 2728) * Math.pow(x, 2)) - ((2539 / 24552) * Math.pow(x, 3)) - ((7342750 / 1023) * x) + 391815.510752688
    secondIntY = ((133585 / 8184) * Math.pow(x, 3)) - ((2539 / 98208) * Math.pow(x, 4)) - ((3671375 / 1023) * Math.pow(x, 2)) + (391815.510752688 * x) - 15644317.8958944
  }
  return {
    secondDerivative: {
      x,
      y: secondDerivY
    },
    firstDerivative: {
      x,
      y: firstDerivY
    },
    plain: {
      x,
      y
    },
    firstIntegral: {
      x,
      y: firstIntY
    },
    secondIntegral: {
      x,
      y: secondIntY
    }
  }
}

/**
 * Two partially overlapping parabolas
 * Curve is defined from x = 0 to x = 200
 * Peak is at x = 90 with y = 600
 * Shared datapoint is x = 75, y = 375
 */
export function dromedaryRight (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  if (x < 76) {
    secondDerivY = -2 / 5
    firstDerivY = 20 - ((2 / 5) * x)
    y = (20 * x) - ((1 / 5) * Math.pow(x, 2))
    firstIntY = (10 * Math.pow(x, 2)) - ((1 / 15) * Math.pow(x, 3))
    secondIntY = ((10 / 3) * Math.pow(x, 3)) - ((1 / 60) * Math.pow(x, 4))
  } else {
    secondDerivY = -1 / 5
    firstDerivY = (49 / 2) - ((1 / 5) * x)
    y = ((49 / 2) * x) - ((1 / 10) * Math.pow(x, 2)) - 900
    firstIntY = ((49 / 4) * Math.pow(x, 2)) - ((1 / 30) * Math.pow(x, 3)) - (900 * x) + (163125 / 4)
    secondIntY = ((49 / 12) * Math.pow(x, 3)) - ((1 / 120) * Math.pow(x, 4)) - (450 * Math.pow(x, 2)) + ((163125 / 4) * x) - (8859375 / 8)
  }
  return {
    secondDerivative: {
      x,
      y: secondDerivY
    },
    firstDerivative: {
      x,
      y: firstDerivY
    },
    plain: {
      x,
      y
    },
    firstIntegral: {
      x,
      y: firstIntY
    },
    secondIntegral: {
      x,
      y: secondIntY
    }
  }
}

/**
 * Three parabola's stacked on top of each other (essentally extending the Camel)
 * Curve is defined from x = 0 to x = 200
 * Peak is at x = 100, y = 1000
 * - Shared datapoint between curve 1 and 2 is x = 60, y = 576
 * - Shared datapoint between curve 2 and 3 is x = 140, y = 576
 */
export function alps (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  switch (true) {
    case (x < 61):
      secondDerivY = -12 / 25
      firstDerivY = 24 - ((12 / 25) * x)
      y = (24 * x) - ((6 / 25) * Math.pow(x, 2))
      firstIntY = (12 * Math.pow(x, 2)) - ((2 / 25) * Math.pow(x, 3))
      secondIntY = (4 * Math.pow(x, 3)) - ((1 / 50) * Math.pow(x, 4))
      break
    case (x < 141):
      secondDerivY = -53 / 100
      firstDerivY = 53 - ((106 / 200) * x)
      y = (53 * x) - ((53 / 200) * Math.pow(x, 2)) - 1650
      firstIntY = ((53 / 2) * Math.pow(x, 2)) - ((53 / 600) * Math.pow(x, 3)) - (1650 * x) + 48600
      secondIntY = ((53 / 6) * Math.pow(x, 3)) - ((53 / 2400) * Math.pow(x, 4)) - (825 * Math.pow(x, 2)) + (48600 * x) - 963000
      break
    default:
      secondDerivY = -12 / 25
      firstDerivY = 72 - ((12 / 25) * x)
      y = (72 * x) - ((6 / 25) * Math.pow(x, 2)) - 4800
      firstIntY = (36 * Math.pow(x, 2)) - ((2 / 25) * Math.pow(x, 3)) - (4800 * x) + (841600 / 3)
      secondIntY = (12 * Math.pow(x, 3)) - ((1 / 50) * Math.pow(x, 4)) - (2400 * Math.pow(x, 2)) + ((841600 / 3) * x) - (36160000 / 3)
      break
  }
  return {
    secondDerivative: {
      x,
      y: secondDerivY
    },
    firstDerivative: {
      x,
      y: firstDerivY
    },
    plain: {
      x,
      y
    },
    firstIntegral: {
      x,
      y: firstIntY
    },
    secondIntegral: {
      x,
      y: secondIntY
    }
  }
}

/**
 * A half parabola, followed by  straight line
 * Curve is defined from x = 0 to x = 200
 * Peaks is at x = 100, y = 600
 * Shared datapoint is at x = 100, with y = 600
 */
export function artificialStroke (x: Readonly<number>): curveFunctionResult {
  let secondDerivY: number = 0
  let firstDerivY: number = 0
  let y: number = 0
  let firstIntY: number = 0
  let secondIntY: number = 0
  if (x < 101) {
    secondDerivY = -6 / 50
    firstDerivY = 12 - ((6 / 50) * x)
    y = (12 * x) - ((3 / 50) * Math.pow(x, 2))
    firstIntY = (6 * Math.pow(x, 2)) - ((1 / 50) * Math.pow(x, 3))
    secondIntY = (2 * Math.pow(x, 3)) - ((1 / 200) * Math.pow(x, 4))
  } else {
    secondDerivY = 0
    firstDerivY = -6
    y = 1200 - (6 * x)
    firstIntY = (1200 * x) - 3 * Math.pow(x, 2) - 50000
    secondIntY = (600 * Math.pow(x, 2)) - Math.pow(x, 3) - (50000 * x) + 1500000
  }
  return {
    secondDerivative: {
      x,
      y: secondDerivY
    },
    firstDerivative: {
      x,
      y: firstDerivY
    },
    plain: {
      x,
      y
    },
    firstIntegral: {
      x,
      y: firstIntY
    },
    secondIntegral: {
      x,
      y: secondIntY
    }
  }
}

/**
 * Fuzzing function, adding random noise to the y coordinates (typically distance)
 * Maximum noise between 0.99975 and 1.00025 (so +/-0.025%), which seems the maximum before stuff starts to misbehave with our basic curves
 */
export function randomYFuzzing (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates {
  const maxNoiseLevel: number = 0.0005
  const noiseVector: number[] = [0.362983358, 0.902896489, 0.195344252, 0.191309386, 0.736501025, 0.574923769, 0.678981554, 0.593413437, 0.33778425, 0.614321004, 0.11326172, 0.723371145, 0.43558542, 0.011992049, 0.913996445, 0.374276223, 0.713016154, 0.856803369, 0.344422239, 0.792627396, 0.144031064, 0.000106465, 0.216884612, 0.579060805, 0.707127774, 0.62039499, 0.573938716, 0.118905112, 0.140309774, 0.890857353, 0.3045947, 0.455922878, 0.539650891, 0.696400456, 0.631535821, 0.43863799, 0.716106011, 0.057274705, 0.487315805, 0.543589339, 0.651457884, 0.478043557, 0.673418293, 0.579425411, 0.344787352, 0.637331257, 0.620442629, 0.337341089, 0.127770611, 0.873241783, 0.302428492, 0.618533511, 0.146278373, 0.992357621, 0.021143278, 0.652834146, 0.850446503, 0.96763327, 0.171495787, 0.067086148, 0.126048085, 0.392876801, 0.481635464, 0.496808532, 0.75088968, 0.640720152, 0.252829348, 0.475315871, 0.487929901, 0.878802548, 0.169031209, 0.775708512, 0.782393113, 0.054553823, 0.792227725, 0.298634223, 0.112782097, 0.75732495, 0.852059951, 0.255772567, 0.658055404, 0.687396323, 0.144175617, 0.472735884, 0.792772287, 0.78732956, 0.675745635, 0.984115497, 0.981068176, 0.895400418, 0.976099858, 0.806882916, 0.179217502, 0.644991762, 0.023241968, 0.338141824, 0.764955944, 0.243711021, 0.262124759, 0.275138547, 0.426470026, 0.90353044, 0.938974817, 0.896970947, 0.340240997, 0.193329066, 0.563078515, 0.144400878, 0.596341162, 0.025370292, 0.542794913, 0.724600256, 0.18701935, 0.134240648, 0.460929134, 0.158915534, 0.334504504, 0.131729969, 0.173066402, 0.541094597, 0.011735444, 0.769915639, 0.988328633, 0.192912171, 0.583446718, 0.585939006, 0.779331413, 0.292934888, 0.550694634, 0.967938884, 0.476899836, 0.969116934, 0.312248856, 0.577913356, 0.101094981, 0.253867678, 0.167910262, 0.045804364, 0.286601277, 0.1044386, 0.281578512, 0.552648542, 0.218595901, 0.361034531, 0.386424148, 0.732405762, 0.842441079, 0.808704801, 0.987198908, 0.567754243, 0.58135886, 0.060248792, 0.857424889, 0.262499387, 0.542997437, 0.951833958, 0.213962481, 0.415178053, 0.507222186, 0.675799333, 0.401518955, 0.739986828, 0.821932361, 0.477800077, 0.596611138, 0.284780314, 0.464645421, 0.30989232, 0.253516253, 0.888072303, 0.955062399, 0.328091806, 0.808854395, 0.107733438, 0.993440704, 0.181659007, 0.77047131, 0.832626567, 0.833690049, 0.229227539, 0.367808547, 0.853840116, 0.345695299, 0.16400746, 0.713146352, 0.442394906, 0.768502671, 0.571540503, 0.564692492, 0.863232764, 0.217365739, 0.439635916, 0.619812114, 0.216397699, 0.879572123, 0.585654277, 0.634554473, 0.203350806, 0.943951474, 0.143816024, ]
  const noise = 0.99975 + (maxNoiseLevel * noiseVector[datapointnumber % 200])

  return {
    x: inputTupple.x,
    y: (inputTupple.y * noise)
  }
}

/**
 * Fuzzing function, adding random noise to the x coordinates (typically time)
 * Maximum noise between 0.99975 and 1.00025 (so +/-0.025%), which seems the maximum before stuff starts to misbehave with our basic curves
 */
export function randomXFuzzing (datapointnumber: Readonly<number>, inputTupple: Readonly<cartesianCoordinates>): cartesianCoordinates {
  const maxNoiseLevel: number = 0.0005
  const noiseVector: number[] = [0.362983358, 0.902896489, 0.195344252, 0.191309386, 0.736501025, 0.574923769, 0.678981554, 0.593413437, 0.33778425, 0.614321004, 0.11326172, 0.723371145, 0.43558542, 0.011992049, 0.913996445, 0.374276223, 0.713016154, 0.856803369, 0.344422239, 0.792627396, 0.144031064, 0.000106465, 0.216884612, 0.579060805, 0.707127774, 0.62039499, 0.573938716, 0.118905112, 0.140309774, 0.890857353, 0.3045947, 0.455922878, 0.539650891, 0.696400456, 0.631535821, 0.43863799, 0.716106011, 0.057274705, 0.487315805, 0.543589339, 0.651457884, 0.478043557, 0.673418293, 0.579425411, 0.344787352, 0.637331257, 0.620442629, 0.337341089, 0.127770611, 0.873241783, 0.302428492, 0.618533511, 0.146278373, 0.992357621, 0.021143278, 0.652834146, 0.850446503, 0.96763327, 0.171495787, 0.067086148, 0.126048085, 0.392876801, 0.481635464, 0.496808532, 0.75088968, 0.640720152, 0.252829348, 0.475315871, 0.487929901, 0.878802548, 0.169031209, 0.775708512, 0.782393113, 0.054553823, 0.792227725, 0.298634223, 0.112782097, 0.75732495, 0.852059951, 0.255772567, 0.658055404, 0.687396323, 0.144175617, 0.472735884, 0.792772287, 0.78732956, 0.675745635, 0.984115497, 0.981068176, 0.895400418, 0.976099858, 0.806882916, 0.179217502, 0.644991762, 0.023241968, 0.338141824, 0.764955944, 0.243711021, 0.262124759, 0.275138547, 0.426470026, 0.90353044, 0.938974817, 0.896970947, 0.340240997, 0.193329066, 0.563078515, 0.144400878, 0.596341162, 0.025370292, 0.542794913, 0.724600256, 0.18701935, 0.134240648, 0.460929134, 0.158915534, 0.334504504, 0.131729969, 0.173066402, 0.541094597, 0.011735444, 0.769915639, 0.988328633, 0.192912171, 0.583446718, 0.585939006, 0.779331413, 0.292934888, 0.550694634, 0.967938884, 0.476899836, 0.969116934, 0.312248856, 0.577913356, 0.101094981, 0.253867678, 0.167910262, 0.045804364, 0.286601277, 0.1044386, 0.281578512, 0.552648542, 0.218595901, 0.361034531, 0.386424148, 0.732405762, 0.842441079, 0.808704801, 0.987198908, 0.567754243, 0.58135886, 0.060248792, 0.857424889, 0.262499387, 0.542997437, 0.951833958, 0.213962481, 0.415178053, 0.507222186, 0.675799333, 0.401518955, 0.739986828, 0.821932361, 0.477800077, 0.596611138, 0.284780314, 0.464645421, 0.30989232, 0.253516253, 0.888072303, 0.955062399, 0.328091806, 0.808854395, 0.107733438, 0.993440704, 0.181659007, 0.77047131, 0.832626567, 0.833690049, 0.229227539, 0.367808547, 0.853840116, 0.345695299, 0.16400746, 0.713146352, 0.442394906, 0.768502671, 0.571540503, 0.564692492, 0.863232764, 0.217365739, 0.439635916, 0.619812114, 0.216397699, 0.879572123, 0.585654277, 0.634554473, 0.203350806, 0.943951474, 0.143816024, ]
  const noise = 0.99975 + (maxNoiseLevel * noiseVector[datapointnumber % 200])

  return {
    x: inputTupple.x * noise),
    y: inputTupple.y
  }
}
