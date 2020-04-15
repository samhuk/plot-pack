import DatumHighlightAppearanceType from './DatumHighlightAppearanceType'
import PositionedDatum from './PositionedDatum'
import Options from './Options'

export type DatumHighlightOptions = {
  type?: DatumHighlightAppearanceType
  color?: string
  fillColor?: string
  lineWidth?: number
  customHighlightOptions?: {
    customHighlightFunction: (
      ctx: CanvasRenderingContext2D,
      highlightedDatum: PositionedDatum,
      props: Options,
      seriesKey: string
    ) => void
    doesCompliment?: boolean
  }
}

export default DatumHighlightOptions
