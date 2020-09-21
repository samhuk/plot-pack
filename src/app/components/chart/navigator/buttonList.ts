import { CanvasDrawer } from '../../../common/drawer/types'
import { InputColumn, SizeUnit, Column } from '../../../common/rectPositioningEngine/types'
import { sizeInputColumn } from '../../../common/rectPositioningEngine/boundingDimensions'
import { RectDimensions, Rect, Point2D } from '../../../common/types/geometry'
import { renderColumn } from '../../../common/rectPositioningEngine/rendering'
import { createRoundedRectPath } from '../../../common/drawer/path/shapes'
import { isMouseEventInRect } from '../../../common/helpers/geometry'

/* eslint-disable no-param-reassign */

type State = {
  hoveredButtonIndex: number
}

type Button = {
  id: string
  text: string
  onClick: (e: MouseEvent) => void
}

type DrawnButtonList = {
  onMouseMove: (e: MouseEvent) => void
  onMouseDown: (e: MouseEvent) => boolean
}

type Options = {
  drawer: CanvasDrawer,
  buttons: Button[],
  getButtonContainerPosition: (containerDimensions: RectDimensions) => Point2D,
  containerPadding?: number
  buttonBorderRadius?: number
  onMouseEnterButton?: () => void
  onMouseLeaveButton?: () => void
}

const getHoveredButtonIndex = (e: MouseEvent, containerRect: Rect, buttonRects: Rect[]) => {
  if (!isMouseEventInRect(e, containerRect))
    return -1

  return buttonRects.findIndex(rect => isMouseEventInRect(e, rect))
}

const onMouseMove = (
  e: MouseEvent,
  containerRect: Rect,
  buttonRects: Rect[],
  state: State,
  onHoveredButtonIndexChange: (newIndex: number) => void,
) => {
  const currentHoveredButtonIndex = getHoveredButtonIndex(e, containerRect, buttonRects)
  if (currentHoveredButtonIndex !== state.hoveredButtonIndex)
    onHoveredButtonIndexChange(currentHoveredButtonIndex)
}

const onMouseDown = (
  e: MouseEvent,
  containerRect: Rect,
  buttonRects: Rect[],
  onButtonClick: (e: MouseEvent, buttonIndex: number) => void,
) => {
  const buttonIndex = getHoveredButtonIndex(e, containerRect, buttonRects)
  const isOverButton = buttonIndex !== -1
  if (isOverButton)
    onButtonClick(e, buttonIndex)
  return isOverButton
}

const mapButtonToColumn = (
  options: Options,
  button: Button,
  index: number,
  numButtonsMinusOne: number,
  buttonRects: Rect[],
  state: State,
): InputColumn => {
  options.drawer.applyTextOptions({ color: 'black', fontSize: 12, fontFamily: 'Helvetica' })
  const textRectDimensions = options.drawer.measureTextRectDimensions(button.text)
  return {
    margin: { right: index !== numButtonsMinusOne ? 5 : 0 },
    padding: 5,
    render: rect => {
      buttonRects.push(rect)
      // Define button rect shape
      const path = createRoundedRectPath(rect, 5)
      // Hovered button styling
      const fillColor = index !== state.hoveredButtonIndex ? 'white' : '#ddd'
      // Drawn button rect shape
      options.drawer.path(path, { fill: true, fillOptions: { color: fillColor }, stroke: true, lineOptions: { lineWidth: 1, color: 'aaa' } })
    },
    rows: [{
      height: textRectDimensions.height,
      heightUnits: SizeUnit.PX,
      width: textRectDimensions.width,
      widthUnits: SizeUnit.PX,
      render: rect => {
        options.drawer.text(button.text, rect, null, { color: 'black', fontSize: 12, fontFamily: 'Helvetica' })
      },
    }],
  }
}

const render = (drawer: CanvasDrawer, containerRect: Rect, column: Column) => {
  drawer.clearRenderingSpace()
  renderColumn(containerRect, column, 0)
}

export const drawButtonList = (options: Options): DrawnButtonList => {
  const state: State = { hoveredButtonIndex: -1 }

  const buttonRects: Rect[] = []
  const numButtonsMinusOne = options.buttons.length - 1

  // Create the input column
  const inputColumn: InputColumn = {
    padding: options.containerPadding ?? 0,
    rows: [{ columns: options.buttons.map((b, i) => mapButtonToColumn(options, b, i, numButtonsMinusOne, buttonRects, state)) }],
  }

  // Get the bounding dimensions of the column
  const column = sizeInputColumn(inputColumn)

  // Construct the container rect
  const containerDimensions: RectDimensions = {
    height: column.boundingHeight,
    width: column.boundingWidth,
  }
  const containerPosition = options.getButtonContainerPosition(containerDimensions)
  const containerRect: Rect = { ...containerDimensions, ...containerPosition }

  // Render the column. Note: This will end up populating buttonRects array
  render(options.drawer, containerRect, column)

  const onHoveredButtonIndexChange = (newIndex: number) => {
    if (newIndex === -1 && options.onMouseLeaveButton != null)
      options.onMouseLeaveButton()
    else if (options.onMouseEnterButton != null)
      options.onMouseEnterButton()
    state.hoveredButtonIndex = newIndex
    render(options.drawer, containerRect, column)
  }

  const onButtonMouseDown = (e: MouseEvent, buttonIndex: number) => options.buttons[buttonIndex].onClick(e)

  return {
    onMouseMove: e => onMouseMove(e, containerRect, buttonRects, state, onHoveredButtonIndexChange),
    onMouseDown: e => onMouseDown(e, containerRect, buttonRects, onButtonMouseDown),
  }
}
