/* eslint-disable no-use-before-define */
import { Column, Row, ColumnJustification, SizeUnit, InputPadding } from './types'
import { Rect } from '../types/geometry'
import { getLeftMargin,
  getRightMargin,
  getTopMargin,
  getBottomMargin,
  getVerticalMargin,
  getNormalizedMargin,
  getNormalizedPadding } from './dimensions'

const createPaddedRect = (rect: Rect, inputPadding: InputPadding): Rect => {
  const padding = getNormalizedPadding(inputPadding)

  return {
    x: rect.x + padding.left,
    y: rect.y + padding.right,
    width: Math.max(0, rect.width - (padding.left + padding.right)),
    height: Math.max(0, rect.height - (padding.top + padding.bottom)),
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
  const margin = getNormalizedMargin(columnTemplate.margin)

  const width = columnTemplate.width ?? ((rect.width / numColumns) - margin.left - margin.right)
  const height = columnTemplate.height ?? (rect.height - margin.top - margin.bottom)

  const y = rect.y + margin.top
  let { x } = rect

  for (let i = 0; i < numColumns; i += 1) {
    x += margin.left
    renderColumn({ x, y, width, height }, columnTemplate, i)
    x += width + margin.right
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
  const numRowsWithUndefinedHeight = _rows.filter(row => (row.height == null && !row.evenlyFillAvailableHeight)).length

  const heightPerRowWithUndefinedHeight = numRowsWithUndefinedHeight === 0
    ? 0
    : totalUndefinedHeight / numRowsWithUndefinedHeight

  let { y } = rect
  _rows
    .map((row): { row: Row, rect: Rect } => {
      const margin = getNormalizedMargin(row.margin)

      const x = rect.x + margin.left
      const width = row.widthUnits === SizeUnit.PERCENT
        ? ((row.width ?? 0) * rect.width) / 100 - margin.left - margin.right
        : (row.width ?? row.boundingWidth)
      const height = row.heightUnits === SizeUnit.PERCENT
        ? ((row.height ?? 0) * rect.height) / 100 - margin.top - margin.bottom
        : (row.height ?? ((row.evenlyFillAvailableHeight ?? true) ? heightPerRowWithUndefinedHeight : row.boundingHeight))

      y += margin.top
      const rowRect: Rect = { x, y, width, height }
      y += height + margin.bottom

      return { row, rect: rowRect }
    })
    .forEach((rowAndRect, i) => renderRow(rowAndRect.rect, rowAndRect.row, i))
}

const renderRowColumns = (rect: Rect, row: Row) => {
  const _columns = row.columns.filter(col => col != null)

  const totalDefinedWidth = _columns.reduce((acc, col) => {
    const leftMargin = getLeftMargin(col.margin)
    const rightMargin = getRightMargin(col.margin)
    const definedWidth = col.widthUnits === SizeUnit.PERCENT
      ? ((col.width ?? 0) * rect.width) / 100 - leftMargin - rightMargin
      : (col.width ?? ((col.evenlyFillAvailableWidth ?? true) ? 0 : col.boundingWidth))
    return acc + definedWidth + leftMargin + rightMargin
  }, 0)
  const totalUndefinedWidth = Math.max(0, rect.width - totalDefinedWidth)
  const numColumnsWithUndefinedWidth = _columns.filter(col => col.width == null && col.evenlyFillAvailableWidth).length

  const widthPerColumnWithUndefinedWidth = numColumnsWithUndefinedWidth === 0
    ? 0
    : totalUndefinedWidth / numColumnsWithUndefinedWidth

  let x = row.columnJustification != null && numColumnsWithUndefinedWidth === 0
    ? getStartingXOfColumns(totalDefinedWidth, rect.x, rect.width, row.columnJustification)
    : rect.x

  _columns
    .map((col): { column: Column, rect: Rect } => {
      const margin = getNormalizedMargin(col.margin)

      const y = rect.y + margin.top
      const width = col.widthUnits === SizeUnit.PERCENT
        ? (((col.width ?? 0) * rect.width) / 100) - margin.left - margin.right
        : (col.width ?? ((col.evenlyFillAvailableWidth ?? true) ? widthPerColumnWithUndefinedWidth : col.boundingWidth))
      const height = col.heightUnits === SizeUnit.PERCENT
        ? ((col.height ?? 0) * rect.height) / 100 - margin.top - margin.bottom
        : (col.height ?? col.boundingHeight)

      x += margin.left
      const columnRect: Rect = { x, y, width, height }
      x += width + margin.right

      return { column: col, rect: columnRect }
    })
    .forEach((colAndRect, i) => renderColumn(colAndRect.rect, colAndRect.column, i))
}

const renderRow = (rect: Rect, row: Row, index: number) => {
  if (row == null)
    return

  if (row.render != null)
    row.render(rect, index)

  const paddedRect = createPaddedRect(rect, row.padding)

  if (row.columnTemplate != null && row.numColumns > 0)
    renderRowColumnTemplate(paddedRect, row.columnTemplate, row.numColumns)
  else if (row.columns != null)
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
  else if (column.rows != null)
    renderColumnRows(paddedRect, column)
}
