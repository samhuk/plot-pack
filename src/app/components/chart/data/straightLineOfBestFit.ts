import Options from '../types/Options'
import { StraightLineEquation } from '../../../common/types/geometry'
import { isInRange } from '../../../common/helpers/math'
import AxesGeometry from '../types/AxesGeometry'
import { CanvasDrawer } from '../../../common/drawer/types'

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
  const vlXIntersectionCoordY = bestFitStraightLineEquation.y(axesGeometry.x.vl)
  const lowerValueIntersectionPoint = isInRange(axesGeometry.y.vl, axesGeometry.y.vu, vlXIntersectionCoordY)
    ? { x: axesGeometry.x.vl, y: vlXIntersectionCoordY }
    : { x: bestFitStraightLineEquation.x(axesGeometry.y.vl), y: axesGeometry.y.vl }

  const vuXIntersectionCoordY = bestFitStraightLineEquation.y(axesGeometry.x.vu)
  const upperValueIntersectionPoint = isInRange(axesGeometry.y.vl, axesGeometry.y.vu, vuXIntersectionCoordY)
    ? { x: axesGeometry.x.vu, y: vuXIntersectionCoordY }
    : { x: bestFitStraightLineEquation.x(axesGeometry.y.vu), y: axesGeometry.y.vu }

  const lowerScreenIntersectionPoint = {
    x: axesGeometry.x.p(lowerValueIntersectionPoint.x),
    y: axesGeometry.y.p(lowerValueIntersectionPoint.y),
  }

  const upperScreenIntersectionPoint = {
    x: axesGeometry.x.p(upperValueIntersectionPoint.x),
    y: axesGeometry.y.p(upperValueIntersectionPoint.y),
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
