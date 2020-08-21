import Options from './types/Options'
import { Axis2D, Line } from '../../common/types/geometry'
import AxesGeometry from './types/AxesGeometry'
import { CanvasDrawer } from '../../common/drawer/types'
import { LineOptions } from '../../common/types/canvas'

const DEFAULT_LINE_OPTIONS: LineOptions = {
  color: 'black',
  lineWidth: 2,
  dashPattern: [],
}

export const getShouldShowAxisLine = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showAxisLine
    ?? props.visibilityOptions?.showAxesLines
    ?? true
)

const createLine = (axesGeometry: AxesGeometry, axis: Axis2D): Line => {
  const { orthogonalScreenPosition } = axesGeometry[axis]

  return axis === Axis2D.X
    ? [{ x: axesGeometry[Axis2D.X].pl, y: orthogonalScreenPosition }, { x: axesGeometry[Axis2D.X].pu, y: orthogonalScreenPosition }]
    : [{ x: orthogonalScreenPosition, y: axesGeometry[Axis2D.Y].pl }, { x: orthogonalScreenPosition, y: axesGeometry[Axis2D.Y].pu }]
}

export const drawAxisLine = (drawer: CanvasDrawer, axesGeometry: AxesGeometry, props: Options, axis: Axis2D) => {
  drawer.applyLineOptions(props.axesOptions?.[Axis2D.X]?.lineOptions, DEFAULT_LINE_OPTIONS)
  drawer.line(createLine(axesGeometry, axis))
}
