/* eslint-disable no-use-before-define */
import { Column, Row, ColumnJustification, Padding } from './types'
import { Rect } from '../types/geometry'
import { getLeftMargin, getRightMargin, getTopMargin, getBottomMargin, getLeftPadding, getTopPadding, getBottomPadding, getRightPadding } from './dimensions'

const createPaddedRect = (rect: Rect, padding: Padding): Rect => {
  const topPadding = getTopPadding(padding)
  const bottomPadding = getBottomPadding(padding)
  const leftPadding = getLeftPadding(padding)
  const rightPadding = getRightPadding(padding)

  return {
    x: rect.x + leftPadding,
    y: rect.y + topPadding,
    width: Math.max(0, rect.width - (leftPadding + rightPadding)),
    height: Math.max(0, rect.height - (topPadding + bottomPadding)),
  }
}

const renderColumnRowTemplate = (rect: Rect, rowTemplate: Row, numRows: number) => {
  const rowHeight = rowTemplate.height ?? rect.height / numRows
  let { y } = rect
  for (let i = 0; i < numRows; i += 1) {
    renderRow({ x: rect.x, y, width: rect.width, height: rowHeight }, rowTemplate, i)
    y += rowHeight
  }
}
const renderRowColumnTemplate = (rect: Rect, columnTemplate: Column, numColumns: number) => {
  const columnWidth = columnTemplate.width ?? rect.width / numColumns
  let { x } = rect
  for (let i = 0; i < numColumns; i += 1) {
    renderColumn({ x, y: rect.y, width: columnWidth, height: rect.height }, columnTemplate, i)
    x += columnWidth
  }
}

const getStartingXOfColumns = (totalColumnWidth: number, rowX: number, rowWidth: number, columnJustification: ColumnJustification) => {
  switch (columnJustification) {
    case ColumnJustification.LEFT:
      return rowX
    case ColumnJustification.RIGHT:
      return rowX + rowWidth - totalColumnWidth
    case ColumnJustification.CENTER:
      return rowX + (rowWidth / 2) - (totalColumnWidth / 2)
    default:
      return rowX
  }
}

const getColumnMarginWidth = (column: Column) => getLeftMargin(column.margin) + getRightMargin(column.margin)

const renderColumnRows = (rect: Rect, column: Column) => {
  const totalDefinedHeight = column.rows.reduce((acc, row) => (row.height != null ? acc + row.height : acc), 0)
  const totalUndefinedHeight = rect.height - totalDefinedHeight
  const numRowsWithUndefinedHeight = column.rows.filter(row => row.height == null).length

  const heightPerRowWithUndefinedHeight = numRowsWithUndefinedHeight === 0
    ? 0
    : totalUndefinedHeight / numRowsWithUndefinedHeight

  let { y } = rect
  column.rows.forEach((row, i) => {
    const height = row.height ?? heightPerRowWithUndefinedHeight
    renderRow({ x: rect.x, y, width: rect.width, height }, row, i)
    y += height
  })
}

const renderRowColumns = (rect: Rect, row: Row) => {
  const totalDefinedWidth = row.columns.reduce((acc, col) => acc + (col.width ?? 0) + getColumnMarginWidth(col), 0)
  const totalUndefinedWidth = rect.width - totalDefinedWidth
  const numColumnsWithUndefinedWidth = row.columns.filter(col => col.width == null).length

  const widthPerColumnWithUndefinedWidth = numColumnsWithUndefinedWidth === 0
    ? 0
    : totalUndefinedWidth / numColumnsWithUndefinedWidth

  let x = row.columnJustification != null && numColumnsWithUndefinedWidth === 0
    ? getStartingXOfColumns(totalDefinedWidth, rect.x, rect.width, row.columnJustification)
    : rect.x

  row.columns.forEach((col, i) => {
    const topMargin = getTopMargin(col.margin)
    const bottomMargin = getBottomMargin(col.margin)
    const leftMargin = getLeftMargin(col.margin)
    const rightMargin = getRightMargin(col.margin)
    const y = rect.y + topMargin
    const width = col.width ?? widthPerColumnWithUndefinedWidth
    const height = rect.height - topMargin - bottomMargin
    x += leftMargin
    renderColumn({ x, y, width, height }, col, i)
    x += width + rightMargin
  })
}

const renderRow = (rect: Rect, row: Row, index: number) => {
  const paddedRect = createPaddedRect(rect, row.padding)

  if (row.render != null)
    row.render(paddedRect, index)

  if (row.columnTemplate != null && row.numColumns > 0)
    renderRowColumnTemplate(paddedRect, row.columnTemplate, row.numColumns)

  if (row.columns != null)
    renderRowColumns(paddedRect, row)
}

export const renderColumn = (rect: Rect, column: Column, index: number) => {
  const paddedRect = createPaddedRect(rect, column.padding)

  if (column.render != null)
    column.render(paddedRect, index)

  if (column.rowTemplate != null && column.numRows > 0)
    renderColumnRowTemplate(paddedRect, column.rowTemplate, column.numRows)

  if (column.rows != null)
    renderColumnRows(paddedRect, column)
}
