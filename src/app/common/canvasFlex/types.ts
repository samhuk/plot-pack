import { Rect } from '../types/geometry'

export enum ColumnJustification {
  LEFT,
  RIGHT,
  CENTER
}

export enum SizeUnit {
  PX,
  PERCENT
}

export type InputMargin = number | Margin

export type InputPadding = number | Padding

export type Margin = { left?: number, right?: number, top?: number, bottom?: number }

export type Padding = { left?: number, right?: number, top?: number, bottom?: number }

/**
 * Base options for a row or column.
 *
 * @param width The width of the element. If null and evenlyFillAvailableWidth is false,
 * then the bounding width of the element is used.
 * @param height The height of the element. If null and evenlyFillAvailableHeight is false,
 * then the bounding height of the element is used.
 * @param widthUnits The units to be used for the width. Default: SizeUnit.PX
 * @param heightUnits The units to be used for the height. Default: SizeUnit.PX
 * @param margin The margin of this element. This effects the bounding height and/or width
 * of the element.
 * @param padding The padding of this element. This padding will not effect the rect that
 * is supplied to the render method, but rather will pad any child elements of this element.
 */
export type ElementOptions = {
  id?: string
  width?: number
  height?: number
  widthUnits?: SizeUnit
  heightUnits?: SizeUnit
  margin?: InputMargin
  padding?: InputPadding
}

/**
 * Options for the a column that hasn't been sized for it's bounding height and width.
 *
 * @param rows The child rows of this column. Cannot be used with rowTemplate and numRows.
 * @param rowTemplate A row template to be used where multiple copies of rows with the same
 * options are desired. To be used in combination with nowRows.
 * @param numRows The number of rowTemplate to render
 *
 * @param evenlyFillAvailableWidth If true, the column will fill any available width left within
 * the parent row. If other sibling columns within the parent row have this property as true also,
 * then the available width is shared amongst these columns.
 *
 * @param render Function to call when the column's rendering rect has been calculated.
 */
export type InputColumn = ElementOptions & {
  rows?: InputRow[]
  rowTemplate?: InputRow
  numRows?: number

  evenlyFillAvailableWidth?: boolean

  render?: (rect: Rect, index: number) => void
}

/**
 * Options for the a column that hasn't been sized for it's bounding height and width.
 *
 * @param columns The child columns of this row. Cannot be used with columnTemplate and numColumns.
 * @param columnTemplate A column template to be used where multiple copies of columns with the same
 * options are desired. To be used in combination with numColumns.
 * @param numColumns The number of columnTemplate to render
 *
 * @param evenlyFillAvailableHeight If true, the row will fill any available height left within
 * the parent column. If other sibling rows within the parent column have this property as true also,
 * then the available height is shared amongst these rows.
 *
 * @param render Function to call when the row' rendering rect has been calculated.
 */
export type InputRow = ElementOptions & {
  columns?: InputColumn[]
  columnTemplate?: InputColumn
  numColumns?: number

  evenlyFillAvailableHeight?: boolean

  columnJustification?: ColumnJustification
  render?: (rect: Rect, index: number) => void
}

export type Column = ElementOptions & {
  id?: string;
  evenlyFillAvailableWidth?: boolean

  numRows?: number
  render?: (rect: Rect, index: number) => void

  boundingHeight: number
  boundingWidth: number
  rows: Row[]
  rowTemplate: Row
}

export type Row = ElementOptions & {
  id?: string;
  evenlyFillAvailableHeight?: boolean

  numColumns?: number
  columnJustification?: ColumnJustification
  render?: (rect: Rect, index: number) => void

  boundingHeight: number
  boundingWidth: number
  columns: Column[]
  columnTemplate: Column
}

export type CalculatedRects = { [id: string]: Rect }
