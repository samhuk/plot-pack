import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import { getXAxisYPosition, getYAxisXPosition } from './drawGraph'
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'
import AxesGeometry from './types/AxesGeometry'

const DEFAULT_MARKER_LINE_WIDTH = 3

const getMarkerLineWidth = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLineWidth
  ?? props.axesMarkerLineOptions?.lineWidth
  ?? DEFAULT_MARKER_LINE_WIDTH

const getMarkerLineColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLineColor
  ?? props.axesMarkerLineOptions?.color
  ?? 'black'

export const drawXAxisAxisMarkerLines = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  ctx.strokeStyle = getMarkerLineColor(props, Axis2D.X)
  ctx.lineWidth = getMarkerLineWidth(props, Axis2D.X)

  const y = getXAxisYPosition(
    props.axesOptions?.[Axis2D.X]?.orientation as XAxisOrientation,
    axesGeometry[Axis2D.Y].pl,
    axesGeometry[Axis2D.Y].pu,
    axesGeometry[Axis2D.Y].pOrigin,
  )

  const path = new Path2D()
  for (let i = 0; i < axesGeometry[Axis2D.X].numGridLines; i += 1) {
    const x = axesGeometry[Axis2D.X].pl + axesGeometry[Axis2D.X].dpGrid * i
    path.moveTo(x, y)
    path.lineTo(x, y + 5)
  }
  ctx.stroke(path)
}

export const drawYAxisAxisMarkerLines = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  ctx.strokeStyle = getMarkerLineColor(props, Axis2D.Y)
  ctx.lineWidth = getMarkerLineWidth(props, Axis2D.Y)

  const x = getYAxisXPosition(
    props.axesOptions?.[Axis2D.Y]?.orientation as YAxisOrientation,
    axesGeometry[Axis2D.X].pl,
    axesGeometry[Axis2D.X].pu,
    axesGeometry[Axis2D.X].pOrigin,
  )

  const path = new Path2D()
  for (let i = 0; i < axesGeometry[Axis2D.Y].numGridLines; i += 1) {
    const y = axesGeometry[Axis2D.Y].pl + axesGeometry[Axis2D.Y].dpGrid * i
    path.moveTo(x, y)
    path.lineTo(x - 5, y)
  }
  ctx.stroke(path)
}
