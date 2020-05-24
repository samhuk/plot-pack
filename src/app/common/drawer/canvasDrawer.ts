import { CanvasDrawer, CanvasDrawerState } from './types'
import { get2DContext } from '../helpers/canvas'
import { LineOptions, FillOptions } from '../types/canvas'
import { Line, CircularSector, Point2D, Rect } from '../types/geometry'

/* eslint-disable no-param-reassign */

const applyLineOptions = (state: CanvasDrawerState, lineOptions: LineOptions) => {
  state.ctx.lineWidth = lineOptions.lineWidth
  state.ctx.setLineDash(lineOptions.dashPattern ?? [])
  state.ctx.strokeStyle = lineOptions.color
}

const applyFillOptions = (state: CanvasDrawerState, fillOptions: FillOptions) => {
  state.ctx.fillStyle = fillOptions.color
}

const drawClosedPath = (state: CanvasDrawerState, _path: Path2D, stroke: boolean, fill: boolean) => {
  if (stroke ?? true) // stroke by default
    state.ctx.stroke(_path)
  if (fill ?? false) // don't fill by default
    state.ctx.fill(_path)
}

/* eslint-enable no-param-reassign */

const line = (state: CanvasDrawerState, _line: Line, lineOptions: LineOptions): Path2D => {
  if (_line.length !== 2)
    return null

  if (lineOptions != null)
    applyLineOptions(state, lineOptions)

  const p = new Path2D()
  p.moveTo(_line[0].x, _line[0].y)
  p.lineTo(_line[1].x, _line[1].y)

  state.ctx.stroke(p)

  return p
}

const arc = (state: CanvasDrawerState, sector: CircularSector, lineOptions: LineOptions): Path2D => {
  if (lineOptions != null)
    applyLineOptions(state, lineOptions)

  const p = new Path2D()
  p.arc(sector.position.x, sector.position.y, sector.radius, sector.arc.start, sector.arc.end)

  state.ctx.stroke(p)

  return p
}

const circle = (
  state: CanvasDrawerState,
  centerPosition: Point2D,
  radius: number,
  lineOptions: LineOptions,
  fillOptions: any,
  stroke: boolean,
  fill: boolean,
): Path2D => {
  if (lineOptions != null)
    applyLineOptions(state, lineOptions)
  if (fillOptions != null)
    applyFillOptions(state, fillOptions)

  const p = new Path2D()
  const sector: CircularSector = { position: centerPosition, radius, arc: { start: 0, end: 2 * Math.PI } }
  p.arc(sector.position.x, sector.position.y, sector.radius, sector.arc.start, sector.arc.end)

  drawClosedPath(state, p, stroke, fill)

  return p
}

const path = (
  state: CanvasDrawerState,
  vertices: Point2D[],
  lineOptions: LineOptions,
  fillOptions: any,
  stroke: boolean,
  fill: boolean,
): Path2D => {
  if (vertices.length < 2)
    return null

  if (lineOptions != null)
    applyLineOptions(state, lineOptions)
  if (fillOptions != null)
    applyFillOptions(state, fillOptions)

  const p = new Path2D()
  p.moveTo(vertices[0].x, vertices[0].y)
  for (let i = 1; i < vertices.length; i += 1)
    p.lineTo(vertices[i].x, vertices[i].y)

  drawClosedPath(state, p, stroke, fill)

  return p
}

const rect = (state: CanvasDrawerState, _rect: Rect, lineOptions: LineOptions, fillOptions: any, stroke: boolean, fill: boolean): Path2D => {
  if (lineOptions != null)
    applyLineOptions(state, lineOptions)
  if (fillOptions != null)
    applyFillOptions(state, fillOptions)

  const p = new Path2D()
  p.rect(_rect.x, _rect.y, _rect.width, _rect.height)

  drawClosedPath(state, p, stroke, fill)

  return p
}

const isoscelesTriangle = (
  state: CanvasDrawerState,
  boundingRect: Rect,
  lineOptions: LineOptions,
  fillOptions: any,
  stroke: boolean,
  fill: boolean,
): Path2D => {
  if (lineOptions != null)
    applyLineOptions(state, lineOptions)
  if (fillOptions != null)
    applyFillOptions(state, fillOptions)

  const p = new Path2D()
  p.moveTo(boundingRect.x, boundingRect.y + boundingRect.height)
  p.lineTo(boundingRect.x + (boundingRect.width / 2), boundingRect.y)
  p.lineTo(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height)

  drawClosedPath(state, p, stroke, fill)

  return p
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
    arc: (sector, lineOptions) => arc(state, sector, lineOptions),
    circle: (centerPosition, radius, lineOptions, fillOptions, stroke, fill) => circle(state, centerPosition, radius, lineOptions, fillOptions, stroke, fill),
    path: (vertices, lineOptions, fillOptions) => path(state, vertices, lineOptions, fillOptions, true, false),
    rect: (_rect, lineOptions, fillOptions, stroke, fill) => rect(state, _rect, lineOptions, fillOptions, stroke, fill),
    isoscelesTriangle: (boundingRect, lineOptions, fillOptions, stroke, fill) => isoscelesTriangle(state, boundingRect, lineOptions, fillOptions, stroke, fill),
    clearRenderingSpace: rectToClear => clearRenderingSpace(state, rectToClear),
  }
}
