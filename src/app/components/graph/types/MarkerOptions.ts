import MarkerType from './MarkerType'
import PositionedDatum from './PositionedDatum'

export type MarkerOptions = {
  type?: MarkerType
  size?: number
  color?: string
  lineWidth?: number
  customOptions?: {
    doesCompliment?: boolean
    customRenderFunction: (
      ctx: CanvasRenderingContext2D,
      datum: PositionedDatum,
      preceedingDatum: PositionedDatum,
      proceedingDatum: PositionedDatum,
    ) => void
  }
}

export default MarkerOptions
