import DatumSnapMode from './DatumSnapMode'

export type DatumSnapOptions = {
  mode?: DatumSnapMode
  distanceThresholdPx?: number
  seriesGroupingDistanceThresholdPx?: number
  excludedSeriesKeys?: string[]
}

export default DatumSnapOptions
