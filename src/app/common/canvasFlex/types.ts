import { Rect } from '../types/geometry'

export enum ColumnJustification {
  LEFT,
  RIGHT,
  CENTER
}

export type Margin = number | { left?: number, right?: number, top?: number, bottom?: number }

export type Padding = number | { left?: number, right?: number, top?: number, bottom?: number }

export type InputColumn = {
  rows?: InputRow[]
  rowTemplate?: InputRow
  numRows?: number
  width?: number
  height?: number
  margin?: Margin
  padding?: Padding
  render?: (rect: Rect, index: number) => void
}

export type InputRow = {
  columns?: InputColumn[]
  columnTemplate?: InputColumn
  numColumns?: number
  width?: number
  height?: number
  columnJustification?: ColumnJustification
  margin?: Margin
  padding?: Padding
  render?: (rect: Rect, index: number) => void
}

export type Column = {
  numRows?: number
  width?: number
  height?: number
  margin?: Margin
  padding?: Padding
  render?: (rect: Rect, index: number) => void

  boundingHeight: number
  boundingWidth: number
  rows: Row[]
  rowTemplate: Row
}

export type Row = {
  numColumns?: number
  width?: number
  height?: number
  columnJustification?: ColumnJustification
  margin?: Margin
  padding?: Padding
  render?: (rect: Rect, index: number) => void

  boundingHeight: number
  boundingWidth: number
  columns: Column[]
  columnTemplate: Column
}
