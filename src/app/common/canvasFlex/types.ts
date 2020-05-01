import { Rect } from '../types/geometry'

export enum ColumnJustification {
  LEFT,
  RIGHT,
  CENTER
}

export type Margin = number | { left: number, right: number, top: number, bottom: number }

export type Padding = number | { left: number, right: number, top: number, bottom: number }

export type Column = {
  rows?: Row[]
  rowTemplate?: Row
  numRows?: number
  width?: number
  height?: number
  margin?: Margin
  padding?: Padding
  render?: (rect: Rect, index: number) => void
}

export type Row = {
  columns?: Column[]
  columnTemplate?: Column
  numColumns?: number
  width?: number
  height?: number
  columnJustification?: ColumnJustification
  margin?: Margin
  padding?: Padding
  render?: (rect: Rect, index: number) => void
}

export type SizedColumn = Column & {
  boundingHeight: number
  boundingWidth: number
  rows: SizedRow[]
}

export type SizedRow = Row & {
  boundingHeight: number
  boundingWidth: number
  columns: SizedColumn[]
}
