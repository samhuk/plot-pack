import Options from './types/Options'
import { CanvasDrawer } from '../../common/drawer/types'
import { Rect, Axis2D } from '../../common/types/geometry'
import { createAxesGeometry } from './axesGeometry'
import { getAxesValueRangeOptions } from './geometry'
import { mapDict } from '../../common/helpers/dict'
import { normalizeDatumsErrorBarsValues } from './errorBars'
import { drawAxisLine } from './axisLines'
import { drawAxisMarkerLabels } from './axisMarkerLabels'
import { drawAxisAxisMarkerLines } from './axisMarkerLines'
import DatumValueFocusPoint from './types/DatumValueFocusPoint'
import DatumScreenFocusPoint from './types/DatumScreenFocusPoint'
import { Path, PathComponentType } from '../../common/drawer/path/types'
import { LineOptions } from '../../common/types/canvas'

export const DEFAULT_NAVIGATOR_HEIGHT_PX = 100

const DEFAULT_CONNECTING_LINE_LINE_OPTIONS: LineOptions = {
  lineWidth: 1,
  color: 'black',
  dashPattern: [],
}

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

const getConnectingLineDashPattern = (props: Options, seriesKey: string) => (
  props.navigatorOptions?.seriesOptions?.[seriesKey]?.connectingLineOptions?.dashPattern
    ?? props.navigatorOptions?.connectingLineOptions?.dashPattern
)

const getConnectingLineLineWidth = (props: Options, seriesKey: string) => (
  props.navigatorOptions?.seriesOptions?.[seriesKey]?.connectingLineOptions?.lineWidth
    ?? props.navigatorOptions?.connectingLineOptions?.lineWidth
)

const getConnectingLineColor = (props: Options, seriesKey: string) => (
  props.navigatorOptions?.seriesOptions?.[seriesKey]?.connectingLineOptions?.color
    ?? props.navigatorOptions?.connectingLineOptions?.color
)

export const drawNavigator = (
  drawer: CanvasDrawer,
  datumValueFocusPoints: { [seriesKey: string]: DatumValueFocusPoint[] },
  rect: Rect,
  props: Options,
) => {
  const normalizedSeries = mapDict(props.series, (seriesKey, datums) => normalizeDatumsErrorBarsValues(datums, props, seriesKey))

  const axesValueRangeOptions = getAxesValueRangeOptions(props, normalizedSeries)

  // Calculate axes geometry
  const navigatorAxesGeometry = createAxesGeometry(drawer, props, axesValueRangeOptions, rect)

  // Position the datum value focus points using axes geometry
  const positionedDatumValueFocusPoints = mapDict(datumValueFocusPoints, (seriesKey, datumValueFocusPoint) => (
    positionDatumValueFocusPoints(datumValueFocusPoint, navigatorAxesGeometry[Axis2D.X].p, navigatorAxesGeometry[Axis2D.Y].p)
  ))

  // Draw connecting line for each series
  Object.entries(positionedDatumValueFocusPoints)
    .forEach(([seriesKey, _positionedDatumValueFocusPoints]) => {
      const path: Path = []

      for (let i = 1; i < _positionedDatumValueFocusPoints.length; i += 1) {
        const prevDatum = _positionedDatumValueFocusPoints[i - 1]
        const { fpX, fpY } = _positionedDatumValueFocusPoints[i]
        path.push({ type: PathComponentType.MOVE_TO, x: prevDatum.fpX, y: prevDatum.fpY })
        path.push({ type: PathComponentType.LINE_TO, x: fpX, y: fpY })
      }

      const color = getConnectingLineColor(props, seriesKey)
      const lineWidth = getConnectingLineLineWidth(props, seriesKey)
      const dashPattern = getConnectingLineDashPattern(props, seriesKey)
      drawer.applyLineOptions({ color, lineWidth, dashPattern }, DEFAULT_CONNECTING_LINE_LINE_OPTIONS)
      drawer.path(path)
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
