import MarkerOptions from './MarkerOptions'
import BestFitLineOptions from './BestFitLineOptions'
import SeriesVisibilityOptions from './SeriesVisibilityOptions'
import ErrorBarsOptions from './ErrorBarsOptions'
import { Axis2D } from '../../../common/types/geometry'
import LineOptions from './lineOptions'

export type SeriesOptions = {
  connectingLineOptions?: LineOptions
  markerOptions?: MarkerOptions
  bestFitLineOptions?: BestFitLineOptions
  visibilityOptions?: SeriesVisibilityOptions
  errorBarsOptions?: { [axis in Axis2D]?: ErrorBarsOptions }
}

export default SeriesOptions
