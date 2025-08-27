'use strict'
/*
  Open Rowing Monitor, https://github.com/JaapvanEkris/openrowingmonitor
*/
/**
 * This implements a Gausian weight function, which is used in the moving regression filter
 */
let begin, middle, end, halfLength

export function createGausianWeightFunction () {

  function setWindowWidth(beginpos, endpos) {
    begin = beginpos
    end = endpos
    halfLength = (end - begin) / 2
    middle = halfLength + begin
  }

  function weight (position) {
    if (position >= begin && end >= position) {
      const normalizedDistance = Math.abs((middle - position) / halfLength)
      return Math.exp(-0.5 * Math.pow(normalizedDistance, 2))
    } else {
      return 0
    }
  }

  return {
    setWindowWidth,
    weight
  }
}
