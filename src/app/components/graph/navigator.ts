import Options from './types/Options'
import { CanvasDrawer } from '../../common/drawer/types'
import { Rect, Axis2D } from '../../common/types/geometry'
import { createAxesGeometry } from './axesGeometry'
import { AxesValueRangeForceOptions, calculateValueRangesOfSeries } from './geometry'
import AxesBound from './types/AxesBound'
import { mapDict } from '../../common/helpers/dict'
import { normalizeDatumsErrorBarsValues } from './errorBars'
import { drawAxisLine } from './axisLines'
import { drawAxisMarkerLabels } from './axisMarkerLabels'
import { drawAxisAxisMarkerLines } from './axisMarkerLines'
import DatumValueFocusPoint from './types/DatumValueFocusPoint'
import DatumScreenFocusPoint from './types/DatumScreenFocusPoint'
import { Path, PathComponentType } from '../../common/drawer/path/types'

export const DEFAULT_NAVIGATOR_HEIGHT_PX = 100

type PositionedDatumValuePoint = DatumValueFocusPoint & DatumScreenFocusPoint

const positionDatumValueFocusPoints = (
  datumValueFocusPoints: DatumValueFocusPoint[],
  xAxisPFn: (v: number) => number,
  yAxisPFn: (v: number) => number,
): PositionedDatumValuePoint[] => datumValueFocusPoints.map(valueFocusPoint => ({
  fvX: valueFocusPoint.fvX,
  fvY: valueFocusPoint.fvY,
  fpX: xAxisPFn(valueFocusPoint.fvX),
  fpY: yAxisPFn(valueFocusPoint.fvY),
}))

export const drawNavigator = (
  drawer: CanvasDrawer,
  datumValueFocusPoints: { [seriesKey: string]: DatumValueFocusPoint[] },
  rect: Rect,
  props: Options,
) => {
  const normalizedSeries = mapDict(props.series, (seriesKey, datums) => normalizeDatumsErrorBarsValues(datums, props, seriesKey))

  const datumValueRange = calculateValueRangesOfSeries(normalizedSeries)

  const forcedVlX = props.axesOptions?.[Axis2D.X]?.valueBound?.lower
  const forcedVlY = props.axesOptions?.[Axis2D.Y]?.valueBound?.lower
  const forcedVuX = props.axesOptions?.[Axis2D.X]?.valueBound?.upper
  const forcedVuY = props.axesOptions?.[Axis2D.Y]?.valueBound?.upper

  const axesValueRangeForceOptions: AxesValueRangeForceOptions = {
    [Axis2D.X]: {
      forceLower: forcedVlX != null,
      forceUpper: forcedVuX != null,
    },
    [Axis2D.Y]: {
      forceLower: forcedVlY != null,
      forceUpper: forcedVuY != null,
    },
  }

  // Determine value bounds
  const axesValueBound: AxesBound = {
    [Axis2D.X]: {
      lower: forcedVlX ?? datumValueRange[Axis2D.X].lower,
      upper: forcedVuX ?? datumValueRange[Axis2D.X].upper,
    },
    [Axis2D.Y]: {
      lower: forcedVlY ?? datumValueRange[Axis2D.Y].lower,
      upper: forcedVuY ?? datumValueRange[Axis2D.Y].upper,
    },
  }

  // Calculate axes geometry
  const navigatorAxesGeometry = createAxesGeometry(drawer, props, axesValueBound, axesValueRangeForceOptions, rect)

  // Position the datum value focus points using axes geometry
  const positionedDatumValueFocusPoints = mapDict(datumValueFocusPoints, (seriesKey, datumValueFocusPoint) => (
    positionDatumValueFocusPoints(datumValueFocusPoint, navigatorAxesGeometry[Axis2D.X].p, navigatorAxesGeometry[Axis2D.Y].p)
  ))

  // Draw connecting line for each series
  Object.entries(positionedDatumValueFocusPoints)
    .forEach(([, _positionedDatumValueFocusPoints]) => {
      const path: Path = []

      for (let i = 1; i < _positionedDatumValueFocusPoints.length; i += 1) {
        const prevDatum = _positionedDatumValueFocusPoints[i - 1]
        const { fpX, fpY } = _positionedDatumValueFocusPoints[i]
        path.push({ type: PathComponentType.MOVE_TO, x: prevDatum.fpX, y: prevDatum.fpY })
        path.push({ type: PathComponentType.LINE_TO, x: fpX, y: fpY })
      }
      drawer.path(path, { lineOptions: { color: 'blue', lineWidth: 1 } })
    })

  // Draw top border
  drawer.line([rect, { x: rect.x + rect.width, y: rect.y }], { color: 'black', lineWidth: 1 })

  // Draw graph components
  drawAxisLine(drawer, navigatorAxesGeometry, props, Axis2D.X)
  drawAxisLine(drawer, navigatorAxesGeometry, props, Axis2D.Y)
  drawAxisMarkerLabels(drawer, navigatorAxesGeometry, Axis2D.X, props)
  drawAxisMarkerLabels(drawer, navigatorAxesGeometry, Axis2D.Y, props)
  drawAxisAxisMarkerLines(drawer, navigatorAxesGeometry, props, Axis2D.X)
  drawAxisAxisMarkerLines(drawer, navigatorAxesGeometry, props, Axis2D.Y)
}
