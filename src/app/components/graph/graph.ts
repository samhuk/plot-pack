import Options from './types/Options'
import { get2DContext } from '../../common/helpers/canvas'
import { draw } from './drawGraph'
import GraphGeometry from './types/GraphGeometry'

export const render = (canvas: HTMLCanvasElement, props: Options, graphGeometry: GraphGeometry) => {
  if (props.series == null || Object.keys(props.series).length === 0)
    return

  const ctx = get2DContext(canvas, props.widthPx, props.heightPx, props.axesMarkerLabelOptions?.fontFamily, props.axesMarkerLabelOptions?.fontSize)
  draw(ctx, graphGeometry, props)
}

export default render
