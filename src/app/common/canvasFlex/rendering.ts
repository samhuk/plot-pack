/* eslint-disable no-use-before-define */
import { Column, Row, ColumnJustification, SizeUnit, InputPadding, Margin } from './types'
import { Rect } from '../types/geometry'
import { getNormalizedMargin } from './margin'
import { getNormalizedPadding } from './padding'

const createPaddedRect = (rect: Rect, inputPadding: InputPadding): Rect => {
  const padding = getNormalizedPadding(inputPadding)

  return {
    x: rect.x + padding.left,
    y: rect.y + padding.top,
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

  // Create the rect for each row
  const rowRects: Rect[] = []
  for (let i = 0; i < numRows; i += 1) {
    y += margin.top
    rowRects.push({ x, y, width, height })
    y += height + margin.bottom
  }
  // Render each row
  rowRects.forEach((rowRect, i) => renderRow(rowRect, rowTemplate, i))
}
const renderRowColumnTemplate = (rect: Rect, columnTemplate: Column, numColumns: number) => {
  const margin = getNormalizedMargin(columnTemplate.margin)

  const width = columnTemplate.width ?? ((rect.width / numColumns) - margin.left - margin.right)
  const height = columnTemplate.height ?? (rect.height - margin.top - margin.bottom)

  const y = rect.y + margin.top
  let { x } = rect

  // Create the rect for each column
  const columnRects: Rect[] = []
  for (let i = 0; i < numColumns; i += 1) {
    x += margin.left
    columnRects.push({ x, y, width, height })
    x += width + margin.right
  }
  // Render each column
  columnRects.forEach((colRect, i) => renderColumn(colRect, columnTemplate, i))
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

const getRowWidth = (columnRect: Rect, row: Row, rowMargin: Margin) => (
  row.widthUnits === SizeUnit.PERCENT
    ? ((row.width ?? 0) * columnRect.width) / 100 - rowMargin.left - rowMargin.right
    : (row.width ?? row.boundingWidth)
)

const getRowHeight = (columnRect: Rect, row: Row, rowMargin: Margin, evenlyFillHeightValue: number) => (
  row.heightUnits === SizeUnit.PERCENT
    ? ((row.height ?? 0) * columnRect.height) / 100 - rowMargin.top - rowMargin.bottom
    : (row.height ?? ((row.evenlyFillAvailableHeight ?? false) ? evenlyFillHeightValue : row.boundingHeight))
)

const renderColumnRows = (rect: Rect, column: Column) => {
  const _rows = column.rows.filter(row => row != null)

  const totalExplicitHeight = _rows.reduce((acc, row) => {
    const rowMargin = getNormalizedMargin(row.margin)
    return acc + getRowHeight(rect, row, rowMargin, 0) + rowMargin.top + rowMargin.bottom
  }, 0)
  const totalImplicitHeight = Math.max(0, rect.height - totalExplicitHeight)
  const numRowsWithImplicitHeight = _rows.filter(row => (row.height == null && row.evenlyFillAvailableHeight)).length

  const heightPerRowWithUndefinedHeight = numRowsWithImplicitHeight === 0
    ? 0
    : totalImplicitHeight / numRowsWithImplicitHeight

  let { y } = rect
  _rows
    .map((row): { row: Row, rect: Rect } => {
      const rowMargin = getNormalizedMargin(row.margin)

      const width = getRowWidth(rect, row, rowMargin)
      const height = getRowHeight(rect, row, rowMargin, heightPerRowWithUndefinedHeight)

      const x = rect.x + rowMargin.left
      y += rowMargin.top
      const rowRect: Rect = { x, y, width, height }
      y += height + rowMargin.bottom

      return { row, rect: rowRect }
    })
    .forEach((rowAndRect, i) => renderRow(rowAndRect.rect, rowAndRect.row, i))
}

const getColumnHeight = (rowRect: Rect, column: Column, columnMargin: Margin) => (
  column.heightUnits === SizeUnit.PERCENT
    ? ((column.height ?? 0) * rowRect.height) / 100 - columnMargin.top - columnMargin.bottom
    : (column.height ?? column.boundingHeight)
)

const getColumnWidth = (rowRect: Rect, column: Column, columnMargin: Margin, evenlyFillWidthValue: number) => (
  column.widthUnits === SizeUnit.PERCENT
    ? ((column.width ?? 0) * rowRect.width) / 100 - columnMargin.left - columnMargin.right
    : (column.width ?? ((column.evenlyFillAvailableWidth ?? false) ? evenlyFillWidthValue : column.boundingWidth))
)

const renderRowColumns = (rect: Rect, row: Row) => {
  const _columns = row.columns.filter(col => col != null)

  const totalExplicitWidth = _columns.reduce((acc, col) => {
    const columnMargin = getNormalizedMargin(col.margin)
    const definedWidth = getColumnWidth(rect, col, columnMargin, 0)
    return acc + definedWidth + columnMargin.left + columnMargin.right
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
      const columnMargin = getNormalizedMargin(col.margin)

      const width = getColumnWidth(rect, col, columnMargin, widthPerColumnWithImplicitWidth)
      const height = getColumnHeight(rect, col, columnMargin)

      const y = rect.y + columnMargin.top
      x += columnMargin.left
      const columnRect: Rect = { x, y, width, height }
      x += width + columnMargin.right

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
