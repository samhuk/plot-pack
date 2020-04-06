import Options from './types/Options'
import { get2DContext } from '../../common/helpers/canvas'
import { createGraphGeometry, draw } from './geometry'
import GraphGeometry from './types/GraphGeometry'

export const renderGraph = (canvas: HTMLCanvasElement, props: Options, onRenderComplete?: (g: GraphGeometry) => void) => {
  if (props.data?.length < 1)
    return

  const ctx = get2DContext(canvas, props.widthPx, props.heightPx, props.axesMarkerLabelOptions?.fontFamily, props.axesMarkerLabelOptions?.fontSize)

  const graphGeometry = createGraphGeometry(props)

  draw(ctx, graphGeometry, props)

  if (onRenderComplete != null)
    onRenderComplete(graphGeometry)
}
