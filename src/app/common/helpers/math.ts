import Bound from '../../components/graph/types/Bound'
import { Point2D } from '../types/geometry'
import { NumberFormatNotation } from '../types/math'

export const boundToRange = (x: number, bound1: number, bound2: number) => {
  const lowerBound = Math.min(bound1, bound2)
  const upperBound = Math.max(bound1, bound2)
  if (x < lowerBound)
    return lowerBound
  if (x > upperBound)
    return upperBound
  return x
}
export const isInRange = (bound1: number, bound2: number, x: number) => {
  if (bound1 < bound2)
    return x >= bound1 && x <= bound2
  return x >= bound2 && x <= bound1
}

export const sum = (array: number[]): number => array.reduce((acc, value) => acc + value, 0)

export const roundDecimalPlaces = (value: number, numPlaces: number = 0) => {
  const multiplicator = 10 ** numPlaces
  const roundedValue = parseFloat((value * multiplicator).toFixed(11))
  return Math.round(roundedValue) / multiplicator
}

/**
 * Fixed modulo operator. Javascript does not correctly implement negative numbers for it.
 */
export const mod = (x: number, n: number) => ((x % n) + n) % n

export const getBoundsOfValues = (array: number[]): Bound => {
  if (array == null)
    return null
  if (array.length === 0)
    return { lower: 0, upper: 0 }

  let lower = array[0]
  let upper = array[0]

  for (let i = 1; i < array.length; i += 1) {
    if (array[i] < lower)
      lower = array[i]
    if (array[i] > upper)
      upper = array[i]
  }

  return { lower, upper }
}

export const getBoundsOfValues2D = (array: Point2D[]): { x: Bound, y: Bound } => {
  if (array == null)
    return null
  if (array.length === 0)
    return { x: { lower: 0, upper: 0 }, y: { lower: 0, upper: 0 } }

  let lowerX = array[0].x
  let upperX = array[0].x
  let lowerY = array[0].y
  let upperY = array[0].y

  for (let i = 1; i < array.length; i += 1) {
    if (array[i].x < lowerX)
      lowerX = array[i].x
    if (array[i].x > upperX)
      upperX = array[i].x
    if (array[i].y < lowerY)
      lowerY = array[i].y
    if (array[i].y > upperY)
      upperY = array[i].y
  }

  return { x: { lower: lowerX, upper: upperX }, y: { lower: lowerY, upper: upperY } }
}

export const formatNumber = (value: number, notation?: NumberFormatNotation, numFigures?: number) => {
  const defaultValue = value.toString()

  if (notation == null || notation === NumberFormatNotation.DECIMAL) {
    if (numFigures != null)
      return roundDecimalPlaces(value, numFigures).toFixed(numFigures)
    return defaultValue
  }
  if (notation === NumberFormatNotation.SCIENTIFIC) {
    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(value)))
    const normalizedValue = value / (10 ** orderOfMagnitude)
    const roundedValue = numFigures != null
      ? roundDecimalPlaces(normalizedValue, numFigures + 1).toFixed(numFigures)
      : normalizedValue
    return `${roundedValue} x10^${orderOfMagnitude}`
  }

  return defaultValue
}
