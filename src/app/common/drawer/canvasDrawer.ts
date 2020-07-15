import { CanvasDrawer, CanvasDrawerState, DrawOptions } from './types'
import { get2DContext } from '../helpers/canvas'
import { LineOptions, FillOptions } from '../types/canvas'
import { Line, CircularSector, Rect, Circle } from '../types/geometry'
import { createPath2DFromPath } from './path/path'
import { Path, PathComponentType } from './path/types'

/* eslint-disable no-param-reassign */

const applyLineOptions = (state: CanvasDrawerState, lineOptions: LineOptions) => {
  state.ctx.lineWidth = lineOptions.lineWidth
  state.ctx.setLineDash(lineOptions.dashPattern ?? [])
  state.ctx.strokeStyle = lineOptions.color
}

const applyFillOptions = (state: CanvasDrawerState, fillOptions: FillOptions) => {
  state.ctx.fillStyle = fillOptions.color
}

const applyLineAndFillOptions = (state: CanvasDrawerState, lineOptions: LineOptions, fillOptions: FillOptions) => {
  if (lineOptions != null)
    applyLineOptions(state, lineOptions)
  if (fillOptions != null)
    applyFillOptions(state, fillOptions)
}

const drawPath2D = (state: CanvasDrawerState, _path: Path2D, stroke: boolean = true, fill: boolean = false) => {
  if (stroke ?? true) // stroke by default
    state.ctx.stroke(_path)
  if (fill ?? false) // don't fill by default
    state.ctx.fill(_path)
}

/* eslint-enable no-param-reassign */

export const createLinePath = (_line: Line): Path2D => {
  const p = new Path2D()
  p.moveTo(_line[0].x, _line[0].y)
  p.lineTo(_line[1].x, _line[1].y)
  return p
}

const line = (state: CanvasDrawerState, _line: Line, lineOptions: LineOptions): Path2D => {
  if (_line.length !== 2)
    return null

  applyLineAndFillOptions(state, lineOptions, null)

  if (state.ctx.lineWidth === 0)
    return null

  const p = createLinePath(_line)
  drawPath2D(state, p)
  return p
}

export const createArcPath = (sector: CircularSector): Path2D => {
  const p = new Path2D()
  p.arc(sector.position.x, sector.position.y, sector.radius, sector.arc.start, sector.arc.end)
  return p
}

const arc = (
  state: CanvasDrawerState,
  sector: CircularSector,
  drawOptions: DrawOptions,
): Path2D => {
  const _drawOptions = drawOptions ?? { }

  applyLineAndFillOptions(state, _drawOptions.lineOptions, _drawOptions.fillOptions)

  if ((_drawOptions.stroke ?? true) && state.ctx.lineWidth === 0)
    return null

  const p = createArcPath(sector)
  drawPath2D(state, p, _drawOptions.stroke, _drawOptions.fill)
  return p
}

export const createCirclePath = (_circle: Circle): Path2D => {
  const p = new Path2D()
  const sector: CircularSector = { position: _circle.position, radius: _circle.radius, arc: { start: 0, end: 2 * Math.PI } }
  p.arc(sector.position.x, sector.position.y, sector.radius, sector.arc.start, sector.arc.end)
  return p
}

const circle = (
  state: CanvasDrawerState,
  _circle: Circle,
  drawOptions: DrawOptions,
): Path2D => {
  const _drawOptions = drawOptions ?? { }

  applyLineAndFillOptions(state, _drawOptions.lineOptions, _drawOptions.fillOptions)

  if ((_drawOptions.stroke ?? true) && state.ctx.lineWidth === 0)
    return null

  const p = createCirclePath(_circle)
  drawPath2D(state, p, _drawOptions.stroke, _drawOptions.fill)
  return p
}

const path = (
  state: CanvasDrawerState,
  _path: Path,
  drawOptions: DrawOptions,
): Path2D => {
  if (_path.length < 1)
    return null

  const _drawOptions = drawOptions ?? { }
  // Exit if the draw options mean that nothing will be visible
  if ((_drawOptions.stroke ?? true) && !(_drawOptions.fill ?? false) && state.ctx.lineWidth === 0)
    return null

  applyLineAndFillOptions(state, _drawOptions.lineOptions, _drawOptions.fillOptions)

  const p = createPath2DFromPath(_path)
  drawPath2D(state, p, _drawOptions.stroke, _drawOptions.fill)
  return p
}

const createRectPath = (_rect: Rect): Path2D => {
  const p = new Path2D()
  p.rect(_rect.x, _rect.y, _rect.width, _rect.height)
  return p
}

const rect = (
  state: CanvasDrawerState,
  _rect: Rect,
  drawOptions: DrawOptions,
): Path2D => {
  const _drawOptions = drawOptions ?? { }
  applyLineAndFillOptions(state, _drawOptions.lineOptions, _drawOptions.fillOptions)

  if ((_drawOptions.stroke ?? true) && state.ctx.lineWidth === 0)
    return null

  const p = createRectPath(_rect)
  drawPath2D(state, p, _drawOptions.stroke, _drawOptions.fill)
  return p
}

export const createIsoscelesTrianglePath = (boundingRect: Rect): Path => ([
  { type: PathComponentType.MOVE_TO, x: boundingRect.x, y: boundingRect.y + boundingRect.height },
  { type: PathComponentType.LINE_TO, x: boundingRect.x + (boundingRect.width / 2), y: boundingRect.y },
  { type: PathComponentType.LINE_TO, x: boundingRect.x + boundingRect.width, y: boundingRect.y + boundingRect.height },
  { type: PathComponentType.LINE_TO, x: boundingRect.x, y: boundingRect.y + boundingRect.height },
])

const isoscelesTriangle = (
  state: CanvasDrawerState,
  boundingRect: Rect,
  drawOptions: DrawOptions,
): Path2D => {
  applyLineAndFillOptions(state, drawOptions.lineOptions, drawOptions.fillOptions)

  if ((drawOptions.stroke ?? true) && state.ctx.lineWidth === 0)
    return null

  const path2D = createPath2DFromPath(createIsoscelesTrianglePath(boundingRect))
  drawPath2D(state, path2D, drawOptions.stroke, drawOptions.fill)
  return path2D
}

const clearRenderingSpace = (state: CanvasDrawerState, rectToClear: Rect) => {
  if (rectToClear != null)
    state.ctx.clearRect(rectToClear.x, rectToClear.y, rectToClear.width, rectToClear.height)
  else
    state.ctx.clearRect(0, 0, state.ctx.canvas.height, state.ctx.canvas.width)
}

export const createCanvasDrawer = (
  canvasElement: HTMLCanvasElement,
  height: number,
  width: number,
): CanvasDrawer => {
  const state: CanvasDrawerState = {
    ctx: get2DContext(canvasElement, width, height),
    drawnObjects: [],
  }

  return {
    applyLineOptions: lineOptions => applyLineOptions(state, lineOptions),
    applyFillOptions: fillOptions => applyFillOptions(state, fillOptions),
    getRenderingContext: () => state.ctx,
    line: (_line, lineOptions) => line(state, _line, lineOptions),
    arc: (sector, drawOptions) => arc(state, sector, drawOptions),
    circle: (_circle, drawOptions) => circle(state, _circle, drawOptions),
    path: (_path, drawOptions) => path(state, _path, drawOptions),
    rect: (_rect, drawOptions) => rect(state, _rect, drawOptions),
    isoscelesTriangle: (boundingRect, drawOptions) => (
      isoscelesTriangle(state, boundingRect, drawOptions)
    ),
    clearRenderingSpace: rectToClear => clearRenderingSpace(state, rectToClear),
  }
}