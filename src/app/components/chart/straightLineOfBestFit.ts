import Options from './types/Options'
import { StraightLineEquation, Axis2D } from '../../common/types/geometry'
import { isInRange } from '../../common/helpers/math'
import AxesGeometry from './types/AxesGeometry'
import { CanvasDrawer } from '../../common/drawer/types'

const DEFAULT_BEST_FIT_LINE_WIDTH = 2
const DEFAULT_LINE_DASH_PATTERN = [5, 5]
const DEFAULT_COLOR = 'black'

const getStraightLineOfBestFitColor = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.lineColor
    ?? props.bestFitLineOptions?.lineColor
    ?? DEFAULT_COLOR
)

const getStraightLineOfBestFitLineWidth = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.lineWidth
    ?? props.bestFitLineOptions?.lineWidth
    ?? DEFAULT_BEST_FIT_LINE_WIDTH
)

const getStraightLineOfBestFitLineDashPattern = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.lineDashPattern
    ?? props.bestFitLineOptions?.lineDashPattern
    ?? DEFAULT_LINE_DASH_PATTERN
)

export const drawStraightLineOfBestFit = (
  drawer: CanvasDrawer,
  bestFitStraightLineEquation: StraightLineEquation,
  axesGeometry: AxesGeometry,
  props: Options,
  seriesKey: string,
) => {
  const vlXIntersectionCoordY = bestFitStraightLineEquation.y(axesGeometry[Axis2D.X].vl)
  const lowerValueIntersectionPoint = isInRange(axesGeometry[Axis2D.Y].vl, axesGeometry[Axis2D.Y].vu, vlXIntersectionCoordY)
    ? { x: axesGeometry[Axis2D.X].vl, y: vlXIntersectionCoordY }
    : { x: bestFitStraightLineEquation.x(axesGeometry[Axis2D.Y].vl), y: axesGeometry[Axis2D.Y].vl }

  const vuXIntersectionCoordY = bestFitStraightLineEquation.y(axesGeometry[Axis2D.X].vu)
  const upperValueIntersectionPoint = isInRange(axesGeometry[Axis2D.Y].vl, axesGeometry[Axis2D.Y].vu, vuXIntersectionCoordY)
    ? { x: axesGeometry[Axis2D.X].vu, y: vuXIntersectionCoordY }
    : { x: bestFitStraightLineEquation.x(axesGeometry[Axis2D.Y].vu), y: axesGeometry[Axis2D.Y].vu }

  const lowerScreenIntersectionPoint = {
    x: axesGeometry[Axis2D.X].p(lowerValueIntersectionPoint.x),
    y: axesGeometry[Axis2D.Y].p(lowerValueIntersectionPoint.y),
  }

  const upperScreenIntersectionPoint = {
    x: axesGeometry[Axis2D.X].p(upperValueIntersectionPoint.x),
    y: axesGeometry[Axis2D.Y].p(upperValueIntersectionPoint.y),
  }

  const ctx = drawer.getRenderingContext()

  ctx.save()

  drawer.line(
    [lowerScreenIntersectionPoint, upperScreenIntersectionPoint],
    {
      lineWidth: getStraightLineOfBestFitLineWidth(props, seriesKey),
      color: getStraightLineOfBestFitColor(props, seriesKey),
      dashPattern: getStraightLineOfBestFitLineDashPattern(props, seriesKey),
    },
  )

  ctx.restore()
}
