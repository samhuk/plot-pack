/* eslint-disable no-use-before-define */
import { Row, Column, InputColumn, InputRow, SizeUnit } from './types'
import { getHorizontalPadding, getVerticalPadding } from './padding'
import { getHorizontalMargin, getVerticalMargin } from './margin'

const getDimensionsOfColumnTemplates = (columnTemplate: InputColumn, numColumns: number) => {
  let width = 0
  let height = 0

  for (let i = 0; i < numColumns; i += 1) {
    const dimensions = getDimensionsOfColumn(columnTemplate)
    if (dimensions.height > height)
      height = dimensions.height
    width += dimensions.width
  }

  return { width, height }
}

const getDimensionsOfRowTemplates = (rowTemplate: InputRow, numRows: number) => {
  let width = 0
  let height = 0

  for (let i = 0; i < numRows; i += 1) {
    const dimensions = getDimensionsOfRow(rowTemplate)
    if (dimensions.width > width)
      width = dimensions.width
    height += dimensions.height
  }

  return { width, height }
}

const getDimensionsOfColumns = (columns: InputColumn[]) => {
  let width = 0
  let height = 0

  for (let i = 0; i < columns.length; i += 1) {
    const dimensions = getDimensionsOfColumn(columns[i])
    if (dimensions.height > height)
      height = dimensions.height
    width += dimensions.width
  }

  return { width, height }
}

const getDimensionsOfRows = (rows: InputRow[]) => {
  let width = 0
  let height = 0

  for (let i = 0; i < rows.length; i += 1) {
    const dimensions = getDimensionsOfRow(rows[i])
    if (dimensions.width > width)
      width = dimensions.width
    height += dimensions.height
  }

  return { width, height }
}

const getDimensionsOfRow = (row: InputRow): { height: number, width: number } => {
  if (row == null)
    return { width: 0, height: 0 }

  const dimensionsOfColumns = row.columnTemplate != null && row.numColumns > 0
    ? getDimensionsOfColumnTemplates(row.columnTemplate, row.numColumns)
    : (row.columns != null
      ? getDimensionsOfColumns(row.columns)
      : { width: 0, height: 0 }
    )

  const width = row.widthUnits === SizeUnit.PERCENT
    ? 0
    : (row.width ?? (dimensionsOfColumns.width + getHorizontalPadding(row.padding))) + getHorizontalMargin(row.margin)
  const height = row.heightUnits === SizeUnit.PERCENT
    ? 0
    : (row.height ?? (dimensionsOfColumns.height + getVerticalPadding(row.padding))) + getVerticalMargin(row.margin)

  const _row = row as Row
  _row.boundingWidth = width
  _row.boundingHeight = height

  return { width, height }
}

const getDimensionsOfColumn = (column: InputColumn): { height: number, width: number } => {
  if (column == null)
    return { width: 0, height: 0 }

  const dimensionsOfRows = column.rowTemplate != null && column.numRows > 0
    ? getDimensionsOfRowTemplates(column.rowTemplate, column.numRows)
    : (column.rows != null
      ? getDimensionsOfRows(column.rows)
      : { width: 0, height: 0 }
    )

  const width = column.widthUnits === SizeUnit.PERCENT
    ? 0
    : (column.width ?? (dimensionsOfRows.width + getHorizontalPadding(column.padding))) + getHorizontalMargin(column.margin)
  const height = column.heightUnits === SizeUnit.PERCENT
    ? 0
    : (column.height ?? (dimensionsOfRows.height + getVerticalPadding(column.padding))) + getVerticalMargin(column.margin)

  const _column = column as Column
  _column.boundingWidth = width
  _column.boundingHeight = height

  return { width, height }
}

export const sizeInputColumn = (column: InputColumn): Column => {
  getDimensionsOfColumn(column)
  return column as Column
}
