import Options from '../../types/Options'
import { Axis2D } from '../../../../common/types/geometry'
import AxesGeometry from '../../types/AxesGeometry'
import { determineXAxisMarkerPositioning, determineYAxisMarkerPositioning } from '../geometry/axisMarkerPositioning'
import XAxisMarkerOrientation from '../../types/XAxixMarkerOrientation'
import YAxisMarkerOrientation from '../../types/YAxisMarkerOrientation'
import { LineOptions } from '../../../../common/types/canvas'
import { CanvasDrawer } from '../../../../common/drawer/types'
import { Path, PathComponentType } from '../../../../common/drawer/path/types'

const DEFAULT_MARKER_LINE_LENGTH = 5

const DEFAULT_LINE_OPTIONS: LineOptions = {
  color: 'black',
  lineWidth: 3,
  dashPattern: [],
}

export const getShouldShowAxisMarkerLines = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.visibilityOptions?.showAxisMarkerLines
    ?? props.visibilityOptions?.showAxesMarkerLines
    ?? true
)

export const getMarkerLineLength = (props: Options, axis: Axis2D) => (
  props.axesOptions?.[axis]?.markerLineOptions?.length
    ?? DEFAULT_MARKER_LINE_LENGTH
)

const determineShouldGoIntoNegativeDirection = (props: Options, axesGeometry: AxesGeometry, axis: Axis2D): boolean => {
  if (axis === Axis2D.X) {
    const markerOrientation = props.axesOptions?.[Axis2D.X]?.markerOrientation as XAxisMarkerOrientation
    return determineXAxisMarkerPositioning(axesGeometry, markerOrientation).shouldPlaceBelow
  }

  const markerOrientation = props.axesOptions?.[Axis2D.Y]?.markerOrientation as YAxisMarkerOrientation
  return determineYAxisMarkerPositioning(axesGeometry, markerOrientation).shouldPlaceLeft
}

const determineOrthogonalPositions = (props: Options, axesGeometry: AxesGeometry, axis: Axis2D): { start: number, end: number } => {
  const { orthogonalScreenPosition } = axesGeometry[axis]
  const markerLength = getMarkerLineLength(props, axis)
  const shouldGoIntoNegativeDirection = determineShouldGoIntoNegativeDirection(props, axesGeometry, axis)
  const othogonalVectorCoefficient = axis === Axis2D.X ? (!shouldGoIntoNegativeDirection ? -1 : 1) : (shouldGoIntoNegativeDirection ? -1 : 1)
  const orthogonalScreenPositionEnd = orthogonalScreenPosition + othogonalVectorCoefficient * markerLength
  return { start: orthogonalScreenPosition, end: orthogonalScreenPositionEnd }
}

const createPath = (props: Options, axesGeometry: AxesGeometry, axis: Axis2D): Path => {
  const path: Path = []

  const orthogonalScreenPositions = determineOrthogonalPositions(props, axesGeometry, axis)

  if (axis === Axis2D.X) {
    for (let i = 0; i < axesGeometry[Axis2D.X].numGridLines; i += 1) {
      const x = axesGeometry[Axis2D.X].pl + axesGeometry[Axis2D.X].dpGrid * i
      path.push({ type: PathComponentType.MOVE_TO, x, y: orthogonalScreenPositions.start })
      path.push({ type: PathComponentType.LINE_TO, x, y: orthogonalScreenPositions.end })
    }
  }
  else {
    for (let i = 0; i < axesGeometry[Axis2D.Y].numGridLines; i += 1) {
      const y = axesGeometry[Axis2D.Y].pl + axesGeometry[Axis2D.Y].dpGrid * i
      path.push({ type: PathComponentType.MOVE_TO, x: orthogonalScreenPositions.start, y })
      path.push({ type: PathComponentType.LINE_TO, x: orthogonalScreenPositions.end, y })
    }
  }

  return path
}

export const drawAxisAxisMarkerLines = (
  drawer: CanvasDrawer,
  axesGeometry: AxesGeometry,
  props: Options,
  axis: Axis2D,
) => {
  drawer.applyLineOptions(props?.axesOptions?.[axis]?.markerLineOptions, DEFAULT_LINE_OPTIONS)
  drawer.path(createPath(props, axesGeometry, axis))
}
