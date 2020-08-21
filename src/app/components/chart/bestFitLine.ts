import Options from './types/Options'
import BestFitLineType from './types/BestFitLineType'

export const getBestFitLineType = (props: Options, seriesKey: string) => props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.type
  ?? props.bestFitLineOptions?.type
  ?? BestFitLineType.STRAIGHT
