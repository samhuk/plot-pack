import Options from '../../types/Options'
import AxesGeometry from '../../types/AxesGeometry'
import { Axis2D, Line } from '../../../../common/types/geometry'
import { CanvasDrawer } from '../../../../common/drawer/types'
import { LineOptions } from '../../../../common/types/canvas'

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
    ? [{ x: axesGeometry.x.pl, y: orthogonalScreenPosition }, { x: axesGeometry.x.pu, y: orthogonalScreenPosition }]
    : [{ x: orthogonalScreenPosition, y: axesGeometry.y.pl }, { x: orthogonalScreenPosition, y: axesGeometry.y.pu }]
}

export const drawAxisLine = (drawer: CanvasDrawer, axesGeometry: AxesGeometry, props: Options, axis: Axis2D) => {
  drawer.line(createLine(axesGeometry, axis), props.axesOptions?.x?.lineOptions, DEFAULT_LINE_OPTIONS)
}
