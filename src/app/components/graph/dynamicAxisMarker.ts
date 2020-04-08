import GraphGeometry from './types/GraphGeometry'
import { get2DContext } from '../../common/helpers/canvas'
import { Options } from './types/Options'
import { isInRange } from '../../common/helpers/math'
import PositionedDatum from './types/PositionedDatum'

const KdTree = require('kd-tree-javascript')

export const render = (canvas: HTMLCanvasElement, props: Options, graphGeometry: GraphGeometry) => {
  const ctx = get2DContext(canvas, props.widthPx, props.heightPx)

  ctx.strokeStyle = '#333'

  // Create the K-D tree for quicker nearest neighboor searching
  // eslint-disable-next-line new-cap
  const tree = new KdTree.kdTree(
    graphGeometry.positionedDatums,
    (datum1: PositionedDatum, datum2: PositionedDatum) => (datum1.pX - datum2.pX) ** 2 + (datum1.pY - datum2.pY) ** 2,
    ['pX', 'pY'],
  )

  // eslint-disable-next-line no-param-reassign
  canvas.onmousemove = e => {
    ctx.clearRect(0, 0, props.widthPx, props.heightPx)
    const x = e.offsetX
    const y = e.offsetY
    if (isInRange(graphGeometry.xAxis.pl, graphGeometry.xAxis.pu, x) && isInRange(graphGeometry.yAxis.pl, graphGeometry.yAxis.pu, y)) {
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

      // Highlight the nearest point to the cursor
      // TODO: MAKE THIS CUSTOMIZABLE AND MORE POWERFUL!
      // TODO: ADD THIS KDTREE OBJECT TO THE GRAPH GEOMETRY!
      const nearestDatum = tree.nearest({ pX: x, pY: y }, 1)
      const nearestDatumPath = new Path2D()
      nearestDatumPath.arc(nearestDatum[0][0].pX, nearestDatum[0][0].pY, 5, 0, 2 * Math.PI)
      ctx.stroke(nearestDatumPath)
    }
  }

  // eslint-disable-next-line no-param-reassign
  canvas.onmouseleave = () => ctx.clearRect(0, 0, props.widthPx, props.heightPx)
}

export default render
