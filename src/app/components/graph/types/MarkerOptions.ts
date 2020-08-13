import MarkerType from './MarkerType'
import ProcessedDatum from './ProcessedDatum'

export type MarkerOptions = {
  type?: MarkerType
  size?: number
  color?: string
  lineWidth?: number
  customOptions?: {
    doesCompliment?: boolean
    customRenderFunction: (
      ctx: CanvasRenderingContext2D,
      datum: ProcessedDatum,
      preceedingDatum: ProcessedDatum,
      proceedingDatum: ProcessedDatum,
    ) => void
  }
}

export default MarkerOptions
