import { CanvasDrawer, CanvasDrawerState, DrawOptions, RoundedRectOptions, RoundedRectSimpleOptions, TextOptions } from './types'
import { get2DContext, applyTextOptionsToContext, getTextLineHeightMetrics, measureTextWidth, measureTextLineHeight } from '../helpers/canvas'
import { LineOptions, FillOptions, TextOptions as TextOptionsBase } from '../types/canvas'
import { Line, CircularSector, Rect, Circle, Point2D, RectDimensions, QuadraticCurve, Corners2DOptional } from '../types/geometry'
import { createPath2DFromPath } from './path/path'
import { Path, PathComponentType } from './path/types'
import { normalizeCornersObject, normalizeDirectionsObject } from '../helpers/geometry'
import { convertHexAndOpacityToRgba } from '../helpers/color'

/* eslint-disable no-param-reassign */

const applyLineOptions = (state: CanvasDrawerState, lineOptions: LineOptions, fallbackOptions: LineOptions) => {
  state.ctx.lineWidth = lineOptions?.lineWidth ?? fallbackOptions?.lineWidth ?? 1
  state.ctx.setLineDash(lineOptions?.dashPattern ?? fallbackOptions?.dashPattern ?? [])
  state.ctx.strokeStyle = lineOptions?.color ?? fallbackOptions?.color ?? 'black'
}

const applyFillOptions = (state: CanvasDrawerState, fillOptions: FillOptions, fallbackOptions: FillOptions) => {
  state.ctx.fillStyle = fillOptions?.color ?? fallbackOptions?.color ?? 'black'
}

/* eslint-enable no-param-reassign */

const applyLineAndFillOptions = (state: CanvasDrawerState, lineOptions: LineOptions, fillOptions: FillOptions) => {
  if (lineOptions != null)
    applyLineOptions(state, lineOptions, null)
  if (fillOptions != null)
    applyFillOptions(state, fillOptions, null)
}

const applyTextOptions = (state: CanvasDrawerState, textOptions: TextOptionsBase, fallbackOptions: TextOptionsBase) => {
  applyTextOptionsToContext(state.ctx, textOptions, fallbackOptions?.fontFamily, fallbackOptions?.fontSize, fallbackOptions?.color)
}

const drawPath2D = (state: CanvasDrawerState, _path: Path2D, stroke: boolean = true, fill: boolean = false) => {
  if (stroke ?? true) // stroke by default
    state.ctx.stroke(_path)
  if (fill ?? false) // don't fill by default
    state.ctx.fill(_path)
}

export const createLinePath = (_line: Line, precreatedPath?: Path2D): Path2D => {
  const p = precreatedPath ?? new Path2D()
  if (_line[0] != null)
    p.moveTo(_line[0].x, _line[0].y)
  p.lineTo(_line[1].x, _line[1].y)
  return p
}

const line = (state: CanvasDrawerState, _line: Line, lineOptions: LineOptions): Path2D => {
  if (_line == null || _line.length !== 2)
    return null

  applyLineAndFillOptions(state, lineOptions, null)

  if (state.ctx.lineWidth === 0)
    return null

  const p = createLinePath(_line)
  drawPath2D(state, p)
  return p
}

const createQuadraticCurvePath = (curve: QuadraticCurve): Path2D => {
  const p = new Path2D()
  if (curve.fromPos != null)
    p.moveTo(curve.fromPos.x, curve.fromPos.y)
  p.quadraticCurveTo(curve.cPos.x, curve.cPos.y, curve.toPos.x, curve.toPos.y)
  return p
}

const quadraticCurve = (state: CanvasDrawerState, curve: QuadraticCurve, lineOptions: LineOptions): Path2D => {
  if (curve == null)
    return null

  applyLineAndFillOptions(state, lineOptions, null)

  if (state.ctx.lineWidth === 0)
    return null

  const p = createQuadraticCurvePath(curve)
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
  if (sector == null)
    return null

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
  if (_circle == null)
    return null

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
  if (_path == null || _path.length < 1)
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
  if (_rect == null)
    return null

  const _drawOptions = drawOptions ?? { }
  applyLineAndFillOptions(state, _drawOptions.lineOptions, _drawOptions.fillOptions)

  if ((_drawOptions.stroke ?? true) && state.ctx.lineWidth === 0)
    return null

  const p = createRectPath(_rect)
  drawPath2D(state, p, _drawOptions.stroke, _drawOptions.fill)
  return p
}

const createSingleRoundedRectPath = (_rect: Rect, borderRadii: Corners2DOptional<number>): Path2D => {
  const { x, y, height, width } = _rect
  const radii = normalizeCornersObject(borderRadii, 0)

  const rightX = x + width
  const bottomY = y + height

  const _path: Path = [
    { type: PathComponentType.MOVE_TO, x: x + radii.topLeft, y },
    { type: PathComponentType.LINE_TO, x: rightX - radii.topRight, y },
    { type: PathComponentType.QUADRATIC_CURVE_TO, cPos: { x: rightX, y }, pos: { x: rightX, y: y + radii.topRight } },
    { type: PathComponentType.LINE_TO, x: rightX, y: bottomY - radii.bottomRight },
    { type: PathComponentType.QUADRATIC_CURVE_TO, cPos: { x: rightX, y: bottomY }, pos: { x: rightX - radii.bottomRight, y: bottomY } },
    { type: PathComponentType.LINE_TO, x: x + radii.bottomLeft, y: bottomY },
    { type: PathComponentType.QUADRATIC_CURVE_TO, cPos: { x, y: bottomY }, pos: { x, y: bottomY - radii.bottomLeft } },
    { type: PathComponentType.LINE_TO, x, y: y + radii.topLeft },
    { type: PathComponentType.QUADRATIC_CURVE_TO, cPos: { x, y }, pos: { x: x + radii.topLeft, y } },
  ]

  return createPath2DFromPath(_path)
}

const roundedRectSimple = (
  state: CanvasDrawerState,
  _rect: Rect,
  options: RoundedRectSimpleOptions,
): Path2D => {
  if (_rect == null)
    return null

  applyLineAndFillOptions(state, options.borderLineOptions, { color: options.backgroundColor })

  // If border radius is not defined or zero, then can just create a simple rect path, else create rounded rect path
  const p = options.borderLineOptions?.radii == null || options.borderLineOptions.radii === 0
    ? createRectPath(_rect)
    : createSingleRoundedRectPath(_rect, normalizeCornersObject(options.borderLineOptions.radii, 0))
  drawPath2D(state, p, options.stroke, options.fill)
  return p
}

const roundedRect = (
  state: CanvasDrawerState,
  _rect: Rect,
  options: RoundedRectOptions,
) => {
  const borderColor = normalizeDirectionsObject(options.borderColor)
  const normalizedBorderDashPattern = normalizeDirectionsObject(options.borderDashPattern)
  const borderLineWidth = options.borderLineWidth ?? 1
  const radii = normalizeCornersObject(options.borderRadii)
  const { x, y, height, width } = _rect
  const rightX = x + width
  const bottomY = y + height

  line(
    state,
    [{ x: x + radii.topLeft, y }, { x: rightX - radii.topRight, y }],
    { color: borderColor.top, dashPattern: normalizedBorderDashPattern.top, lineWidth: borderLineWidth },
  )
  quadraticCurve(
    state,
    { fromPos: { x: rightX - radii.topRight, y }, cPos: { x: rightX, y }, toPos: { x: rightX, y: y + radii.topRight } },
    { color: borderColor.top, dashPattern: normalizedBorderDashPattern.top, lineWidth: borderLineWidth },
  )
  line(
    state,
    [{ x: rightX, y: y + radii.topRight }, { x: rightX, y: bottomY - radii.bottomRight }],
    { color: borderColor.right, dashPattern: normalizedBorderDashPattern.right, lineWidth: borderLineWidth },
  )
  quadraticCurve(
    state,
    { fromPos: { x: rightX, y: bottomY - radii.bottomRight }, cPos: { x: rightX, y: bottomY }, toPos: { x: rightX - radii.bottomRight, y: bottomY } },
    { color: borderColor.right, dashPattern: normalizedBorderDashPattern.right, lineWidth: borderLineWidth },
  )
  line(
    state,
    [{ x: rightX - radii.bottomRight, y: bottomY }, { x: x + radii.bottomLeft, y: bottomY }],
    { color: borderColor.bottom, dashPattern: normalizedBorderDashPattern.bottom, lineWidth: borderLineWidth },
  )
  quadraticCurve(
    state,
    { fromPos: { x: x + radii.bottomLeft, y: bottomY }, cPos: { x, y: bottomY }, toPos: { x, y: bottomY - radii.bottomLeft } },
    { color: borderColor.bottom, dashPattern: normalizedBorderDashPattern.bottom, lineWidth: borderLineWidth },
  )
  line(
    state,
    [{ x, y: bottomY - radii.bottomLeft }, { x, y: y + radii.topLeft }],
    { color: borderColor.left, dashPattern: normalizedBorderDashPattern.left, lineWidth: borderLineWidth },
  )
  quadraticCurve(
    state,
    { fromPos: { x, y: y + radii.topLeft }, cPos: { x, y }, toPos: { x: x + radii.topLeft, y } },
    { color: borderColor.left, dashPattern: normalizedBorderDashPattern.left, lineWidth: borderLineWidth },
  )

  if (options.backgroundColor != null) {
    const backgroundColor = options?.backgroundColor
    const backgroundOpacity = options?.backgroundOpacity ?? 0.1
    const rgba = convertHexAndOpacityToRgba(backgroundColor, backgroundOpacity)
    rect(state, _rect, { fill: true, stroke: false, fillOptions: { color: rgba } })
  }
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
  if (boundingRect == null)
    return null

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

const text = (state: CanvasDrawerState, _text: string, position: Point2D, angle: number, textOptions: TextOptions) => {
  if (textOptions != null)
    applyTextOptions(state, textOptions, null)

  const textLineHeightMetrics = getTextLineHeightMetrics(state.ctx)

  const textX = position.x
  // Adding the ascent here makes the text sit snugly into the top-left corner of the text rect
  const textY = position.y + textLineHeightMetrics.ascent

  const shouldRotate = angle != null
  if (shouldRotate) {
    state.ctx.save()
    state.ctx.translate(position.x, position.y)
    state.ctx.rotate(angle)
    state.ctx.translate(-position.x, -position.y)
  }
  state.ctx.fillText(_text, textX, textY)
  if (shouldRotate)
    state.ctx.restore()
}

export const createCanvasDrawer = (canvasElement: HTMLCanvasElement, rectDimensions: RectDimensions): CanvasDrawer => {
  const state: CanvasDrawerState = {
    ctx: get2DContext(canvasElement, rectDimensions.width, rectDimensions.height),
    drawnObjects: [],
  }

  return {
    applyLineOptions: (lineOptions, fallbackOptions) => applyLineOptions(state, lineOptions, fallbackOptions),
    applyFillOptions: (fillOptions, fallbackOptions) => applyFillOptions(state, fillOptions, fallbackOptions),
    applyTextOptions: (textOptions, fallbackOptions) => applyTextOptions(state, textOptions, fallbackOptions),
    getRenderingContext: () => state.ctx,
    line: (_line, lineOptions) => line(state, _line, lineOptions),
    arc: (sector, drawOptions) => arc(state, sector, drawOptions),
    circle: (_circle, drawOptions) => circle(state, _circle, drawOptions),
    path: (_path, drawOptions) => path(state, _path, drawOptions),
    rect: (_rect, drawOptions) => rect(state, _rect, drawOptions),
    roundedRectSimple: (_rect, options) => roundedRectSimple(state, _rect, options),
    roundedRect: (_rect, options) => roundedRect(state, _rect, options),
    isoscelesTriangle: (boundingRect, drawOptions) => (
      isoscelesTriangle(state, boundingRect, drawOptions)
    ),
    clearRenderingSpace: rectToClear => clearRenderingSpace(state, rectToClear),
    text: (_text, position, angle, textOptions) => text(state, _text, position, angle, textOptions),
    measureTextWidth: _text => measureTextWidth(state.ctx, _text),
    measureTextHeight: _text => measureTextLineHeight(state.ctx, _text),
    measureTextRectDimensions: _text => ({
      width: measureTextWidth(state.ctx, _text),
      height: measureTextLineHeight(state.ctx, _text),
    }),
  }
}
