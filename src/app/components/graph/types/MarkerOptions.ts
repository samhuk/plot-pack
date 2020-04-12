import MarkerType from './MarkerType'
import PositionedDatum from './PositionedDatum'

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
      datum: PositionedDatum,
      preceedingDatum: PositionedDatum,
      proceedingDatum: PositionedDatum,
    ) => Path2D
    renderPath: (ctx: CanvasRenderingContext2D, createdPath: Path2D) => void
  }
}

export default MarkerOptions
