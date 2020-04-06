/* eslint-disable no-param-reassign */

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
  fontSize?: string,
) => {
  const computedStyle = fontFamily == null || fontSize == null ? window.getComputedStyle(canvas) : null
  ctx.font = `${fontSize ?? computedStyle.fontSize} ${fontFamily ?? computedStyle.fontFamily}`
}

export const get2DContext = (
  canvas: HTMLCanvasElement,
  properWidthPx?: number,
  properHeightPx?: number,
  fontFamily?: string,
  fontSize?: string,
) => {
  const ctx = canvas.getContext('2d')
  fixCanvasBlurriness(canvas, ctx, properWidthPx, properHeightPx)
  // Set the text properties for the wedge labels
  setContextTextProperties(canvas, ctx, fontFamily, fontSize)
  return ctx
}

export const measureTextLineHeight = (ctx: CanvasRenderingContext2D) => {
  const metrics = ctx.measureText('gQ')
  return (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
}

export const isMouseInPath = (e: MouseEvent, ctx: CanvasRenderingContext2D, path: Path2D) => (
  ctx.isPointInPath(path, e.offsetX * window.devicePixelRatio, e.offsetY * window.devicePixelRatio)
)
