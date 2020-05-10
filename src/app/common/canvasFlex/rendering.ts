/* eslint-disable no-use-before-define */
import { Column, Row, ColumnJustification, SizeUnit, InputPadding } from './types'
import { Rect } from '../types/geometry'
import { getLeftMargin,
  getRightMargin,
  getVerticalMargin,
  getNormalizedMargin,
  getNormalizedPadding,
  getHorizontalMargin } from './dimensions'

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
  const margin = getNormalizedMargin(rowTemplate.margin)

  const width = rowTemplate.width ?? (rect.width - margin.left - margin.right)
  const height = rowTemplate.height ?? ((rect.height / numRows) - margin.top - margin.bottom)

  const x = rect.x + margin.left
  let { y } = rect

  for (let i = 0; i < numRows; i += 1) {
    y += margin.top
    renderRow({ x, y, width, height }, rowTemplate, i)
    y += height + margin.bottom
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

const getRowHeight = (columnRect: Rect, row: Row, evenlyFillHeightValue: number) => (
  row.heightUnits === SizeUnit.PERCENT
    ? ((row.height ?? 0) * columnRect.height) / 100 - getVerticalMargin(row.margin)
    : (row.height ?? ((row.evenlyFillAvailableHeight ?? false) ? evenlyFillHeightValue : row.boundingHeight))
)

const renderColumnRows = (rect: Rect, column: Column) => {
  const _rows = column.rows.filter(row => row != null)

  const totalExplicitHeight = _rows.reduce((acc, row) => (
    acc + getRowHeight(rect, row, 0) + getVerticalMargin(row.margin)
  ), 0)
  const totalImplicitHeight = Math.max(0, rect.height - totalExplicitHeight)
  const numRowsWithImplicitHeight = _rows.filter(row => (row.height == null && !row.evenlyFillAvailableHeight)).length

  const heightPerRowWithUndefinedHeight = numRowsWithImplicitHeight === 0
    ? 0
    : totalImplicitHeight / numRowsWithImplicitHeight

  let { y } = rect
  _rows
    .map((row): { row: Row, rect: Rect } => {
      const margin = getNormalizedMargin(row.margin)

      const x = rect.x + margin.left
      const width = row.widthUnits === SizeUnit.PERCENT
        ? ((row.width ?? 0) * rect.width) / 100 - margin.left - margin.right
        : (row.width ?? row.boundingWidth)
      const height = getRowHeight(rect, row, heightPerRowWithUndefinedHeight)

      y += margin.top
      const rowRect: Rect = { x, y, width, height }
      y += height + margin.bottom

      return { row, rect: rowRect }
    })
    .forEach((rowAndRect, i) => renderRow(rowAndRect.rect, rowAndRect.row, i))
}

const getColumnWidth = (rowRect: Rect, column: Column, evenlyFillWidthValue: number) => (
  column.widthUnits === SizeUnit.PERCENT
    ? ((column.width ?? 0) * rowRect.width) / 100 - getHorizontalMargin(column.margin)
    : (column.width ?? ((column.evenlyFillAvailableWidth ?? false) ? evenlyFillWidthValue : column.boundingWidth))
)

const renderRowColumns = (rect: Rect, row: Row) => {
  const _columns = row.columns.filter(col => col != null)

  const totalExplicitWidth = _columns.reduce((acc, col) => {
    const definedWidth = getColumnWidth(rect, col, 0)
    const leftMargin = getLeftMargin(col.margin)
    const rightMargin = getRightMargin(col.margin)
    return acc + definedWidth + leftMargin + rightMargin
  }, 0)
  const totalImplicitWidth = Math.max(0, rect.width - totalExplicitWidth)
  const numColumnsWithImplicitWidth = _columns.filter(col => col.width == null && col.evenlyFillAvailableWidth).length

  const widthPerColumnWithImplicitWidth = numColumnsWithImplicitWidth === 0
    ? 0
    : totalImplicitWidth / numColumnsWithImplicitWidth

  let x = row.columnJustification != null && widthPerColumnWithImplicitWidth === 0
    ? getStartingXOfColumns(totalExplicitWidth, rect.x, rect.width, row.columnJustification)
    : rect.x

  _columns
    .map((col): { column: Column, rect: Rect } => {
      const margin = getNormalizedMargin(col.margin)

      const y = rect.y + margin.top
      const width = getColumnWidth(rect, col, widthPerColumnWithImplicitWidth)
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
