/* eslint-disable no-use-before-define */
import { Column, Row, ColumnJustification, Padding } from './types'
import { Rect } from '../types/geometry'
import { getLeftMargin, getRightMargin, getTopMargin, getBottomMargin, getLeftPadding, getTopPadding, getBottomPadding, getRightPadding, getVerticalMargin, getHorizontalMargin } from './dimensions'

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
  const topMargin = getTopMargin(rowTemplate.margin)
  const bottomMargin = getBottomMargin(rowTemplate.margin)
  const leftMargin = getLeftMargin(rowTemplate.margin)
  const rightMargin = getRightMargin(rowTemplate.margin)

  const width = rowTemplate.width ?? (rect.width - leftMargin - rightMargin)
  const height = rowTemplate.height ?? ((rect.height / numRows) - topMargin - bottomMargin)

  const x = rect.x + leftMargin
  let { y } = rect

  for (let i = 0; i < numRows; i += 1) {
    y += topMargin
    renderRow({ x, y, width, height }, rowTemplate, i)
    y += height + bottomMargin
  }
}
const renderRowColumnTemplate = (rect: Rect, columnTemplate: Column, numColumns: number) => {
  const topMargin = getTopMargin(columnTemplate.margin)
  const leftMargin = getLeftMargin(columnTemplate.margin)
  const rightMargin = getRightMargin(columnTemplate.margin)
  const bottomMargin = getBottomMargin(columnTemplate.margin)

  const width = columnTemplate.width ?? ((rect.width / numColumns) - leftMargin - rightMargin)
  const height = columnTemplate.height ?? (rect.height - topMargin - bottomMargin)

  let { x } = rect
  const y = rect.y + topMargin

  for (let i = 0; i < numColumns; i += 1) {
    x += leftMargin
    renderColumn({ x, y, width, height }, columnTemplate, i)
    x += width + rightMargin
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

const renderColumnRows = (rect: Rect, column: Column) => {
  const _rows = column.rows.filter(row => row != null)

  const totalDefinedHeight = _rows.reduce((acc, row) => acc + (row.height ?? 0) + getVerticalMargin(row.margin), 0)
  const totalUndefinedHeight = Math.max(0, rect.height - totalDefinedHeight)
  const numRowsWithUndefinedHeight = _rows.filter(row => (row.height == null && row.boundingHeight === 0)).length

  const heightPerRowWithUndefinedHeight = numRowsWithUndefinedHeight === 0
    ? 0
    : totalUndefinedHeight / numRowsWithUndefinedHeight

  let { y } = rect
  _rows.forEach((row, i) => {
    const topMargin = getTopMargin(row.margin)
    const bottomMargin = getBottomMargin(row.margin)
    const leftMargin = getLeftMargin(row.margin)
    const rightMargin = getRightMargin(row.margin)

    const x = rect.x + leftMargin
    const width = row.width ?? (rect.width - leftMargin - rightMargin)
    const height = row.height ?? (row.boundingHeight !== 0 ? row.boundingHeight : heightPerRowWithUndefinedHeight)
    y += topMargin
    renderRow({ x, y, width, height }, row, i)
    y += height + bottomMargin
  })
}

const renderRowColumns = (rect: Rect, row: Row) => {
  const _columns = row.columns.filter(col => col != null)

  const totalDefinedWidth = _columns.reduce((acc, col) => acc + (col.width ?? 0) + getHorizontalMargin(col.margin), 0)
  const totalUndefinedWidth = Math.max(0, rect.width - totalDefinedWidth)
  const numColumnsWithUndefinedWidth = _columns.filter(col => (col.width == null && col.boundingWidth === 0)).length

  const widthPerColumnWithUndefinedWidth = numColumnsWithUndefinedWidth === 0
    ? 0
    : totalUndefinedWidth / numColumnsWithUndefinedWidth

  let x = row.columnJustification != null && numColumnsWithUndefinedWidth === 0
    ? getStartingXOfColumns(totalDefinedWidth, rect.x, rect.width, row.columnJustification)
    : rect.x

  _columns.filter(col => col != null).forEach((col, i) => {
    const topMargin = getTopMargin(col.margin)
    const leftMargin = getLeftMargin(col.margin)
    const rightMargin = getRightMargin(col.margin)
    const bottomMargin = getBottomMargin(col.margin)

    const y = rect.y + topMargin
    const width = col.width ?? (col.boundingWidth !== 0 ? col.boundingWidth : widthPerColumnWithUndefinedWidth)
    const height = col.height ?? (rect.height - topMargin - bottomMargin)
    x += leftMargin
    renderColumn({ x, y, width, height }, col, i)
    x += width + rightMargin
  })
}

const renderRow = (rect: Rect, row: Row, index: number) => {
  if (row == null)
    return

  if (row.render != null)
    row.render(rect, index)

  const paddedRect = createPaddedRect(rect, row.padding)

  if (row.columnTemplate != null && row.numColumns > 0)
    renderRowColumnTemplate(paddedRect, row.columnTemplate, row.numColumns)

  if (row.columns != null)
    renderRowColumns(paddedRect, row)
}

export const renderColumn = (rect: Rect, column: Column, index: number) => {
  if (column == null)
    return

  if (column.render != null)
    column.render(rect, index)

  const paddedRect = createPaddedRect(rect, column.padding)

  if (column.rowTemplate != null && column.numRows > 0)
    renderColumnRowTemplate(paddedRect, column.rowTemplate, column.numRows)

  if (column.rows != null)
    renderColumnRows(paddedRect, column)
}
