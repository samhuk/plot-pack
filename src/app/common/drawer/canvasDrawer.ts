import { CanvasDrawer, CanvasDrawerState, DrawOptions, RoundedRectOptions, RoundedRectSimpleOptions, TextOptions } from './types'
import { get2DContext, applyTextOptionsToContext, getTextLineHeightMetrics, measureTextWidth, measureTextLineHeight } from '../helpers/canvas'
import { LineOptions, FillOptions, TextOptions as TextOptionsBase } from '../types/canvas'
import { Line, CircularSector, Rect, Circle, Point2D, RectDimensions, QuadraticCurve, Corners2DOptional } from '../types/geometry'
import { createPath2DFromPath } from './path/path'
import { Path, PathComponentType } from './path/types'
import { normalizeCornersObject, normalizeDirectionsObject } from '../helpers/geometry'
import { convertCssColorAndOpacityToRgba } from '../helpers/color'

/* eslint-disable no-param-reassign */

const applyLineOptions = (state: CanvasDrawerState, lineOptions: LineOptions, fallbackOptions: LineOptions) => {
  state.ctx.lineWidth = lineOptions?.lineWidth ?? fallbackOptions?.lineWidth ?? 1
  state.ctx.setLineDash(lineOptions?.dashPattern ?? fallbackOptions?.dashPattern ?? [])
  state.ctx.strokeStyle = lineOptions?.color ?? fallbackOptions?.color ?? 'black'
}

const applyFillOptions = (state: CanvasDrawerState, fillOptions: FillOptions, fallbackOptions: FillOptions) => {
  state.ctx.fillStyle = convertCssColorAndOpacityToRgba(
    fillOptions?.color ?? fallbackOptions?.color ?? 'black', // color
    fillOptions?.opacity ?? fallbackOptions?.opacity ?? 1, // opacity
  )
}

/* eslint-enable no-param-reassign */

const applyLineAndFillOptions = (
  state: CanvasDrawerState,
  lineOptions: LineOptions,
  fallbackLineOptions: LineOptions,
  fillOptions: FillOptions,
  fallbackFillOptions: FillOptions,
) => {
  if (lineOptions != null)
    applyLineOptions(state, lineOptions, fallbackLineOptions)
  if (fillOptions != null)
    applyFillOptions(state, fillOptions, fallbackFillOptions)
}

const applyDrawOptions = (
  state: CanvasDrawerState,
  drawOptions: DrawOptions,
) => {
  if (drawOptions?.lineOptions != null)
    applyLineOptions(state, drawOptions.lineOptions, drawOptions.fallbackLineOptions)
  if (drawOptions?.fillOptions != null)
    applyFillOptions(state, drawOptions.fillOptions, drawOptions.fallbackFillOptions)
}

const applyTextOptions = (state: CanvasDrawerState, textOptions: TextOptionsBase, fallbackOptions: TextOptionsBase) => {
  applyTextOptionsToContext(state.ctx, textOptions, fallbackOptions)
}

const drawPath2D = (state: CanvasDrawerState, _path: Path2D, stroke: boolean = true, fill: boolean = false) => {
  if (stroke ?? true) // stroke by default
    state.ctx.stroke(_path)
  if (fill ?? false) // don't fill by default
    state.ctx.fill(_path)
}

const clearRenderingSpace = (state: CanvasDrawerState, rectToClear: Rect) => {
  if (rectToClear != null)
    state.ctx.clearRect(rectToClear.x, rectToClear.y, rectToClear.width, rectToClear.height)
  else
    state.ctx.clearRect(0, 0, state.ctx.canvas.height, state.ctx.canvas.width)
}

export const createLinePath = (_line: Line, precreatedPath?: Path2D): Path2D => {
  const p = precreatedPath ?? new Path2D()
  if (_line[0] != null)
    p.moveTo(_line[0].x, _line[0].y)
  p.lineTo(_line[1].x, _line[1].y)
  return p
}

const line = (state: CanvasDrawerState, _line: Line, lineOptions: LineOptions, fallbackLineOptions: LineOptions): Path2D => {
  if (_line == null || _line.length !== 2)
    return null

  applyLineAndFillOptions(state, lineOptions, fallbackLineOptions, null, null)

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

const quadraticCurve = (
  state: CanvasDrawerState,
  curve: QuadraticCurve,
  lineOptions: LineOptions,
  fallbackLineOptions: LineOptions,
) : Path2D => {
  if (curve == null)
    return null

  applyLineAndFillOptions(state, lineOptions, fallbackLineOptions, null, null)

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

  applyDrawOptions(state, drawOptions)

  if ((_drawOptions.stroke ?? true) && state.ctx.lineWidth === 0)
    return null

  const p = createArcPath(sector)
  drawPath2D(state, p, _drawOptions.stroke, _drawOptions.fill)
  return p
}

export const createCirclePath = (_circle: Circle): Path2D => createArcPath({
  position: _circle.position,
  radius: _circle.radius,
  arc: { start: 0, end: 2 * Math.PI },
})

const circle = (
  state: CanvasDrawerState,
  _circle: Circle,
  drawOptions: DrawOptions,
): Path2D => {
  if (_circle == null)
    return null

  const _drawOptions = drawOptions ?? { }

  applyDrawOptions(state, drawOptions)

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
  if (!(_drawOptions.stroke ?? true) && !(_drawOptions.fill ?? false))
    return null

  applyDrawOptions(state, _drawOptions)

  const p = createPath2DFromPath(_path)
  drawPath2D(state, p, _drawOptions.stroke ?? true, _drawOptions.fill ?? false)
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
  applyDrawOptions(state, drawOptions)

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

  applyDrawOptions(state, options)

  // If border radius is not defined or zero, then can just create a simple rect path, else create rounded rect path
  const borderRadius = options.lineOptions?.radii ?? options.fallbackLineOptions?.radii ?? 0
  const p = borderRadius == null || borderRadius === 0
    ? createRectPath(_rect)
    : createSingleRoundedRectPath(_rect, normalizeCornersObject(borderRadius, 0))
  drawPath2D(state, p, options.stroke, options.fill)
  return p
}

const roundedRect = (
  state: CanvasDrawerState,
  _rect: Rect,
  options: RoundedRectOptions,
  fallbackOptions: RoundedRectOptions,
) => {
  const borderColors = normalizeDirectionsObject(options?.borderColor ?? fallbackOptions?.borderColor, 'black')
  const borderDashPatterns = normalizeDirectionsObject(options?.borderDashPattern ?? fallbackOptions?.borderDashPattern, [])
  const borderLineVisibilities = normalizeDirectionsObject(options?.stroke ?? fallbackOptions?.stroke)
  const borderLineWidth = options?.borderLineWidth ?? fallbackOptions?.borderLineWidth ?? 1
  const radii = normalizeCornersObject(options?.borderRadii ?? fallbackOptions?.borderRadii, 0)
  const { x, y, height, width } = _rect
  const rightX = x + width
  const bottomY = y + height

  /* eslint-disable max-len */
  const arcs = {
    top: {
      left: { arc: { start: 1.25 * Math.PI, end: 1.5 * Math.PI }, position: { x: x + radii.topLeft, y: y + radii.topLeft }, radius: radii.topLeft },
      right: { arc: { start: 1.5 * Math.PI, end: 1.75 * Math.PI }, position: { x: rightX - radii.topRight, y: y + radii.topRight }, radius: radii.topRight },
    },
    right: {
      top: { arc: { start: 1.75 * Math.PI, end: 0 }, position: { x: rightX - radii.topRight, y: y + radii.topRight }, radius: radii.topRight },
      bottom: { arc: { start: 0, end: 0.25 * Math.PI }, position: { x: rightX - radii.bottomRight, y: bottomY - radii.bottomRight }, radius: radii.bottomRight },
    },
    bottom: {
      right: { arc: { start: 0.25 * Math.PI, end: 0.5 * Math.PI }, position: { x: rightX - radii.bottomRight, y: bottomY - radii.bottomRight }, radius: radii.bottomRight },
      left: { arc: { start: 0.5 * Math.PI, end: 0.75 * Math.PI }, position: { x: x + radii.bottomLeft, y: bottomY - radii.bottomLeft }, radius: radii.bottomLeft },
    },
    left: {
      bottom: { arc: { start: 0.75 * Math.PI, end: Math.PI }, position: { x: x + radii.bottomLeft, y: bottomY - radii.bottomLeft }, radius: radii.bottomLeft },
      top: { arc: { start: Math.PI, end: 1.25 * Math.PI }, position: { x: x + radii.topLeft, y: y + radii.topLeft }, radius: radii.topLeft },
    },
  }
  /* eslint-enable max-len */

  const lines = {
    top: { from: { x: x + radii.topLeft, y }, to: { x: rightX - radii.topRight, y } },
    right: { from: { x: rightX, y: y + radii.topRight }, to: { x: rightX, y: bottomY - radii.bottomRight } },
    bottom: { from: { x: rightX - radii.bottomRight, y: bottomY }, to: { x: x + radii.bottomLeft, y: bottomY } },
    left: { from: { x, y: bottomY - radii.bottomLeft }, to: { x, y: y + radii.topLeft } },
  }

  // Top
  if (borderLineVisibilities.top) {
    const isTopLeftCornerRadiusZero = arcs.top.left.radius === 0
    const isTopRightCornerRadiusZero = arcs.top.right.radius === 0
    if (!isTopLeftCornerRadiusZero) {
      // Top left
      arc(state, arcs.top.left,
        { lineOptions: { color: borderColors.top, dashPattern: borderDashPatterns.top, lineWidth: borderLineWidth } })
    }
    const from = { x: lines.top.from.x - (isTopLeftCornerRadiusZero ? borderLineWidth / 2 : 0), y: lines.top.from.y }
    const to = { x: lines.top.to.x + (isTopRightCornerRadiusZero ? borderLineWidth / 2 : 0), y: lines.top.to.y }
    line(state, [from, to],
      { color: borderColors.top, dashPattern: borderDashPatterns.top, lineWidth: borderLineWidth },
      null)
    if (!isTopRightCornerRadiusZero) {
      // Top right
      arc(state, arcs.top.right,
        { lineOptions: { color: borderColors.top, dashPattern: borderDashPatterns.top, lineWidth: borderLineWidth } })
    }
  }
  // Right
  if (borderLineVisibilities.right) {
    const isTopRightCornerRadiusZero = arcs.top.right.radius === 0
    const isBottomRightCornerRadiusZero = arcs.bottom.right.radius === 0
    if (!isTopRightCornerRadiusZero) {
      // Top right
      arc(state, arcs.right.top,
        { lineOptions: { color: borderColors.right, dashPattern: borderDashPatterns.right, lineWidth: borderLineWidth } })
    }
    // Right
    const from = { x: lines.right.from.x, y: lines.right.from.y - (isTopRightCornerRadiusZero ? borderLineWidth / 2 : 0) }
    const to = { x: lines.right.from.x, y: lines.right.to.y + (isBottomRightCornerRadiusZero ? borderLineWidth / 2 : 0) }
    line(state, [from, to],
      { color: borderColors.right, dashPattern: borderDashPatterns.right, lineWidth: borderLineWidth },
      null)
    if (!isBottomRightCornerRadiusZero) {
      // Bottom right
      arc(state, arcs.right.bottom,
        { lineOptions: { color: borderColors.right, dashPattern: borderDashPatterns.right, lineWidth: borderLineWidth } })
    }
  }
  // Bottom
  if (borderLineVisibilities.bottom) {
    const isBottomRightCornerRadiusZero = arcs.bottom.right.radius === 0
    const isBottomLeftCornerRadiusZero = arcs.bottom.left.radius === 0
    if (!isBottomRightCornerRadiusZero) {
      // Bottom right
      arc(state, arcs.bottom.right,
        { lineOptions: { color: borderColors.bottom, dashPattern: borderDashPatterns.bottom, lineWidth: borderLineWidth } })
    }
    // Bottom
    const from = { x: lines.bottom.from.x + (isBottomRightCornerRadiusZero ? borderLineWidth / 2 : 0), y: lines.bottom.from.y }
    const to = { x: lines.bottom.to.x - (isBottomLeftCornerRadiusZero ? borderLineWidth / 2 : 0), y: lines.bottom.to.y }
    line(state, [from, to],
      { color: borderColors.bottom, dashPattern: borderDashPatterns.bottom, lineWidth: borderLineWidth },
      null)
    if (!isBottomLeftCornerRadiusZero) {
      // Bottom left
      arc(state, arcs.bottom.left,
        { lineOptions: { color: borderColors.bottom, dashPattern: borderDashPatterns.bottom, lineWidth: borderLineWidth } })
    }
  }
  // Left
  if (borderLineVisibilities.left) {
    const isBottomLeftCornerRadiusZero = arcs.bottom.left.radius === 0
    const isTopLeftCornerRadiusZero = arcs.top.left.radius === 0
    if (!isBottomLeftCornerRadiusZero) {
      // Bottom left
      arc(state, arcs.left.bottom,
        { lineOptions: { color: borderColors.left, dashPattern: borderDashPatterns.left, lineWidth: borderLineWidth } })
    }
    // Left
    const from = { x: lines.left.from.x, y: lines.left.from.y + (isBottomLeftCornerRadiusZero ? borderLineWidth / 2 : 0) }
    const to = { x: lines.left.from.x, y: lines.left.to.y - (isTopLeftCornerRadiusZero ? borderLineWidth / 2 : 0) }
    line(state, [from, to],
      { color: borderColors.left, dashPattern: borderDashPatterns.left, lineWidth: borderLineWidth },
      null)
    if (!isTopLeftCornerRadiusZero) {
      // top left
      arc(state, arcs.left.top,
        { lineOptions: { color: borderColors.left, dashPattern: borderDashPatterns.left, lineWidth: borderLineWidth } })
    }
  }

  // Background
  if (options?.fill ?? fallbackOptions?.fill ?? true) {
    const drawOptions = {
      stroke: false,
      fill: true,
      lineOptions: { radii },
      fillOptions: {
        color: options?.fillOptions?.color ?? fallbackOptions?.fillOptions?.color ?? 'black',
        opacity: options?.fillOptions?.opacity ?? fallbackOptions?.fillOptions?.opacity ?? 0.05,
      },
    }
    roundedRectSimple(state, _rect, drawOptions)
  }
}

const occlusionBorder = (
  state: CanvasDrawerState,
  unoccludedRect: Rect,
): void => {
  const _topRect: Rect = { x: 0, y: 0, height: unoccludedRect.y, width: state.ctx.canvas.width }
  const _bottomRect: Rect = {
    x: 0,
    y: unoccludedRect.y + unoccludedRect.height,
    height: state.ctx.canvas.height - unoccludedRect.y - unoccludedRect.height,
    width: state.ctx.canvas.width,
  }
  const _leftRect: Rect = { x: 0, y: unoccludedRect.y, height: unoccludedRect.height, width: unoccludedRect.x }
  const _rightRect: Rect = {
    x: unoccludedRect.x + unoccludedRect.width,
    y: unoccludedRect.y,
    height: unoccludedRect.height,
    width: state.ctx.canvas.width - unoccludedRect.x - unoccludedRect.width,
  }
  clearRenderingSpace(state, _topRect)
  clearRenderingSpace(state, _bottomRect)
  clearRenderingSpace(state, _leftRect)
  clearRenderingSpace(state, _rightRect)
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

  applyDrawOptions(state, drawOptions)

  if ((drawOptions.stroke ?? true) && state.ctx.lineWidth === 0)
    return null

  const path2D = createPath2DFromPath(createIsoscelesTrianglePath(boundingRect))
  drawPath2D(state, path2D, drawOptions.stroke, drawOptions.fill)
  return path2D
}

const text = (
  state: CanvasDrawerState,
  _text: string,
  position: Point2D,
  angle: number,
  textOptions: TextOptions,
  fallbackTextOptions: TextOptions,
) => {
  applyTextOptions(state, textOptions, fallbackTextOptions)

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
    line: (_line, lineOptions) => line(state, _line, lineOptions, null),
    quadraticCurve: (_quadraticCurve, lineOptions) => quadraticCurve(state, _quadraticCurve, lineOptions, null),
    arc: (sector, drawOptions) => arc(state, sector, drawOptions),
    circle: (_circle, drawOptions) => circle(state, _circle, drawOptions),
    path: (_path, drawOptions) => path(state, _path, drawOptions),
    rect: (_rect, drawOptions) => rect(state, _rect, drawOptions),
    roundedRectSimple: (_rect, options) => roundedRectSimple(state, _rect, options),
    roundedRect: (_rect, options, fallbackOptions) => roundedRect(state, _rect, options, fallbackOptions),
    occlusionBorder: unoccludedRect => occlusionBorder(state, unoccludedRect),
    isoscelesTriangle: (boundingRect, drawOptions) => (
      isoscelesTriangle(state, boundingRect, drawOptions)
    ),
    clearRenderingSpace: rectToClear => clearRenderingSpace(state, rectToClear),
    text: (_text, position, angle, textOptions, fallbackTextOptions) => text(state, _text, position, angle, textOptions, fallbackTextOptions),
    measureTextWidth: _text => measureTextWidth(state.ctx, _text),
    measureTextHeight: _text => measureTextLineHeight(state.ctx, _text),
    measureTextRectDimensions: _text => ({
      width: measureTextWidth(state.ctx, _text),
      height: measureTextLineHeight(state.ctx, _text),
    }),
  }
}
