/* eslint-disable no-use-before-define */
import { Column, Row, ColumnJustification, SizeUnit, Margin, InputColumn, CalculatedRects, RowJustification, Padding } from './types'
import { Rect } from '../types/geometry'
import { parseInputColumn } from './elementParsing'

const createPaddedRect = (rect: Rect, padding: Padding): Rect => ({
  x: rect.x + padding.left,
  y: rect.y + padding.top,
  width: Math.max(0, rect.width - (padding.left + padding.right)),
  height: Math.max(0, rect.height - (padding.top + padding.bottom)),
})

const renderColumnRowTemplate = (rect: Rect, rowTemplate: Row, numRows: number): CalculatedRects => {
  const rowMargin = rowTemplate.margin

  const width = rowTemplate.width ?? (rect.width - rowMargin.left - rowMargin.right)
  const height = rowTemplate.height ?? ((rect.height / numRows) - rowMargin.top - rowMargin.bottom)

  const x = rect.x + rowMargin.left
  let { y } = rect

  // Create the rect for each row
  const rowRects: Rect[] = []
  for (let i = 0; i < numRows; i += 1) {
    y += rowMargin.top
    rowRects.push({ x, y, width, height })
    y += height + rowMargin.bottom
  }
  const calculatedRects: CalculatedRects = {}
  // Render each row
  rowRects.forEach((rowRect, i) => {
    if (rowTemplate.id != null)
      calculatedRects[`${rowTemplate.id}-${i}`] = rowRect
    renderRow(rowRect, rowTemplate, i)
  })

  return calculatedRects
}
const renderRowColumnTemplate = (rect: Rect, columnTemplate: Column, numColumns: number): CalculatedRects => {
  const colMargin = columnTemplate.margin

  const width = columnTemplate.width ?? ((rect.width / numColumns) - colMargin.left - colMargin.right)
  const height = columnTemplate.height ?? (rect.height - colMargin.top - colMargin.bottom)

  const y = rect.y + colMargin.top
  let { x } = rect

  // Create the rect for each column
  const columnRects: Rect[] = []
  for (let i = 0; i < numColumns; i += 1) {
    x += colMargin.left
    columnRects.push({ x, y, width, height })
    x += width + colMargin.right
  }
  const calculatedRects: CalculatedRects = {}
  // Render each column
  columnRects.forEach((colRect, i) => {
    if (columnTemplate.id != null)
      calculatedRects[`${columnTemplate.id}-${i}`] = colRect
    renderColumn(colRect, columnTemplate, i)
  })

  return calculatedRects
}

const getStartingYOfRows = (totalRowHeight: number, columnY: number, columnHeight: number, rowJustification: RowJustification) => {
  switch (rowJustification) {
    case RowJustification.TOP:
      return columnY
    case RowJustification.BOTTOM:
      return columnY + columnHeight - totalRowHeight
    case RowJustification.CENTER:
      return columnY + (columnHeight / 2) - (totalRowHeight / 2)
    default:
      return columnY
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

const getRowWidth = (columnRect: Rect, row: Row, rowMargin: Margin) => (
  row.widthUnits === SizeUnit.PERCENT
    ? ((row.width ?? 0) * columnRect.width) / 100 - rowMargin.left - rowMargin.right
    : (row.width ?? row.boundingWidth)
)

const getRowHeight = (columnRect: Rect, row: Row, rowMargin: Margin, evenlyFillHeightValue: number, includeMargin: boolean) => (
  row.heightUnits === SizeUnit.PERCENT
    ? ((row.height ?? 0) * columnRect.height) / 100 - rowMargin.top - rowMargin.bottom
    : (row.height
      ?? (row.evenlyFillAvailableHeight
        ? evenlyFillHeightValue
        : row.boundingHeight - (includeMargin ? 0 : row.margin.top + row.margin.bottom)
      )
    )
)

const renderColumnRows = (rect: Rect, column: Column): CalculatedRects => {
  const _rows = column.rows.filter(row => row != null)

  const totalExplicitHeight = _rows.reduce((acc, row) => {
    const definedHeight = getRowHeight(rect, row, row.margin, 0, true)
    return acc + definedHeight + row.margin.top + row.margin.bottom
  }, 0)
  const totalImplicitHeight = Math.max(0, rect.height - totalExplicitHeight)
  const numRowsWithImplicitHeight = _rows.filter(row => (row.height == null && row.evenlyFillAvailableHeight)).length

  const heightPerRowWithImplicitHeight = numRowsWithImplicitHeight === 0
    ? 0
    : totalImplicitHeight / numRowsWithImplicitHeight

  const calculatedRects: CalculatedRects = {}

  let y = column.rowJustification != null && heightPerRowWithImplicitHeight === 0
    ? getStartingYOfRows(totalExplicitHeight, rect.y, rect.height, column.rowJustification)
    : rect.y

  _rows
    .map((row): { row: Row, rect: Rect } => {
      const rowMargin = row.margin

      const width = getRowWidth(rect, row, rowMargin)
      const height = getRowHeight(rect, row, rowMargin, heightPerRowWithImplicitHeight, false)

      const x = rect.x + rowMargin.left
      y += rowMargin.top
      const rowRect: Rect = { x, y, width, height }
      y += height + rowMargin.bottom

      return { row, rect: rowRect }
    })
    .forEach((rowAndRect, i) => {
      if (rowAndRect.row.id != null)
        calculatedRects[rowAndRect.row.id] = rowAndRect.rect
      const _childCalculatedRects = renderRow(rowAndRect.rect, rowAndRect.row, i)
      Object.entries(_childCalculatedRects).forEach(([id, _rect]) => calculatedRects[id] = _rect)
    })

  return calculatedRects
}

const getColumnHeight = (rowRect: Rect, column: Column, columnMargin: Margin) => (
  column.heightUnits === SizeUnit.PERCENT
    ? ((column.height ?? 0) * rowRect.height) / 100 - columnMargin.top - columnMargin.bottom
    : (column.height ?? column.boundingHeight)
)

const getColumnWidth = (rowRect: Rect, column: Column, columnMargin: Margin, evenlyFillWidthValue: number, includeMargin: boolean) => (
  column.widthUnits === SizeUnit.PERCENT
    ? ((column.width ?? 0) * rowRect.width) / 100 - columnMargin.left - columnMargin.right
    : (column.width
      ?? (column.evenlyFillAvailableWidth
        ? evenlyFillWidthValue
        : column.boundingWidth - (includeMargin ? 0 : column.margin.left + column.margin.right)
      )
    )
)

const renderRowColumns = (rect: Rect, row: Row): CalculatedRects => {
  const _columns = row.columns.filter(col => col != null)

  const totalExplicitWidth = _columns.reduce((acc, col) => {
    const definedWidth = getColumnWidth(rect, col, col.margin, 0, true)
    return acc + definedWidth + col.margin.left + col.margin.right
  }, 0)
  const totalImplicitWidth = Math.max(0, rect.width - totalExplicitWidth)
  const numColumnsWithImplicitWidth = _columns.filter(col => col.width == null && col.evenlyFillAvailableWidth).length

  const widthPerColumnWithImplicitWidth = numColumnsWithImplicitWidth === 0
    ? 0
    : totalImplicitWidth / numColumnsWithImplicitWidth

  const calculatedRects: CalculatedRects = {}

  let x = row.columnJustification != null && widthPerColumnWithImplicitWidth === 0
    ? getStartingXOfColumns(totalExplicitWidth, rect.x, rect.width, row.columnJustification)
    : rect.x

  _columns
    .map((col): { column: Column, rect: Rect } => {
      const columnMargin = col.margin

      const width = getColumnWidth(rect, col, columnMargin, widthPerColumnWithImplicitWidth, false)
      const height = getColumnHeight(rect, col, columnMargin)

      const y = rect.y + columnMargin.top
      x += columnMargin.left
      const columnRect: Rect = { x, y, width, height }
      x += width + columnMargin.right

      return { column: col, rect: columnRect }
    })
    .forEach((colAndRect, i) => {
      if (colAndRect.column.id != null)
        calculatedRects[colAndRect.column.id] = colAndRect.rect
      const _childCalculatedRects = renderColumn(colAndRect.rect, colAndRect.column, i)
      Object.entries(_childCalculatedRects).forEach(([id, _rect]) => calculatedRects[id] = _rect)
    })

  return calculatedRects
}

const renderRow = (rect: Rect, row: Row, index: number): CalculatedRects => {
  if (row == null)
    return {}

  if (row.render != null)
    row.render(rect, index)

  const paddedRect = createPaddedRect(rect, row.padding)

  return row.columnTemplate != null && row.numColumns > 0
    ? renderRowColumnTemplate(paddedRect, row.columnTemplate, row.numColumns)
    : (row.columns != null
      ? renderRowColumns(paddedRect, row)
      : {}
    )
}

export const renderColumn = (rect: Rect, column: Column, index: number): CalculatedRects => {
  if (column == null)
    return {}

  if (column.render != null)
    column.render(rect, index)

  const paddedRect = createPaddedRect(rect, column.padding)

  return column.rowTemplate != null && column.numRows > 0
    ? renderColumnRowTemplate(paddedRect, column.rowTemplate, column.numRows)
    : (column.rows != null
      ? renderColumnRows(paddedRect, column)
      : {}
    )
}

/**
 * Renders the given InputColumn. This will place the column at (0, 0) with the
 * bounding width and height of the column. If the column's height and/or width
 * are need to be known before rendering, then sizeInputColumn and then
 * renderColumn should be used separately instead.
 */
export const renderInputColumn = (inputColumn: InputColumn): CalculatedRects => {
  const column = parseInputColumn(inputColumn)
  return renderColumn({ x: 0, y: 0, height: column.boundingHeight, width: column.boundingWidth }, column, 0)
}
