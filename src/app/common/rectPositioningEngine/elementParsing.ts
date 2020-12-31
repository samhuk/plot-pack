import { parseDecimalNumberString } from '../helpers/math'
import { setColumnBoundingDimensions } from './boundingDimensions'
import { getNormalizedMargin } from './margin'
import { getNormalizedPadding } from './padding'
import { Column, ColumnJustification, InputColumn, InputRow, Row, RowJustification, SizeUnit } from './types'

/* eslint-disable no-use-before-define */

const sizeUnitStringToSizeUnitMap: { [sizeUnitString: string]: SizeUnit } = {
  px: SizeUnit.PX,
  '%': SizeUnit.PERCENT,
}

const normalizeDimensionValue = (dimensionValue: number | string): { value: number, sizeUnit: SizeUnit } => {
  if (dimensionValue == null)
    return null

  // If is a number, then assume px units
  if (typeof dimensionValue === 'number')
    return { value: dimensionValue, sizeUnit: SizeUnit.PX }
  // Else try and parse the string into a value and size units
  const parsedDimensionValue = parseDecimalNumberString(dimensionValue)
  // If parsing fails, return null
  if (parsedDimensionValue == null)
    return null

  return { value: parsedDimensionValue.value, sizeUnit: sizeUnitStringToSizeUnitMap[parsedDimensionValue.suffix] ?? SizeUnit.PX }
}

const parseInputRow = (row: InputRow): Row => {
  if (row == null)
    return null

  const normalizedHeight = normalizeDimensionValue(row.height)
  const normalizedWidth = normalizeDimensionValue(row.width)

  return {
    id: row.id,
    render: row.render,
    height: normalizedHeight?.value,
    heightUnits: normalizedHeight?.sizeUnit,
    width: normalizedWidth?.value,
    widthUnits: normalizedWidth?.sizeUnit,
    columns: row.columns != null ? row.columns.map(parseInputColumnInternal) : null,
    columnTemplate: parseInputColumnInternal(row.columnTemplate),
    // Set bounding dimensions to null for now, we will set them later
    boundingHeight: null,
    boundingWidth: null,
    columnJustification: row.columnJustification ?? ColumnJustification.LEFT,
    evenlyFillAvailableHeight: row.evenlyFillAvailableHeight ?? false,
    margin: getNormalizedMargin(row.margin),
    padding: getNormalizedPadding(row.padding),
    numColumns: row.numColumns,
  }
}

const parseInputColumnInternal = (column: InputColumn): Column => {
  if (column == null)
    return null

  const normalizedHeight = normalizeDimensionValue(column.height)
  const normalizedWidth = normalizeDimensionValue(column.width)

  return {
    id: column.id,
    render: column.render,
    height: normalizedHeight?.value,
    heightUnits: normalizedHeight?.sizeUnit,
    width: normalizedWidth?.value,
    widthUnits: normalizedWidth?.sizeUnit,
    rows: column.rows != null ? column.rows.map(parseInputRow) : null,
    rowTemplate: parseInputRow(column.rowTemplate),
    // Set bounding dimensions to null for now, we will set them later
    boundingHeight: null,
    boundingWidth: null,
    rowJustification: column.rowJustification ?? RowJustification.TOP,
    evenlyFillAvailableWidth: column.evenlyFillAvailableWidth ?? false,
    margin: getNormalizedMargin(column.margin),
    padding: getNormalizedPadding(column.padding),
    numRows: column.numRows,
  }
}

/**
 * @example
 * 100, 'px' -> '100px'
 * 75.2, '%' -> '75.2%'
 * 75.2, null -> '75.2px'
 */
export const createDimensionValue = (value: number, sizeUnit: SizeUnit) => (value != null
  ? value.toString().concat(sizeUnit ?? SizeUnit.PX)
  : null)

export const parseInputColumn = (inputColumn: InputColumn): Column => {
  /* Recursively goes through the row-column tree to parse the input column to column,
   * minus the bounding dimensions part (sets these values to null initially)
   */
  const column = parseInputColumnInternal(inputColumn)
  /* Recursively goes through the row-column tree again to set the bounding dimensions
   * of each row and column.
   */
  setColumnBoundingDimensions(column)
  return column
}
