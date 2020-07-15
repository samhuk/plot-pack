import Options from './types/Options'
import { draw } from './drawGraph'
import GraphGeometry from './types/GraphGeometry'
import { createCanvasDrawer } from '../../common/drawer/canvasDrawer'

export const render = (canvas: HTMLCanvasElement, props: Options, graphGeometry: GraphGeometry) => {
  if (props.series == null || Object.keys(props.series).length === 0)
    return

  const drawer = createCanvasDrawer(canvas, props.heightPx, props.widthPx)
  draw(drawer, graphGeometry, props)
}

export default render
