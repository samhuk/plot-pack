export type TextSizeMeasurement = {
  width: number
  height: number
}

export type TextSizeMeasurer = (text: string) => TextSizeMeasurement

export type FitTextLineResult = {
  text: string
  width: number
  numCharsOverflowed: number
}

export type FitTextResult = {
  textLines: FitTextLineResult[]
  width: number
  numCharsOverflowed: number
}
