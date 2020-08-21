import DatumSnapMode from './types/DatumSnapMode'
import ProcessedDatum from './types/ProcessedDatum'
import DatumDistanceFunction from './types/DatumDistanceFunction'

export const createDatumDistanceFunction = (datumSnapMode: DatumSnapMode): DatumDistanceFunction => {
  const xDistanceFunction = (datum1: ProcessedDatum, datum2: ProcessedDatum) => Math.abs(datum1.fpX - datum2.fpX)

  switch (datumSnapMode) {
    case DatumSnapMode.SNAP_NEAREST_X:
      return xDistanceFunction
    case DatumSnapMode.SNAP_NEAREST_Y:
      return (datum1: ProcessedDatum, datum2: ProcessedDatum) => Math.abs(datum1.fpY - datum2.fpY)
    case DatumSnapMode.SNAP_NEAREST_X_Y:
      return (datum1: ProcessedDatum, datum2: ProcessedDatum) => Math.sqrt((datum1.fpX - datum2.fpX) ** 2 + (datum1.fpY - datum2.fpY) ** 2)
    default:
      return xDistanceFunction
  }
}

export const createDatumDimensionStringList = (datumSnapMode: DatumSnapMode): string[] => {
  switch (datumSnapMode) {
    case DatumSnapMode.SNAP_NEAREST_X:
      return ['fpX']
    case DatumSnapMode.SNAP_NEAREST_Y:
      return ['fpY']
    case DatumSnapMode.SNAP_NEAREST_X_Y:
      return ['fpX', 'fpY']
    default:
      return ['fpX']
  }
}
