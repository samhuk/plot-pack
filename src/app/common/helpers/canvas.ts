/* eslint-disable no-param-reassign */

import { Point2D } from '../types/geometry'
import { TextOptions, LineOptions } from '../types/canvas'

/**
 * Readjusts the dimensions of `canvas` and `ctx` depnding on the current
 * device pixel ratio (DPR) of `window` to prevent blurry rendering. This doesn't change
 * the apparent size of the rendered image.
 *
 * NOTE: This will cause all events pertaining to a co-ordinate on the canvas
 * to be off by a factor of 1/DPR. I.e. offsetX * DPR is the real canvas co-ordinate.
 */
const fixCanvasBlurriness = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  properWidthPx?: number,
  properHeightPx?: number,
): void => {
  const properWidth = properWidthPx ?? canvas.width
  const properHeight = properHeightPx ?? canvas.height

  const dpr = window.devicePixelRatio ?? 1
  const dprAdjustedWidth = properWidth * dpr
  const dprAdjustedproperHeight = properHeight * dpr

  canvas.width = dprAdjustedWidth
  canvas.height = dprAdjustedproperHeight
  canvas.style.width = `${properWidth}px`
  canvas.style.height = `${properHeight}px`
  ctx.scale(dpr, dpr)
}

/**
 * Sets the font property on the given `ctx` according to either the computed
 * style's font of `canvas`, or if provided, `fontFamily` and `fontSize`.
 */
const setContextTextProperties = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  fontFamily?: string,
  fontSize?: number,
) => {
  const computedStyle = fontFamily == null || fontSize == null ? window.getComputedStyle(canvas) : null
  ctx.font = `${fontSize ?? computedStyle.fontSize} ${fontFamily ?? computedStyle.fontFamily}`
}

export const get2DContext = (
  canvas: HTMLCanvasElement,
  properWidthPx?: number,
  properHeightPx?: number,
  fontFamily?: string,
  fontSize?: number,
) => {
  const ctx = canvas.getContext('2d')
  fixCanvasBlurriness(canvas, ctx, properWidthPx, properHeightPx)
  // Set the text properties for the wedge labels
  setContextTextProperties(canvas, ctx, fontFamily, fontSize)
  return ctx
}

export const measureTextLineHeight = (ctx: CanvasRenderingContext2D, text?: string) => {
  const metrics = ctx.measureText(text ?? 'gQ')
  return (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
}

export const measureTextWidth = (ctx: CanvasRenderingContext2D, text: string) => ctx.measureText(text).width

export const getDprCorrectedEventPosition = (e: MouseEvent): Point2D => ({
  x: e.offsetX * window.devicePixelRatio,
  y: e.offsetY * window.devicePixelRatio,
})

export const isMouseInPath = (e: MouseEvent, ctx: CanvasRenderingContext2D, path: Path2D) => {
  const { x, y } = getDprCorrectedEventPosition(e)
  return ctx.isPointInPath(path, x, y)
}

export const createTextStyle = (fontFamily: string, fontSize: number, bold?: boolean, italic?: boolean) => (
  `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize?.toString().concat('px ') ?? ''}${fontFamily ?? ''}`.trim()
)

export const createRoundedRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  cornerRadii: number | number[],
): Path2D => {
  const _cornerRadii = typeof cornerRadii === 'number'
    ? { upperLeft: cornerRadii, upperRight: cornerRadii, lowerLeft: cornerRadii, lowerRight: cornerRadii }
    : cornerRadii.length === 4
      ? { upperLeft: cornerRadii[0], upperRight: cornerRadii[1], lowerLeft: cornerRadii[2], lowerRight: cornerRadii[3] }
      : null

  if (_cornerRadii == null)
    return null

  const path = new Path2D()
  path.moveTo(x + _cornerRadii.upperLeft, y)
  path.lineTo(x + width - _cornerRadii.upperRight, y)
  path.quadraticCurveTo(x + width, y, x + width, y + _cornerRadii.upperRight)
  path.lineTo(x + width, y + height - _cornerRadii.lowerRight)
  path.quadraticCurveTo(x + width, y + height, x + width - _cornerRadii.lowerRight, y + height)
  path.lineTo(x + _cornerRadii.lowerLeft, y + height)
  path.quadraticCurveTo(x, y + height, x, y + height - _cornerRadii.lowerLeft)
  path.lineTo(x, y + _cornerRadii.upperLeft)
  path.quadraticCurveTo(x, y, x + _cornerRadii.upperLeft, y)

  return path
}

export const applyTextOptionsToContext = (
  ctx: CanvasRenderingContext2D,
  options: TextOptions,
  defaultFontFamily?: string,
  defaultFontSize?: number,
  defaultColor?: string,
) => {
  ctx.lineWidth = 0.7
  ctx.font = createTextStyle(
    options?.fontFamily ?? defaultFontFamily ?? 'Helvetica',
    options?.fontSize ?? defaultFontSize ?? 14,
  )
  ctx.fillStyle = options?.color ?? defaultColor ?? 'black'
}

export const applyLineOptionsToContext = (
  ctx: CanvasRenderingContext2D,
  options: LineOptions,
  defaultLineWidth?: number,
  defaultColor?: string,
  defaultDashPattern?: number[],
): boolean => {
  const lineWidth = options?.lineWidth ?? defaultLineWidth ?? 1
  if (lineWidth <= 0)
    return false

  ctx.lineWidth = lineWidth
  ctx.strokeStyle = options?.color ?? defaultColor ?? 'black'
  ctx.setLineDash(options?.dashPattern ?? defaultDashPattern ?? [])
  return true
}
