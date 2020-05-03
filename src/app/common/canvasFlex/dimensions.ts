/* eslint-disable no-use-before-define */
import { Row, Column, Margin, Padding, InputColumn, InputRow } from './types'

export const getLeftPadding = (padding: Padding) => (padding != null
  ? (typeof padding === 'number'
    ? padding
    : (padding.left ?? 0)
  ) : 0
)

export const getRightPadding = (padding: Padding) => (padding != null
  ? (typeof padding === 'number'
    ? padding
    : (padding.right ?? 0)
  ) : 0
)

export const getHorizontalPadding = (padding: Padding) => (padding != null
  ? (typeof padding === 'number'
    ? 2 * padding
    : (padding.left ?? 0) + (padding.right ?? 0)
  ) : 0
)

export const getVerticalPadding = (padding: Padding) => (padding != null
  ? (typeof padding === 'number'
    ? 2 * padding
    : (padding.top ?? 0) + (padding.bottom ?? 0)
  ) : 0
)

export const getTopPadding = (padding: Padding) => (padding != null
  ? (typeof padding === 'number'
    ? padding
    : (padding.top ?? 0)
  ) : 0
)

export const getBottomPadding = (padding: Padding) => (padding != null
  ? (typeof padding === 'number'
    ? padding
    : (padding.bottom ?? 0)
  ) : 0
)

export const getLeftMargin = (margin: Margin) => (margin != null
  ? (typeof margin === 'number'
    ? margin
    : (margin.left ?? 0)
  ) : 0
)

export const getRightMargin = (margin: Margin) => (margin != null
  ? (typeof margin === 'number'
    ? margin
    : (margin.right ?? 0)
  ) : 0
)

export const getTopMargin = (margin: Margin) => (margin != null
  ? (typeof margin === 'number'
    ? margin
    : (margin.top ?? 0)
  ) : 0
)

export const getBottomMargin = (margin: Margin) => (margin != null
  ? (typeof margin === 'number'
    ? margin
    : (margin.bottom ?? 0)
  ) : 0
)

export const getHorizontalMargin = (margin: Margin) => (margin != null
  ? (typeof margin === 'number'
    ? 2 * margin
    : (margin.left ?? 0) + (margin.right ?? 0)
  ) : 0
)

export const getVerticalMargin = (margin: Margin) => (margin != null
  ? (typeof margin === 'number'
    ? 2 * margin
    : (margin.top ?? 0) + (margin.bottom ?? 0)
  ) : 0
)

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

  const width = (row.width ?? (dimensionsOfColumns.width + getHorizontalPadding(row.padding))) + getHorizontalMargin(row.margin)
  const height = (row.height ?? (dimensionsOfColumns.height + getVerticalPadding(row.padding))) + getVerticalMargin(row.margin)

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

  const width = (column.width ?? (dimensionsOfRows.width + getHorizontalPadding(column.padding))) + getHorizontalMargin(column.margin)
  const height = (column.height ?? (dimensionsOfRows.height + getVerticalPadding(column.padding))) + getVerticalMargin(column.margin)

  const _column = column as Column
  _column.boundingWidth = width
  _column.boundingHeight = height

  return { width, height }
}

export const sizeInputColumn = (column: InputColumn): Column => {
  getDimensionsOfColumn(column)
  return column as Column
}
