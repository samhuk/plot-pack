import GraphGeometry from './types/GraphGeometry'
import { get2DContext } from '../../common/helpers/canvas'
import { Options } from './types/Options'

export const init = (canvas: HTMLCanvasElement, props: Options, graphGeometry: GraphGeometry) => {
  const ctx = get2DContext(canvas, props.widthPx, props.heightPx)

  return {
    onMouseMove: (pX: number, pY: number) => {
      // ADD IN CUSTOMIZABLE INTERACTIVITY LAYER
    }
  }
}
