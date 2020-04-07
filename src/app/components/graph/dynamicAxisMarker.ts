import GraphGeometry from './types/GraphGeometry'
import { get2DContext } from '../../common/helpers/canvas'
import { Options } from './types/Options'
import { isInRange } from '../../common/helpers/math'

export const render = (canvas: HTMLCanvasElement, props: Options, graphGeometry: GraphGeometry) => {
  const ctx = get2DContext(canvas, props.widthPx, props.heightPx)

  ctx.lineWidth = 2
  ctx.strokeStyle = '#333'

  // eslint-disable-next-line no-param-reassign
  canvas.onmousemove = e => {
    ctx.clearRect(0, 0, props.widthPx, props.heightPx)
    const x = e.offsetX
    const y = e.offsetY
    if (isInRange(graphGeometry.xAxis.pl, graphGeometry.xAxis.pu, x) && isInRange(graphGeometry.yAxis.pl, graphGeometry.yAxis.pu, y)) {
      // TODO: When props.data is refined and it's proper "Datum" structure completed, this will be edited.
      const lineAndCircle = new Path2D()
      lineAndCircle.moveTo(x, y)
      lineAndCircle.arc(x, y, 5, 0, 2 * Math.PI)
      lineAndCircle.lineTo(graphGeometry.xAxis.pl, y) // The vertical line
      lineAndCircle.moveTo(x, y)
      lineAndCircle.lineTo(x, graphGeometry.yAxis.pl) // The horizontal line

      const xAxisText = graphGeometry.xAxis.v(x).toFixed(2)
      const yAxisText = graphGeometry.yAxis.v(y).toFixed(2)
      ctx.strokeText(xAxisText, x + 5, graphGeometry.yAxis.pl - 5)
      ctx.strokeText(yAxisText, graphGeometry.xAxis.pl + 5, y - 5)

      ctx.stroke(lineAndCircle)
    }
  }

  // eslint-disable-next-line no-param-reassign
  canvas.onmouseleave = () => ctx.clearRect(0, 0, props.widthPx, props.heightPx)
}

export default render
