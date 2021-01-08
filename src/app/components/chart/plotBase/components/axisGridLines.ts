import Options from '../../types/Options'
import { Axis2D } from '../../../../common/types/geometry'
import AxesGeometry from '../../types/AxesGeometry'
import { CanvasDrawer } from '../../../../common/drawer/types'
import { LineOptions } from '../../../../common/types/canvas'
import { Path, PathComponentType } from '../../../../common/drawer/path/types'

const DEFAULT_LINE_OPTIONS: LineOptions = {
  color: 'black',
  lineWidth: 0.5,
  dashPattern: [],
}

export const getShouldShowAxisGridLines = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showGridLines
    ?? props.visibilityOptions?.showGridLines
    ?? true
)

const createPath = (axesGeometry: AxesGeometry, axis: Axis2D): Path => {
  const path: Path = []

  if (axis === Axis2D.X) {
    for (let i = 0; i < axesGeometry.x.numGridLines; i += 1) {
      const x = axesGeometry.x.plGrid + axesGeometry.x.dpGrid * i
      path.push(
        { type: PathComponentType.MOVE_TO, x, y: axesGeometry.y.pl },
        { type: PathComponentType.LINE_TO, x, y: axesGeometry.y.pu },
      )
    }
  }
  else {
    for (let i = 0; i < axesGeometry.y.numGridLines; i += 1) {
      const y = axesGeometry.y.plGrid + axesGeometry.y.dpGrid * i
      path.push(
        { type: PathComponentType.MOVE_TO, x: axesGeometry.x.pl, y },
        { type: PathComponentType.LINE_TO, x: axesGeometry.x.pu, y },
      )
    }
  }

  return path
}

export const drawAxisGridLines = (
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  props: Options,
  axis: Axis2D,
) => {
  drawer.path(
    createPath(axesGeometry, axis),
    { lineOptions: props.axesOptions?.[axis]?.gridLineOptions },
    { lineOptions: DEFAULT_LINE_OPTIONS },
  )
}
