import { RoundedRectOptions } from '../../drawer/types'
import { InputPadding } from '../../rectPositioningEngine/types'
import { LineOptions, TextOptions } from '../../types/canvas'
import { CartesianOrInputPolarVector } from '../../types/geometry'

export enum OffsetLineLengthUnits {
  ABSOLUTE = 'absolute',
  RELATIVE = 'relative',
}

export type OffsetLineOptions = LineOptions & {
  draw?: boolean
}

export type BackgroundRectOptions = RoundedRectOptions & {
  draw?: boolean
  padding?: InputPadding
}

export type TextLabelOptions = TextOptions & {
  text?: string
  backgroundRectOptions?: BackgroundRectOptions
  offsetVector?: CartesianOrInputPolarVector
  offsetLineOptions?: OffsetLineOptions
}
