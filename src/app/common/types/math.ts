export type Range2D = {
  start: number;
  end: number;
}

/**
 * Possible number formats.
 */
export enum NumberFormatNotation {
  /**
   * I.e. 123.45
   */
  DECIMAL = 'decimal',
  /**
   * I.e. 1.2345 x 10^2
   */
  SCIENTIFIC = 'scientific',
}
