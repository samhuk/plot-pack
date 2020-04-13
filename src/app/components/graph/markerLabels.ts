import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import { createTextStyle } from '../../common/helpers/canvas'
import AxisGeometry from './types/AxisGeometry'
import XAxisOrientation from './types/xAxisOrientation'
import YAxisOrientation from './types/yAxisOrientation'
import { getXAxisYPosition, getYAxisXPosition } from './drawGraph'
import AxisOptions from './types/AxisOptions'
import Notation from './types/Notation'
import { roundDecimalPlaces } from '../../common/helpers/math'

const DEFAULT_AXIS_MARKER_LABEL_FONT_FAMILY = 'Helvetica'
const DEFAULT_AXIS_MARKER_LABEL_FONT_SIZE = 9

const createAxisGridLabelText = (value: number, axisOptions: AxisOptions) => {
  const defaultValue = value.toString()

  if (axisOptions == null)
    return defaultValue

  if (axisOptions.notation == null || axisOptions.notation === Notation.DECIMAL) {
    if (axisOptions.numFigures != null)
      return roundDecimalPlaces(value, axisOptions.numFigures).toFixed(axisOptions.numFigures)
    return defaultValue
  }
  if (axisOptions.notation === Notation.SCIENTIFIC) {
    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(value)))
    const normalizedValue = value / (10 ** orderOfMagnitude)
    const roundedValue = axisOptions.numFigures != null
      ? roundDecimalPlaces(normalizedValue, axisOptions.numFigures + 1).toFixed(axisOptions.numFigures)
      : normalizedValue
    return `${roundedValue} x10^${orderOfMagnitude}`
  }

  return defaultValue
}

const getFontSize = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLabelFontSize
  ?? props.axesMarkerLabelOptions?.fontSize
  ?? DEFAULT_AXIS_MARKER_LABEL_FONT_SIZE

const getFontFamily = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLabelFontFamily
  ?? props.axesMarkerLabelOptions?.fontFamily
  ?? DEFAULT_AXIS_MARKER_LABEL_FONT_FAMILY

const getLabelColor = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.axisMarkerLabelColor
  ?? props.axesMarkerLabelOptions?.color
  ?? 'black'

const getFont = (props: Options, axis: Axis2D) => createTextStyle(getFontFamily(props, axis), getFontSize(props, axis))

export const drawXAxisAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  xAxis: AxisGeometry,
  yAxis: AxisGeometry,
  props: Options,
) => {
  ctx.lineWidth = 0.7
  ctx.font = getFont(props, Axis2D.X)
  ctx.fillStyle = getLabelColor(props, Axis2D.X)

  const y = getXAxisYPosition(props.axesOptions?.[Axis2D.X]?.orientation as XAxisOrientation, yAxis.pl, yAxis.pu, yAxis.pOrigin)

  for (let i = 0; i < xAxis.numGridLines; i += 1) {
    const value = xAxis.vl + xAxis.dvGrid * i
    const x = xAxis.p(value)
    const _y = y + 15
    ctx.fillText(createAxisGridLabelText(value, props.axesOptions?.[Axis2D.X]), x, _y)
  }
}

export const drawYAxisAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  yAxis: AxisGeometry,
  xAxis: AxisGeometry,
  props: Options,
) => {
  ctx.lineWidth = 0.7
  ctx.font = getFont(props, Axis2D.Y)
  ctx.strokeStyle = getLabelColor(props, Axis2D.Y)

  const x = getYAxisXPosition(props.axesOptions?.[Axis2D.Y]?.orientation as YAxisOrientation, xAxis.pl, xAxis.pu, xAxis.pOrigin)

  for (let i = 0; i < yAxis.numGridLines; i += 1) {
    const value = yAxis.vl + yAxis.dvGrid * i
    const _x = x - 30
    const y = yAxis.p(value) - 5
    ctx.fillText(createAxisGridLabelText(value, props.axesOptions?.[Axis2D.Y]), _x, y)
  }
}
