import DatumHighlightType from './DatumHighlightType'
import ProcessedDatum from './ProcessedDatum'
import Options from './Options'
import { LineOptions } from '../../../common/types/canvas'
import { DrawOptions } from '../../../common/drawer/path/types'

export type DatumHighlightOptionsBase = {
  customHighlightOptions?: {
    customHighlightFunction: (
      ctx: CanvasRenderingContext2D,
      highlightedDatum: ProcessedDatum,
      props: Options,
      seriesKey: string
    ) => void
    doesCompliment?: boolean
  }
}

export type HairDatumHighlightOptionsBase = { hairStartRadius?: number, hairLength?: number, lineOptions?: LineOptions }

export type CircleDatumHighlightOptions = { radius?: number, drawOptions?: DrawOptions }
export type CrossHairDatumHighlightOptions = HairDatumHighlightOptionsBase
export type PlusHairDatumHighlightOptions = HairDatumHighlightOptionsBase

type DatumHighlightTypeToOptionsMap = {
  [DatumHighlightType.CIRCLE]: CircleDatumHighlightOptions
  [DatumHighlightType.CROSSHAIR]: CrossHairDatumHighlightOptions
  [DatumHighlightType.PLUSHAIR]: PlusHairDatumHighlightOptions
}

type AnnotationTypeUnion = {
  [K in DatumHighlightType]: { type: K } & DatumHighlightTypeToOptionsMap[K]
}[DatumHighlightType]

export type DatumHighlightOptions<T extends DatumHighlightType> = DatumHighlightOptionsBase & AnnotationTypeUnion & { type: T }

export default DatumHighlightOptions
