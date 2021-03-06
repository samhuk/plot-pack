import { Rect } from '../types/geometry'

export enum RowJustification {
  TOP = 'top',
  BOTTOM = 'bottom',
  CENTER = 'center',
}

export enum ColumnJustification {
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center',
}

export enum SizeUnit {
  PX = 'px',
  PERCENT = '%',
}

export type InputMargin = number | Margin

export type InputPadding = number | Padding

export type Margin = { left?: number, right?: number, top?: number, bottom?: number }

export type Padding = { left?: number, right?: number, top?: number, bottom?: number }

export type ElementOptionsBase = {
  id?: string
  render?: (rect: Rect, index: number) => void
}

export type InputDimensionValue = number | string

export type InputElementOptions = ElementOptionsBase & {
  width?: InputDimensionValue
  height?: InputDimensionValue
  margin?: InputMargin
  padding?: InputPadding
}

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
 * @param render Function to call when the element's rendering rect has been calculated.
 */
export type ElementOptions = ElementOptionsBase & {
  width?: number
  height?: number
  widthUnits?: SizeUnit
  heightUnits?: SizeUnit
  margin?: Margin
  padding?: Padding
}

export type ColumnOptionsBase<BaseElementOptions> = BaseElementOptions & {
  numRows?: number
  evenlyFillAvailableWidth?: boolean
  rowJustification?: RowJustification
}

export type RowOptionsBase<BaseElementOptions> = BaseElementOptions & {
  numColumns?: number
  evenlyFillAvailableHeight?: boolean
  columnJustification?: ColumnJustification
}

/**
 * Options for the a column that hasn't been sized for it's bounding height and width.
 *
 * @param rows The child rows of this column. Cannot be used with rowTemplate and numRows.
 * @param rowTemplate A row template to be used where multiple copies of rows with the same
 * options are desired. To be used in combination with nowRows.
 * @param numRows The number of rowTemplate to render
 *
 * @param evenlyFillAvailableWidth If true, the column will fill any available width left
 * within the parent row. If other sibling columns within the parent row have this property
 * as true also, then the available width is shared amongst these columns.
 *
 * @param rowJustification If the total height of the child rows is less than the height of
 * this column, then the rows will be justified vertically according to the row justification,
 * i.e. top, center, or bottom.
 * @param render Function to call when the column's rendering rect has been calculated.
 */
export type InputColumn = ColumnOptionsBase<InputElementOptions> & {
  rows?: InputRow[]
  rowTemplate?: InputRow
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
 * @param rowJustification If the total width of the child columns is less than the width of
 * this row, then the columns will be justified horizontally according to the column justification,
 * i.e. left, center, or right.
 */
export type InputRow = RowOptionsBase<InputElementOptions> & {
  columns?: InputColumn[]
  columnTemplate?: InputColumn
}

export type Column = ColumnOptionsBase<ElementOptions> & {
  rows: Row[]
  rowTemplate: Row
  boundingHeight: number
  boundingWidth: number
}

export type Row = RowOptionsBase<ElementOptions> & {
  columns: Column[]
  columnTemplate: Column
  boundingHeight: number
  boundingWidth: number
}

export type CalculatedRects = { [id: string]: Rect }
