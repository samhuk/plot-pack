import MarkerOptions from './MarkerOptions'
import BestFitLineOptions from './BestFitLineOptions'
import SeriesVisibilityOptions from './SeriesVisibilityOptions'

export type SeriesOptions = {
  lineOptions?: {
    width?: number
    color?: string
  }
  markerOptions?: MarkerOptions
  bestFitLineOptions?: BestFitLineOptions
  visibilityOptions?: SeriesVisibilityOptions
}

export default SeriesOptions
