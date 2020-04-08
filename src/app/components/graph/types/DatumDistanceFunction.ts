import PositionedDatum from './PositionedDatum'

export type DatumDistanceFunction = (datum1: PositionedDatum, datum2: PositionedDatum) => number

export default DatumDistanceFunction
