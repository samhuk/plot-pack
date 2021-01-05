import Options from '../../types/Options'
import { Axis2D, Rect } from '../../../../common/types/geometry'
import { CanvasDrawer } from '../../../../common/drawer/types'
import { TextOptions } from '../../../../common/types/canvas'
import { InputMargin } from '../../../../common/rectPositioningEngine/types'

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

  const _textRect = axis === Axis2D.X ? textRect : { x: textRect.x, y: textRect.y + textRect.height }
  const textAngle = axis === Axis2D.X ? 0 : -Math.PI / 2
  drawer.text(text, _textRect, textAngle, props.axesOptions?.[axis]?.labelOptions, DEFAULT_LABEL_TEXT_OPTIONS)
}

export const drawAxesLabels = (drawer: CanvasDrawer, xAxisLabelTextRect: Rect, yAxisLabelTextRect: Rect, props: Options) => {
  drawAxisLabel(drawer, xAxisLabelTextRect, Axis2D.X, props)
  drawAxisLabel(drawer, yAxisLabelTextRect, Axis2D.Y, props)
}

export default drawAxesLabels
