import GraphGeometry from './types/GraphGeometry'
import { get2DContext } from '../../common/helpers/canvas'
import { Options } from './types/Options'
import { isInRange } from '../../common/helpers/math'

export const render = (canvas: HTMLCanvasElement, props: Options, graphGeometry: GraphGeometry) => {
  const ctx = get2DContext(canvas, props.widthPx, props.heightPx)

  ctx.strokeStyle = '#333'

  // eslint-disable-next-line no-param-reassign
  canvas.onmousemove = e => {
    ctx.clearRect(0, 0, props.widthPx, props.heightPx)
    const x = e.offsetX
    const y = e.offsetY
    if (isInRange(graphGeometry.xAxis.pl, graphGeometry.xAxis.pu, x) && isInRange(graphGeometry.yAxis.pl, graphGeometry.yAxis.pu, y)) {
      // TODO: When props.data is refined and it's proper "Datum" structure completed, this will be edited.
      const toAxisLines = new Path2D()
      toAxisLines.moveTo(graphGeometry.xAxis.pu, y)
      toAxisLines.lineTo(graphGeometry.xAxis.pl, y) // The vertical line
      toAxisLines.moveTo(x, graphGeometry.yAxis.pu)
      toAxisLines.lineTo(x, graphGeometry.yAxis.pl) // The horizontal line

      const atCursorPoint = new Path2D()
      atCursorPoint.arc(x, y, 4, 0, 2 * Math.PI)

      const xAxisText = graphGeometry.xAxis.v(x).toFixed(2)
      const yAxisText = graphGeometry.yAxis.v(y).toFixed(2)

      ctx.lineWidth = 1
      ctx.fillText(xAxisText, x + 5, graphGeometry.yAxis.pl - 5)
      ctx.fillText(yAxisText, graphGeometry.xAxis.pl + 5, y - 5)

      ctx.lineWidth = 1
      ctx.stroke(toAxisLines)
      ctx.lineWidth = 1
      ctx.stroke(atCursorPoint)
    }
  }

  // eslint-disable-next-line no-param-reassign
  canvas.onmouseleave = () => ctx.clearRect(0, 0, props.widthPx, props.heightPx)
}

export default render
