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
    for (let i = 0; i < axesGeometry[Axis2D.X].numGridLines; i += 1) {
      const x = axesGeometry[Axis2D.X].plGrid + axesGeometry[Axis2D.X].dpGrid * i
      path.push(
        { type: PathComponentType.MOVE_TO, x, y: axesGeometry[Axis2D.Y].pl },
        { type: PathComponentType.LINE_TO, x, y: axesGeometry[Axis2D.Y].pu },
      )
    }
  }
  else {
    for (let i = 0; i < axesGeometry[Axis2D.Y].numGridLines; i += 1) {
      const y = axesGeometry[Axis2D.Y].plGrid + axesGeometry[Axis2D.Y].dpGrid * i
      path.push(
        { type: PathComponentType.MOVE_TO, x: axesGeometry[Axis2D.X].pl, y },
        { type: PathComponentType.LINE_TO, x: axesGeometry[Axis2D.X].pu, y },
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
  drawer.applyLineOptions(props.axesOptions?.[axis]?.gridLineOptions, DEFAULT_LINE_OPTIONS)
  drawer.path(createPath(axesGeometry, axis))
}
