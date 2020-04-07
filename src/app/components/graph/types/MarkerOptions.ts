import MarkerType from './MarkerType'
import Datum from './Datum'

export type MarkerOptions = {
  type?: MarkerType
  size?: number
  color?: string
  lineWidth?: number
  customOptions?: {
    complimentStandardOptions?: boolean
    createPath: (
      x: number,
      y: number,
      datum: Datum,
      preceedingDatum: Datum,
      proceedingDatum: Datum,
    ) => Path2D
    renderPath: (ctx: CanvasRenderingContext2D, createdPath: Path2D) => void
  }
}

export default MarkerOptions
