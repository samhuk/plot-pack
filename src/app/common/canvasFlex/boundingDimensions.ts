/**
 * Responsible for measuring the bounding dimensions (i.e. width and height) of columns and rows.
 */
/* eslint-disable no-use-before-define */
import { Row, Column, InputColumn, InputRow, SizeUnit } from './types'
import { getHorizontalPadding, getVerticalPadding } from './padding'
import { getHorizontalMargin, getVerticalMargin } from './margin'

const getBoundingDimensionsOfColumnTemplates = (columnTemplate: InputColumn, numColumns: number) => {
  let width = 0
  let height = 0

  for (let i = 0; i < numColumns; i += 1) {
    const boundingDimensions = getBoundingDimensionsOfColumn(columnTemplate)
    if (boundingDimensions.height > height)
      height = boundingDimensions.height
    width += boundingDimensions.width
  }

  return { width, height }
}

const getBoundingDimensionsOfRowTemplates = (rowTemplate: InputRow, numRows: number) => {
  let width = 0
  let height = 0

  for (let i = 0; i < numRows; i += 1) {
    const boundingDimensions = getBoundingDimensionsOfRow(rowTemplate)
    if (boundingDimensions.width > width)
      width = boundingDimensions.width
    height += boundingDimensions.height
  }

  return { width, height }
}

const getBoundingDimensionsOfColumns = (columns: InputColumn[]) => {
  let width = 0
  let height = 0

  for (let i = 0; i < columns.length; i += 1) {
    const boundingDimensions = getBoundingDimensionsOfColumn(columns[i])
    if (boundingDimensions.height > height)
      height = boundingDimensions.height
    width += boundingDimensions.width
  }

  return { width, height }
}

const getBoundingDimensionsOfRows = (rows: InputRow[]) => {
  let width = 0
  let height = 0

  for (let i = 0; i < rows.length; i += 1) {
    const boundingDimensions = getBoundingDimensionsOfRow(rows[i])
    if (boundingDimensions.width > width)
      width = boundingDimensions.width
    height += boundingDimensions.height
  }

  return { width, height }
}

const getBoundingDimensionsOfRow = (row: InputRow): { height: number, width: number } => {
  if (row == null)
    return { width: 0, height: 0 }

  const boundingDimensionsOfColumns = row.columnTemplate != null && row.numColumns > 0
    ? getBoundingDimensionsOfColumnTemplates(row.columnTemplate, row.numColumns)
    : (row.columns != null
      ? getBoundingDimensionsOfColumns(row.columns)
      : { width: 0, height: 0 }
    )

  const width = row.widthUnits === SizeUnit.PERCENT
    ? 0
    : (row.width ?? (boundingDimensionsOfColumns.width + getHorizontalPadding(row.padding))) + getHorizontalMargin(row.margin)
  const height = row.heightUnits === SizeUnit.PERCENT
    ? 0
    : (row.height ?? (boundingDimensionsOfColumns.height + getVerticalPadding(row.padding))) + getVerticalMargin(row.margin)

  const _row = row as Row
  _row.boundingWidth = width
  _row.boundingHeight = height

  return { width, height }
}

const getBoundingDimensionsOfColumn = (column: InputColumn): { height: number, width: number } => {
  if (column == null)
    return { width: 0, height: 0 }

  const boundingDimensionsOfRows = column.rowTemplate != null && column.numRows > 0
    ? getBoundingDimensionsOfRowTemplates(column.rowTemplate, column.numRows)
    : (column.rows != null
      ? getBoundingDimensionsOfRows(column.rows)
      : { width: 0, height: 0 }
    )

  const width = column.widthUnits === SizeUnit.PERCENT
    ? 0
    : (column.width ?? (boundingDimensionsOfRows.width + getHorizontalPadding(column.padding))) + getHorizontalMargin(column.margin)
  const height = column.heightUnits === SizeUnit.PERCENT
    ? 0
    : (column.height ?? (boundingDimensionsOfRows.height + getVerticalPadding(column.padding))) + getVerticalMargin(column.margin)

  const _column = column as Column
  _column.boundingWidth = width
  _column.boundingHeight = height

  return { width, height }
}

/**
 * Calculates the bounding dimensions of each row and column within the given input column.
 * This is useful if you need to know the bounding dimensions of the given input column before
 * rendering, which is common when rendering dialogs, tooltips, dropdowns, etc..
 */
export const sizeInputColumn = (column: InputColumn): Column => {
  getBoundingDimensionsOfColumn(column)
  return column as Column
}
