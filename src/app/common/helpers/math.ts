import Bound from '../../components/chart/types/Bound'
import { Point2D } from '../types/geometry'
import { NumberFormatNotation } from '../types/math'

const DECIMAL_NUMBER_WITH_SUFFIX_REGEX = new RegExp(/([0-9]+)?(\.[0-9]+)?(.*)/g)

/**
 * @example
 * '100%' -> { value: 100, suffix: string }
 * '65px' -> { value: 65, suffix: 'px' }
 * '72.5%' -> { value: 72.5, suffix: '%' }
 * '.5%' -> { value: 0.5, suffix: '%' }
 * '.5' -> { value: 0.5, suffix: null }
 */
export const parseDecimalNumberString = (value: string): { value: number, suffix: string } => {
  if (value == null)
    return null

  DECIMAL_NUMBER_WITH_SUFFIX_REGEX.lastIndex = 0
  const matches = DECIMAL_NUMBER_WITH_SUFFIX_REGEX.exec(value.trim())
  if (matches == null)
    return null

  const integerPart = matches[1] != null ? parseInt(matches[0]) : 0
  const decimalPart = matches[2] != null ? parseInt(matches[1].substring(1)) : 0
  const suffix = matches[3] != null ? matches[3].trimStart() : null
  const _value = integerPart + (decimalPart === 0 ? 0 : decimalPart * (10 ** -(Math.floor(Math.log10(decimalPart)) + 1)))

  return { value: _value, suffix }
}

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

export const isInRangeOptionalBounds = (x: number, lowerBound?: number, upperBound?: number) => (
  (lowerBound == null || x >= lowerBound) && (upperBound == null || x <= upperBound)
)

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
