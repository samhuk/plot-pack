import ProcessedDatum from './ProcessedDatum'

export type DatumDistanceFunction = (datum1: ProcessedDatum, datum2: ProcessedDatum) => number

export default DatumDistanceFunction
