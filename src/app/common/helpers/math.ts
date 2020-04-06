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
