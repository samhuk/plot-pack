/**
 * The possible modes that error bars can be expressed as part of a datum's value for a particular axis.
 */
export enum ErrorBarsMode {
  /**
   * For if a datum value for an axis like `[5, 1]` that represents 5 +/- 1
   *
   * Datum template: [{datum value}, {abs error}]
   */
  ONE_ABSOLUTE_DIFFERENCE = 'one_absolute_difference',
  /**
   * For if a datum value for an axis like `[5, 0.01]` that represents 5 +/- 1% (which itself represents 5 +/- 0.05)
   *
   * Datum template: [{datum value}, {% error}]
   */
  ONE_RELATIVE_DIFFERENCE = 'one_relative_difference',
  /**
   * For if a datum value for an axis like `[5, 1, 2]` that represents 5 +1,-2
   *
   * Datum template: [{datum value}, {+ve abs error}, {-ve abs error}]
   */
  TWO_ABSOLUTE_DIFFERENCE = 'two_absolute_difference',
  /**
   * For if a datum value for an axis like `[5, 0.01, 0.02]` that represents `5 +1%,-2%` (which itself represents 5 +0.05,-0.1).
   *
   * Datum template: [{datum value}, {+ve % error}, {-ve % error}]
   */
  TWO_RELATIVE_DIFFERENCE = 'two_relative_difference',
  /**
   * For if a datum like `[5, 4, 6]` that represents `5, min 4, max 6`
   *
   * Datum template: [{datum value}, {max value}, {min value}]
   */
  TWO_ABSOLUTE_VALUE = 'two_absolute_value',
}

export default ErrorBarsMode
