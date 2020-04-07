import GraphGeometry from './types/GraphGeometry'
import { get2DContext } from '../../common/helpers/canvas'
import { Options } from './types/Options'
import { isInRange } from '../../common/helpers/math'

export const render = (canvas: HTMLCanvasElement, props: Options, graphGeometry: GraphGeometry) => {
  const ctx = get2DContext(canvas, props.widthPx, props.heightPx)

  ctx.lineWidth = 2
  ctx.strokeStyle = 'blue'

  // eslint-disable-next-line no-param-reassign
  canvas.onmousemove = e => {
    ctx.clearRect(0, 0, props.widthPx, props.heightPx)
    const x = e.offsetX
    const y = e.offsetY
    if (isInRange(graphGeometry.xAxis.pl, graphGeometry.xAxis.pu, x) && isInRange(graphGeometry.yAxis.pl, graphGeometry.yAxis.pu, y)) {
      // TODO: When props.data is refined and it's proper "Datum" structure completed, this will be edited.
      const path = new Path2D()
      path.moveTo(x, y)
      path.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.stroke(path)
    }
  }
}

export default render
