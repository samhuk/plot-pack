import Options from './types/Options'
import { StraightLineEquation } from '../../common/types/geometry'
import GraphGeometry from './types/GraphGeometry'
import { boundToRange } from '../../common/helpers/math'

const DEFAULT_BEST_FIT_LINE_WIDTH = 2

const getStraightLineOfBestFitColor = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.lineColor
    ?? props.bestFitLineOptions?.lineColor
    ?? 'black'
)

const getStraightLineOfBestFitLineWidth = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.lineWidth
    ?? props.bestFitLineOptions?.lineWidth
    ?? DEFAULT_BEST_FIT_LINE_WIDTH
)

const getStraightLineOfBestFitLineDashPattern = (props: Options, seriesKey: string) => (
  props.seriesOptions?.[seriesKey]?.bestFitLineOptions?.lineDashPattern
    ?? props.bestFitLineOptions?.lineDashPattern
    ?? [5, 5]
)

export const drawStraightLineOfBestFit = (
  ctx: CanvasRenderingContext2D,
  bestFitStraightLineEquation: StraightLineEquation,
  g: GraphGeometry,
  props: Options,
  seriesKey: string,
) => {
  // Calculate the bounded lower Y value (bounded to the available pixel space)
  const vlY = boundToRange(bestFitStraightLineEquation.y(g.xAxis.vl), g.yAxis.vl, g.yAxis.vu)
  // Then the corresponding lower X value
  const vlX = bestFitStraightLineEquation.x(vlY)
  // Calculate the bounded upper Y value (bounded to the available pixel space)
  const vuY = boundToRange(bestFitStraightLineEquation.y(g.xAxis.vu), g.yAxis.vu, g.yAxis.vl)
  // Then the corresponding upper X value
  const vuX = bestFitStraightLineEquation.x(vuY)

  const path = new Path2D()

  ctx.save()

  const lineWidth = getStraightLineOfBestFitLineWidth(props, seriesKey)
  if (lineWidth <= 0)
    return

  const lineDashPattern = getStraightLineOfBestFitLineDashPattern(props, seriesKey)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = getStraightLineOfBestFitColor(props, seriesKey)
  ctx.setLineDash(lineDashPattern)

  path.moveTo(g.xAxis.p(vlX), g.yAxis.p(vlY))
  path.lineTo(g.xAxis.p(vuX), g.yAxis.p(vuY))
  ctx.stroke(path)

  ctx.restore()
}
