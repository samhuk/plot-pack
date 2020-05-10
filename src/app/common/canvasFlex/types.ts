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

export type ElementOptions = {
  width?: number
  height?: number
  widthUnits?: SizeUnit
  heightUnits?: SizeUnit
  margin?: InputMargin
  padding?: InputPadding
}

export type InputColumn = ElementOptions & {
  rows?: InputRow[]
  rowTemplate?: InputRow
  numRows?: number

  evenlyFillAvailableWidth?: boolean

  render?: (rect: Rect, index: number) => void
}

export type InputRow = ElementOptions & {
  columns?: InputColumn[]
  columnTemplate?: InputColumn
  numColumns?: number

  evenlyFillAvailableHeight?: boolean

  columnJustification?: ColumnJustification
  render?: (rect: Rect, index: number) => void
}

export type Column = ElementOptions & {
  evenlyFillAvailableWidth?: boolean

  numRows?: number
  render?: (rect: Rect, index: number) => void

  boundingHeight: number
  boundingWidth: number
  rows: Row[]
  rowTemplate: Row
}

export type Row = ElementOptions & {
  evenlyFillAvailableHeight?: boolean

  numColumns?: number
  columnJustification?: ColumnJustification
  render?: (rect: Rect, index: number) => void

  boundingHeight: number
  boundingWidth: number
  columns: Column[]
  columnTemplate: Column
}
