import { Point2D, Rect } from '../../common/types/geometry'
import Options from './types/Options'
import { mapDict, findEntryOfMaxValue, combineDicts, anyDict } from '../../common/helpers/dict'
import { measureTextWidth, measureTextLineHeight, createTextStyle, createRoundedRect } from '../../common/helpers/canvas'
import PositionedDatum from './types/PositionedDatum'
import { getShouldShowMarkers, getShouldShowConnectingLine } from './drawGraph'
import { getMarkerSize, drawStandardMarker } from './marker'
import { drawConnectingLine } from './connectingLine'

const PREVIEW_RIGHT_MARGIN = 10
const DEFAULT_BOX_PADDING_X = 10
const DEFAULT_BOX_PADDING_Y = 10
const DEFAULT_FONT_FAMILY = 'Helvetica'
const DEFAULT_FONT_SIZE = 12
const DEFAULT_TEXT_COLOR = 'black'
const DEFAULT_BORDER_LINE_WIDTH = 1
const DEFAULT_BORDER_LINE_COLOR = ''
const DEFAULT_BORDER_RADIUS = 3
const DEFAULT_BACKGROUND_COLOR = '#f0f0f0'

const getPreviewWidth = (lineHeight: number) => Math.max(10, 1.5 * lineHeight)

const getShouldShowMarkerPreview = (props: Options, seriesKey: string) => (
  getShouldShowMarkers(props, seriesKey) && (props?.tooltipOptions?.showSeriesStylePreview ?? true)
)

const getShouldShowConnectingLinePreview = (props: Options, seriesKey: string) => (
  getShouldShowConnectingLine(props, seriesKey) && (props?.tooltipOptions?.showSeriesStylePreview ?? true)
)

const createTextStyleInternal = (props: Options, bold: boolean) => createTextStyle(
  props?.tooltipOptions?.fontFamily ?? DEFAULT_FONT_FAMILY,
  props?.tooltipOptions?.fontSize ?? DEFAULT_FONT_SIZE,
  bold,
)

const determineBoxX = (canvasWidth: number, boxWidth: number, x: number) => {
  // Try placing on RHS
  let prospectiveBoxX = x + 5
  // Determine if the box is overflowing on the RHS
  const rhsOverflow = Math.max(0, prospectiveBoxX + boxWidth - canvasWidth)
  // If not overflowing, remain on RHS, else try placing on LHS
  prospectiveBoxX = rhsOverflow === 0 ? prospectiveBoxX : x - 5 - boxWidth
  // If not overflowing, remain on LHS, else place in the middle
  return prospectiveBoxX > 0 ? prospectiveBoxX : x - (boxWidth / 2)
}

const drawBox = (ctx: CanvasRenderingContext2D, boxRect: Rect, props: Options) => {
  const borderRadius = props?.tooltipOptions?.borderRadius ?? DEFAULT_BORDER_RADIUS
  const boxPath = createRoundedRect(boxRect.x, boxRect.y, boxRect.width, boxRect.height, borderRadius)
  ctx.lineWidth = props?.tooltipOptions?.borderLineWidth ?? DEFAULT_BORDER_LINE_WIDTH
  ctx.strokeStyle = props?.tooltipOptions?.borderLineColor ?? DEFAULT_BORDER_LINE_COLOR
  ctx.fillStyle = props?.tooltipOptions?.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
  ctx.stroke(boxPath)
  ctx.fill(boxPath)
}

const drawSeriesLines = (
  ctx: CanvasRenderingContext2D,
  boxRect: Rect,
  boxPaddingX: number,
  boxPaddingY: number,
  lineHeight: number,
  lineVerticalPadding: number,
  labelTexts: { [seriesKey: string]: string },
  valueTexts: { [seriesKey: string]: string },
  labelWidths: { [seriesKey: string]: number },
  leftMargin: number,
  props: Options,
) => {
  const textStartX = boxRect.x + boxPaddingX + leftMargin
  const startY = boxRect.y + boxPaddingY + lineHeight - lineVerticalPadding
  Object.entries(labelTexts).forEach(([seriesKey, labelText], i) => {
    const lineY = startY + (i * lineHeight)
    ctx.fillStyle = props?.tooltipOptions?.textColor ?? DEFAULT_TEXT_COLOR
    ctx.font = createTextStyleInternal(props, false) // Series key text is not bold
    ctx.fillText(labelText, textStartX, lineY)
    ctx.font = createTextStyleInternal(props, true) // value is bold
    ctx.fillText(valueTexts[seriesKey], textStartX + labelWidths[seriesKey], lineY)
  })
}

const drawSeriesPreview = (
  ctx: CanvasRenderingContext2D,
  shouldDrawMarkerPreview: boolean,
  shouldDrawConnectingLinePreview: boolean,
  x: number,
  y: number,
  previewWidth: number,
  lineHeight: number,
  props: Options,
  seriesKey: string,
) => {
  if (shouldDrawMarkerPreview) {
    const markerSize = Math.min(lineHeight, getMarkerSize(props, seriesKey))
    drawStandardMarker(ctx, x + previewWidth / 2, y, props, seriesKey, markerSize)
  }
  if (shouldDrawConnectingLinePreview)
    drawConnectingLine(ctx, x, y, x + previewWidth, y, props, seriesKey)
}

const drawSeriesPreviews = (
  ctx: CanvasRenderingContext2D,
  boxRect: Rect,
  boxPaddingX: number,
  boxPaddingY: number,
  lineHeight: number,
  shouldDrawMarkerPreviews: { [seriesKey: string]: boolean },
  shouldDrawConnectingLinePreviews: { [seriesKey: string]: boolean },
  previewWidth: number,
  props: Options,
) => {
  const startX = boxRect.x + boxPaddingX
  const startY = boxRect.y + boxPaddingY

  Object.entries(shouldDrawMarkerPreviews).forEach(([seriesKey], i) => {
    drawSeriesPreview(
      ctx,
      shouldDrawMarkerPreviews[seriesKey],
      shouldDrawConnectingLinePreviews[seriesKey],
      startX,
      startY + (i * lineHeight) + lineHeight / 2,
      previewWidth,
      lineHeight,
      props,
      seriesKey,
    )
  })
}

export const draw = (
  ctx: CanvasRenderingContext2D,
  cursorPoint: Point2D,
  highlightedDatums: { [seriesKey: string]: PositionedDatum },
  nearestDatumOfAllSeries: PositionedDatum,
  props: Options,
) => {
  const numSeries = Object.keys(highlightedDatums).length
  if (numSeries === 0)
    return

  // Set font early such that we can measure text according to the preferences
  ctx.font = createTextStyleInternal(props, true)
  const lineVerticalPadding = 5
  // Measure line height
  const lineHeight = measureTextLineHeight(ctx) + lineVerticalPadding

  // Create series key label texts and widths
  const labelTexts = mapDict(highlightedDatums, seriesKey => `${seriesKey}:  `)
  const labelWidths = mapDict(labelTexts, (_, text) => measureTextWidth(ctx, text))
  // Create value texts and widths
  const valueTexts = mapDict(highlightedDatums, (_, { vY }) => (typeof vY === 'number' ? vY : vY[0]).toString())
  const valueTextWidths = mapDict(valueTexts, (_, value) => measureTextWidth(ctx, value))
  // Create x value text and width
  const xValueLabelText = nearestDatumOfAllSeries.vX.toString()
  const xValueLabelTextWidth = measureTextWidth(ctx, xValueLabelText)
  // Get "should draw preview marker" value ahead of time to not have to recalculate them all
  const shouldDrawMarkerPreviews = mapDict(highlightedDatums, seriesKey => getShouldShowMarkerPreview(props, seriesKey))
  const shouldDrawConnectingLinePreviews = mapDict(highlightedDatums, seriesKey => getShouldShowConnectingLinePreview(props, seriesKey))
  // Create line texts and widths
  const lineWidths = combineDicts(labelWidths, valueTextWidths, (_, w1, w2) => w1 + w2)
  const largestLineWidth = Math.max(xValueLabelTextWidth, findEntryOfMaxValue(lineWidths).value)

  const boxPaddingX = props?.tooltipOptions?.boxPaddingX ?? DEFAULT_BOX_PADDING_X
  const boxPaddingY = props?.tooltipOptions?.boxPaddingY ?? DEFAULT_BOX_PADDING_Y

  const previewWidth = getPreviewWidth(lineHeight)

  /* Determine if we have to draw at least one preview.
   * (If so, then we must ensure that the series text is padded sufficiently)
   */
  const shouldDrawAtleastOnePreview = anyDict(
    combineDicts(shouldDrawMarkerPreviews, shouldDrawConnectingLinePreviews, (_, should1, should2) => should1 || should2),
    (_, shouldDrawSomeKindOfPreview) => shouldDrawSomeKindOfPreview,
  )

  // Create box rect (position and dimensions of the box)
  const boxHeight = (numSeries * lineHeight) + (2 * boxPaddingY)
  const boxWidth = largestLineWidth + (2 * boxPaddingX) + (shouldDrawAtleastOnePreview ? previewWidth + PREVIEW_RIGHT_MARGIN : 0)
  const boxRect: Rect = {
    x: determineBoxX(props.widthPx, boxWidth, nearestDatumOfAllSeries.pX),
    // Place vertically centered, ensuring that it doesn't overflow at the top (negative y position)
    y: Math.max(0, cursorPoint.y - (boxHeight / 2)),
    width: boxWidth,
    height: boxHeight,
  }

  // Draw box
  drawBox(ctx, boxRect, props)
  // Draw series previews (i.e. marker and/or connecting line)
  drawSeriesPreviews(
    ctx,
    boxRect,
    boxPaddingX,
    boxPaddingY,
    lineHeight,
    shouldDrawMarkerPreviews,
    shouldDrawConnectingLinePreviews,
    previewWidth,
    props,
  )
  // Draw series label and value text lines
  drawSeriesLines(
    ctx,
    boxRect,
    boxPaddingX,
    boxPaddingY,
    lineHeight,
    lineVerticalPadding,
    labelTexts,
    valueTexts,
    labelWidths,
    // If there is at least one preview to show, the add left margin
    shouldDrawAtleastOnePreview ? previewWidth + PREVIEW_RIGHT_MARGIN : 0,
    props,
  )
}

export default draw
