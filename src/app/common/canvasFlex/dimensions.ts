/* eslint-disable no-use-before-define */
import { Row, Column, Margin, SizedColumn, SizedRow, Padding } from './types'

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

const getDimensionsOfColumnTemplates = (columnTemplate: Column, numColumns: number) => {
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

const getDimensionsOfColumns = (columns: Column[]) => {
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

const getDimensionsOfRowTemplates = (rowTemplate: Row, numRows: number) => {
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

const getDimensionsOfRows = (rows: Row[]) => {
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

const getDimensionsOfRow = (row: Row): { height: number, width: number } => {
  if (row == null)
    return { width: 0, height: 0 }

  const dimensionsOfColumns = row.columnTemplate != null && row.numColumns > 0
    ? getDimensionsOfColumnTemplates(row.columnTemplate, row.numColumns)
    : (row.columns != null
      ? getDimensionsOfColumns(row.columns)
      : { width: 0, height: 0 }
    )

  const width = (row.width ?? dimensionsOfColumns.width) + getHorizontalMargin(row.margin) + getHorizontalPadding(row.padding)
  const height = (row.height ?? dimensionsOfColumns.height) + getVerticalMargin(row.margin) + getVerticalPadding(row.padding)

  return { width, height }
}

export const getDimensionsOfColumn = (column: Column): { height: number, width: number } => {
  if (column == null)
    return { width: 0, height: 0 }

  const dimensionsOfRows = column.rowTemplate != null && column.numRows > 0
    ? getDimensionsOfRowTemplates(column.rowTemplate, column.numRows)
    : (column.rows != null
      ? getDimensionsOfRows(column.rows)
      : { width: 0, height: 0 }
    )


  const width = (column.width ?? dimensionsOfRows.width) + getHorizontalMargin(column.margin) + getHorizontalPadding(column.padding)
  const height = (column.height ?? dimensionsOfRows.height) + getVerticalMargin(column.margin) + getVerticalPadding(column.padding)

  return { width, height }
}
