export enum ErrorBarsMode {
  ONE_ABSOLUTE_DIFFERENCE, // [5, 1] -> 5 +/- 1
  ONE_RELATIVE_DIFFERENCE, // [5, 0.01] -> 5 +/- 1%
  TWO_ABSOLUTE_DIFFERENCE, // [5, 1, 2] -> 5 +1,-2
  TWO_RELATIVE_DIFFERENCE, // [5, 0.01, 0.02] -> 5 +1%,-2%
  TWO_ABSOLUTE_VALUE, // [5, 4, 6] === 5, min 4, max 6, i.e. 5 +/- 1
}

export default ErrorBarsMode
