import Options from '../../types/Options'
import { Axis2D, Rect } from '../../../../common/types/geometry'
import { CanvasDrawer } from '../../../../common/drawer/types'
import { TextOptions } from '../../../../common/types/canvas'
import { InputMargin } from '../../../../common/canvasFlex/types'

const DEFAULT_LABEL_TEXT_OPTIONS: TextOptions = {
  color: 'black',
  fontFamily: 'Helvetica',
  fontSize: 14,
}

const DEFAULT_MARGIN: InputMargin = 15

export const getAxisLabelText = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.labelText

export const getAxisLabelMargin = (props: Options, axis: Axis2D) => props.axesOptions?.[axis]?.labelOptions?.margin ?? DEFAULT_MARGIN

export const applyAxisLabelTextOptionsToDrawer = (drawer: CanvasDrawer, axis: Axis2D, props: Options) => drawer.applyTextOptions(
  props.axesOptions?.[axis]?.labelOptions,
  DEFAULT_LABEL_TEXT_OPTIONS,
)

const drawAxisLabel = (drawer: CanvasDrawer, textRect: Rect, axis: Axis2D, props: Options) => {
  const text = getAxisLabelText(props, axis)

  if (text == null || text.length === 0)
    return

  applyAxisLabelTextOptionsToDrawer(drawer, axis, props)

  if (axis === Axis2D.X)
    drawer.text(text, textRect)
  else
    drawer.text(text, { x: textRect.x, y: textRect.y + textRect.height }, { angle: -Math.PI / 2 })
}

export const drawAxesLabels = (drawer: CanvasDrawer, xAxisLabelTextRect: Rect, yAxisLabelTextRect: Rect, props: Options) => {
  drawAxisLabel(drawer, xAxisLabelTextRect, Axis2D.X, props)
  drawAxisLabel(drawer, yAxisLabelTextRect, Axis2D.Y, props)
}

export default drawAxesLabels
