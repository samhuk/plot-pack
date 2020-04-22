import Options from './types/Options'
import { Axis2D } from '../../common/types/geometry'
import { createTextStyle } from '../../common/helpers/canvas'
import AxisOptions from './types/AxisOptions'
import Notation from './types/Notation'
import { roundDecimalPlaces } from '../../common/helpers/math'
import AxesGeometry from './types/AxesGeometry'

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
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  ctx.lineWidth = 0.7
  ctx.font = getFont(props, Axis2D.X)
  ctx.fillStyle = getLabelColor(props, Axis2D.X)

  const y = axesGeometry[Axis2D.X].orthogonalScreenPosition

  for (let i = 0; i < axesGeometry[Axis2D.X].numGridLines; i += 1) {
    const value = axesGeometry[Axis2D.X].vl + axesGeometry[Axis2D.X].dvGrid * i
    const x = axesGeometry[Axis2D.X].p(value)
    const _y = y + 15
    ctx.fillText(createAxisGridLabelText(value, props.axesOptions?.[Axis2D.X]), x, _y)
  }
}

export const drawYAxisAxisMarkerLabels = (
  ctx: CanvasRenderingContext2D,
  axesGeometry: AxesGeometry,
  props: Options,
) => {
  ctx.lineWidth = 0.7
  ctx.font = getFont(props, Axis2D.Y)
  ctx.strokeStyle = getLabelColor(props, Axis2D.Y)

  const x = axesGeometry[Axis2D.Y].orthogonalScreenPosition

  for (let i = 0; i < axesGeometry[Axis2D.Y].numGridLines; i += 1) {
    const value = axesGeometry[Axis2D.Y].vl + axesGeometry[Axis2D.Y].dvGrid * i
    const _x = x - 30
    const y = axesGeometry[Axis2D.Y].p(value) - 5
    ctx.fillText(createAxisGridLabelText(value, props.axesOptions?.[Axis2D.Y]), _x, y)
  }
}
