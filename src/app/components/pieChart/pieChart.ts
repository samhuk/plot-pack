/* eslint-disable no-param-reassign */
import Options from './types/Options'
import { lighten, colorHexMap } from '../../common/helpers/color'
import { Color } from '../../common/types/color'
import DataList from './types/DataList'
import OnClickHandler from './types/OnClickHandler'
import { Point2D } from '../../common/types/geometry'
import { WedgeGeometry } from './types/WedgeGeometry'
import { isMouseInPath, measureTextLineHeight, get2DContext } from '../../common/helpers/canvas'
import { drawWedgeShape, createWedgeGeometries, drawWedgeText } from './wedge'
import DrawnWedge from './types/DrawnWedge'
import WedgeDrawOptions from './types/WedgeDrawOptions'

const CANVAS_PADDING_PX = 5 // Such that the circle does not clip the edges of the canvas element
const DEFAULT_WEDGE_COLORS = [Color.BLUE, Color.GREEN, Color.ORANGE, Color.RED, Color.YELLOW]
const defaultWedgeColorHexes = DEFAULT_WEDGE_COLORS
  .map(c => colorHexMap[c])
  .concat(DEFAULT_WEDGE_COLORS.map(c => lighten(colorHexMap[c], -25)))

const createDefaultWedgeDrawOptions = (props: Options, wedgeIndex: number) => ({
  text: props.data[wedgeIndex].name,
  fillColorHex: (props.wedgeFillColorHexes ?? defaultWedgeColorHexes)[wedgeIndex],
  textColor: Color.BLACK,
})

const createHoveredWedgeDrawOptions = (props: Options, wedgeIndex: number) => ({
  text: props.data[wedgeIndex].name,
  fillColorHex: lighten((props.wedgeFillColorHexes ?? defaultWedgeColorHexes)[wedgeIndex], -10),
  textColor: Color.BLACK,
  lineWidth: 3,
})

const onClick = (
  e: MouseEvent,
  ctx: CanvasRenderingContext2D,
  drawnWedges: DrawnWedge[],
  dataList: DataList,
  onClickExternal: OnClickHandler,
) => {
  const clickedOnWedgeIndex = drawnWedges.findIndex(dw => isMouseInPath(e, ctx, dw.wedgePath))
  if (clickedOnWedgeIndex >= 0)
    onClickExternal(dataList[clickedOnWedgeIndex])
}

const drawWedges = (
  ctx: CanvasRenderingContext2D,
  props: Options,
  wedgeGeometries: WedgeGeometry[],
  hoveredWedgeIndex: number,
): DrawnWedge[] => {
  const drawnWedgePaths: DrawnWedge[] = []
  // Create draw options for each wedge
  const wedgeDrawOptionsList: WedgeDrawOptions[] = []
  for (let i = 0; i < wedgeGeometries.length; i += 1)
    wedgeDrawOptionsList.push(i !== hoveredWedgeIndex ? createDefaultWedgeDrawOptions(props, i) : createHoveredWedgeDrawOptions(props, i))
  // Draw non-hovered wedge shapes first
  wedgeGeometries.forEach((wedgeGeometry, i) => {
    if (i !== hoveredWedgeIndex) {
      drawnWedgePaths.push({
        wedgeGeometry,
        wedgePath: drawWedgeShape(ctx, wedgeGeometry, wedgeDrawOptionsList[i]),
      })
    }
  })
  // Draw hovered wedge shape last
  if (hoveredWedgeIndex != null && wedgeGeometries[hoveredWedgeIndex] != null) {
    drawnWedgePaths.push({
      wedgeGeometry: wedgeGeometries[hoveredWedgeIndex],
      wedgePath: drawWedgeShape(ctx, wedgeGeometries[hoveredWedgeIndex], wedgeDrawOptionsList[hoveredWedgeIndex]),
    })
  }
  // Draw text into each wedge's text boxs
  wedgeGeometries.forEach((wedgeGeometry, i) => drawWedgeText(ctx, wedgeGeometry, wedgeDrawOptionsList[i]))

  return drawnWedgePaths
}

const redrawWedges = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  props: Options,
  wedgeGeometries: WedgeGeometry[],
  hoveredIndex: number,
) => {
  // Clear out the drawing space
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
  // Redraw wedges
  drawWedges(ctx, props, wedgeGeometries, hoveredIndex)
}

const onMouseMove = (
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  props: Options,
  drawnWedges: DrawnWedge[],
) => {
  const hoveredIndex = drawnWedges.findIndex(dw => isMouseInPath(e, ctx, dw.wedgePath))
  // If cursor is in any wedge, set cursor to pointer
  canvas.style.cursor = hoveredIndex > -1 ? 'pointer' : 'initial'
  // Redraw wedges
  redrawWedges(canvas, ctx, props, drawnWedges.map(dw => dw.wedgeGeometry), hoveredIndex)
}

const _createWedgeGeometries = (ctx: CanvasRenderingContext2D, props: Options): WedgeGeometry[] => {
  const centerPoint: Point2D = { x: props.radiusPx, y: props.radiusPx } // Center point of the pie chart circle
  const radius = props.radiusPx - CANVAS_PADDING_PX // Radius of the pie chart circle
  const values = props.data.map(dataPoint => dataPoint.value)
  const textBoxHeight = measureTextLineHeight(ctx) * 2 + 4 // two lines plus a bit of line spacing
  return createWedgeGeometries(
    centerPoint, radius, values, props.dataMode, props.textBoxDistanceFromCenter, textBoxHeight,
  )
}

const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, props: Options): DrawnWedge[] => {
  // Clear the drawing space
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
  // Create wedge geometries
  const wedgeGeometries = _createWedgeGeometries(ctx, props)
  // Draw wedges
  return drawWedges(ctx, props, wedgeGeometries, null)
}

export const renderPieChart = (canvas: HTMLCanvasElement, props: Options): void => {
  const ctx = get2DContext(canvas, props.radiusPx * 2, props.radiusPx * 2, props.labelFontFamily, props.labelFontSize)
  // Apply base styling for for labels
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // Draw initial wedges (before any event listeners trigger redrawing)
  const drawnWedges = draw(canvas, ctx, props)
  // Optionally add click and mousemove listener
  if (props.onClick != null) {
    // Add mousemove listener
    canvas.onmousemove = e => {
      onMouseMove(e, canvas, ctx, props, drawnWedges)
    }
    canvas.onclick = e => {
      onClick(e, ctx, drawnWedges, props.data, props.onClick)
    }
  }
  else {
    canvas.onclick = undefined
    canvas.onmousemove = undefined
  }
}
