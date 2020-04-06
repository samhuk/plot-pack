import MarkerType from './MarkerType'
import DataPoint from './DataPoint'

export type MarkerOptions = {
  type?: MarkerType
  size?: number
  color?: string
  customOptions?: {
    complimentStandardOptions?: boolean
    createPath: (
      x: number,
      y: number,
      dataPoint: DataPoint,
      preceedingDataPoint: DataPoint,
      proceedingDataPoint: DataPoint,
    ) => Path2D
    renderPath: (ctx: CanvasRenderingContext2D, createdPath: Path2D) => void
  }
}

export default MarkerOptions
