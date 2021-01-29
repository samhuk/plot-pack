export type TextOptions = {
  fontFamily?: string
  fontSize?: number
  color?: string
  bold?: boolean
  italic?: boolean
}

export enum LineCap {
  FLAT = 'flat',
  ROUND = 'round'
}

export type LineOptions = {
  color?: string
  lineWidth?: number
  dashPattern?: number[]
  lineCap?: LineCap
}

export type FillOptions = {
  color?: string
  opacity?: number
}
