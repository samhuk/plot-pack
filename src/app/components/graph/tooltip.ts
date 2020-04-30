import { Point2D, Rect, Axis2D } from '../../common/types/geometry'
import Options from './types/Options'
import { mapDict, findEntryOfMaxValue, combineDicts, anyDict } from '../../common/helpers/dict'
import { measureTextWidth,
  measureTextLineHeight,
  createTextStyle,
  createRoundedRect,
  applyTextOptionsToContext,
  applyLineOptionsToContext } from '../../common/helpers/canvas'
import PositionedDatum from './types/PositionedDatum'
import { getShouldShowMarkers, getShouldShowConnectingLine } from './drawGraph'
import { getMarkerSize, drawStandardMarker } from './marker'
import { drawConnectingLine } from './connectingLine'
import { formatNumber } from './axisMarkerLabels'
import { TextOptions, LineOptions } from '../../common/types/canvas'

const PREVIEW_RIGHT_MARGIN = 10
const DEFAULT_BOX_PADDING_X = 6
const DEFAULT_BOX_PADDING_Y = 6
const DEFAULT_FONT_FAMILY = 'Helvetica'
const DEFAULT_FONT_SIZE = 12
const DEFAULT_TEXT_COLOR = 'black'
const DEFAULT_BORDER_LINE_WIDTH = 1
const DEFAULT_X_VALUE_HEADER_DIVIDER_LINE_WIDTH = 1
const DEFAULT_BORDER_LINE_COLOR = ''
const DEFAULT_BORDER_RADIUS = 3
const DEFAULT_BACKGROUND_COLOR = '#f0f0f0'
const DEFAULT_TOOLTIP_MARGIN_FROM_MARKER = 10

const getSeriesPreviewWidth = (lineHeight: number) => Math.max(10, 1.5 * lineHeight)

const getShouldShowMarkerPreview = (props: Options, seriesKey: string) => (
  getShouldShowMarkers(props, seriesKey) && (props?.tooltipOptions?.visibilityOptions?.showSeriesStylePreview ?? true)
)

const getShouldShowConnectingLinePreview = (props: Options, seriesKey: string) => (
  getShouldShowConnectingLine(props, seriesKey) && (props?.tooltipOptions?.visibilityOptions?.showSeriesStylePreview ?? true)
)

const getShouldShowXValueTitle = (props: Options) => (
  props?.tooltipOptions?.visibilityOptions?.showXValueTitle ?? false
)

const getShouldShowXValueHeaderDivider = (props: Options) => (
  props?.tooltipOptions?.visibilityOptions?.showXValueTitleDivider ?? false
)

const getShouldShowXValueHeaderDividerLineWidth = (props: Options) => (
  props.tooltipOptions?.xValueLabelDividerOptions?.lineWidth ?? DEFAULT_X_VALUE_HEADER_DIVIDER_LINE_WIDTH
)

const createTextStyleInternal = (props: Options, bold: boolean) => createTextStyle(
  props?.tooltipOptions?.fontFamily ?? DEFAULT_FONT_FAMILY,
  props?.tooltipOptions?.fontSize ?? DEFAULT_FONT_SIZE,
  bold,
)

const determineTooltipBoxXCoord = (canvasWidth: number, boxWidth: number, x: number) => {
  // Try placing on RHS
  let prospectiveBoxX = x + DEFAULT_TOOLTIP_MARGIN_FROM_MARKER
  // Determine if the box is overflowing on the RHS
  const rhsOverflow = Math.max(0, prospectiveBoxX + boxWidth - canvasWidth)
  // If not overflowing, remain on RHS, else try placing on LHS
  prospectiveBoxX = rhsOverflow === 0 ? prospectiveBoxX : x - DEFAULT_TOOLTIP_MARGIN_FROM_MARKER - boxWidth
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

const drawSeriesTextLines = (
  ctx: CanvasRenderingContext2D,
  seriesLinesContentRect: Rect,
  lineHeight: number,
  lineVerticalPadding: number,
  labelTexts: { [seriesKey: string]: string },
  valueTexts: { [seriesKey: string]: string },
  labelWidths: { [seriesKey: string]: number },
  props: Options,
) => {
  const textStartX = seriesLinesContentRect.x
  const startY = seriesLinesContentRect.y + lineHeight - lineVerticalPadding
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
  seriesLinesContentRect: Rect,
  lineHeight: number,
  shouldDrawMarkerPreviews: { [seriesKey: string]: boolean },
  shouldDrawConnectingLinePreviews: { [seriesKey: string]: boolean },
  props: Options,
) => {
  Object.entries(shouldDrawMarkerPreviews).forEach(([seriesKey], i) => {
    drawSeriesPreview(
      ctx,
      shouldDrawMarkerPreviews[seriesKey],
      shouldDrawConnectingLinePreviews[seriesKey],
      seriesLinesContentRect.x,
      seriesLinesContentRect.y + (i * lineHeight) + lineHeight / 2,
      seriesLinesContentRect.width,
      lineHeight,
      props,
      seriesKey,
    )
  })
}

const calculateTooltipBoxContentMetrics = (
  ctx: CanvasRenderingContext2D,
  labelTexts: { [seriesKey: string]: string },
  valueTexts: { [seriesKey: string]: string },
  xValueHeaderText: string,
  seriesTextLineLeftMargin: number,
) => {
  // Calculate width of each series line component
  const labelTextWidths = mapDict(labelTexts, (_, text) => measureTextWidth(ctx, text))
  const valueTextWidths = mapDict(valueTexts, (_, value) => measureTextWidth(ctx, value))
  // Calculate width of each series line
  const seriesLineWidths = combineDicts(labelTextWidths, valueTextWidths, (_, w1, w2) => w1 + w2)
  // Calculate width of x value label text
  const xValueHeaderTextWidth = measureTextWidth(ctx, xValueHeaderText)
  // Return the maximum of all these
  return {
    labelTextWidths,
    contentWidth: Math.max(xValueHeaderTextWidth, findEntryOfMaxValue(seriesLineWidths).value + seriesTextLineLeftMargin),
    xValueHeaderTextWidth,
  }
}

const drawXValueHeaderText = (
  ctx: CanvasRenderingContext2D,
  xValueHeaderRect: Rect,
  valueText: string,
  valueTextWidth: number,
  textOptions: TextOptions,
) => {
  applyTextOptionsToContext(ctx, textOptions)
  const lineHeight = measureTextLineHeight(ctx)

  const x = xValueHeaderRect.x + (xValueHeaderRect.width / 2) - (valueTextWidth / 2)
  ctx.fillText(valueText, x, xValueHeaderRect.y + lineHeight)
}

const drawXValueHeaderDividerLine = (ctx: CanvasRenderingContext2D, xValueHeaderDividerBoundingRect: Rect, lineOptions: LineOptions) => {
  const dividerPath = new Path2D()
  const y = xValueHeaderDividerBoundingRect.y + xValueHeaderDividerBoundingRect.height / 2
  dividerPath.moveTo(xValueHeaderDividerBoundingRect.x, y)
  dividerPath.lineTo(xValueHeaderDividerBoundingRect.x + xValueHeaderDividerBoundingRect.width, y)

  applyLineOptionsToContext(ctx, lineOptions)
  ctx.stroke(dividerPath)
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
  // Create value texts and widths
  const valueTexts = mapDict(highlightedDatums, (_, { fvY }) => formatNumber(fvY, props, Axis2D.Y))
  // Create x value text and width
  const xValueHeaderText = formatNumber(nearestDatumOfAllSeries.fvX, props, Axis2D.X)
  // Get "should draw preview marker" value ahead of time to not have to recalculate them all
  const shouldDrawMarkerPreviews = mapDict(highlightedDatums, seriesKey => getShouldShowMarkerPreview(props, seriesKey))
  const shouldDrawConnectingLinePreviews = mapDict(highlightedDatums, seriesKey => getShouldShowConnectingLinePreview(props, seriesKey))

  /* Determine if we have to draw at least one preview.
   * (If so, then we must ensure that the series text is padded sufficiently from the left)
   */
  const shouldDrawAtleastOnePreview = anyDict(
    combineDicts(shouldDrawMarkerPreviews, shouldDrawConnectingLinePreviews, (_, should1, should2) => should1 || should2),
    (_, shouldDrawSomeKindOfPreview) => shouldDrawSomeKindOfPreview,
  )

  const seriesPreviewWidth = getSeriesPreviewWidth(lineHeight)
  const seriesLineTextLeftMargin = shouldDrawAtleastOnePreview ? seriesPreviewWidth + PREVIEW_RIGHT_MARGIN : 0

  const tooltipBoxContentMetrics = calculateTooltipBoxContentMetrics(ctx, labelTexts, valueTexts, xValueHeaderText, seriesLineTextLeftMargin)

  const boxPaddingX = props?.tooltipOptions?.boxPaddingX ?? DEFAULT_BOX_PADDING_X
  const boxPaddingY = props?.tooltipOptions?.boxPaddingY ?? DEFAULT_BOX_PADDING_Y

  const shouldShowXValueTitle = getShouldShowXValueTitle(props)
  const xValueHeaderTextHeight = shouldShowXValueTitle ? lineHeight : 0
  const shouldShowXValueTitleDivider = getShouldShowXValueHeaderDivider(props)
  const xValueHeaderDividerHeight = shouldShowXValueTitleDivider ? (2 * boxPaddingY) + getShouldShowXValueHeaderDividerLineWidth(props) : 0

  // Create tooltip box rect (position and dimensions of the box)
  const boxHeight = (numSeries * lineHeight) + (2 * boxPaddingY) + xValueHeaderTextHeight + xValueHeaderDividerHeight
  const boxWidth = tooltipBoxContentMetrics.contentWidth + (2 * boxPaddingX)
  const tooltipBoxPosition: Point2D = {
    x: determineTooltipBoxXCoord(props.widthPx, boxWidth, nearestDatumOfAllSeries.fpX),
    /* Position vertically centered relative to cursor position,
     * ensuring that it doesn't overflow at the top (negative y position)
     */
    y: Math.max(0, cursorPoint.y - (boxHeight / 2)),
  }

  const xValueHeaderTextBoundingRect: Rect = {
    x: tooltipBoxPosition.x + boxPaddingX,
    y: tooltipBoxPosition.y + boxPaddingY,
    width: tooltipBoxContentMetrics.contentWidth,
    height: xValueHeaderTextHeight,
  }
  const xValueHeaderDividerBoundingRect: Rect = {
    x: tooltipBoxPosition.x,
    y: xValueHeaderTextBoundingRect.y + xValueHeaderTextBoundingRect.height,
    width: boxWidth,
    height: xValueHeaderDividerHeight,
  }
  const seriesPreviewsBoundingRect: Rect = {
    x: tooltipBoxPosition.x + boxPaddingX,
    y: xValueHeaderDividerBoundingRect.y + xValueHeaderDividerBoundingRect.height,
    width: seriesPreviewWidth,
    height: numSeries * lineHeight,
  }
  const seriesTextLinesBoundingRect: Rect = {
    x: tooltipBoxPosition.x + boxPaddingX + seriesLineTextLeftMargin,
    y: xValueHeaderDividerBoundingRect.y + xValueHeaderDividerBoundingRect.height,
    width: tooltipBoxContentMetrics.contentWidth,
    height: numSeries * lineHeight,
  }

  const tooltipBoxRect: Rect = {
    x: tooltipBoxPosition.x,
    y: tooltipBoxPosition.y,
    width: boxWidth,
    height: boxHeight,
  }

  // Draw box
  drawBox(ctx, tooltipBoxRect, props)
  // Draw x value header
  if (shouldShowXValueTitle) {
    drawXValueHeaderText(
      ctx,
      xValueHeaderTextBoundingRect,
      xValueHeaderText,
      tooltipBoxContentMetrics.xValueHeaderTextWidth,
      props.tooltipOptions?.xValueLabelTextOptions,
    )
  }
  if (shouldShowXValueTitleDivider) {
    drawXValueHeaderDividerLine(
      ctx,
      xValueHeaderDividerBoundingRect,
      props.tooltipOptions?.xValueLabelDividerOptions,
    )
  }
  // Draw series previews (i.e. marker and/or connecting line)
  drawSeriesPreviews(
    ctx,
    seriesPreviewsBoundingRect,
    lineHeight,
    shouldDrawMarkerPreviews,
    shouldDrawConnectingLinePreviews,
    props,
  )
  // Draw series label and value text lines
  drawSeriesTextLines(
    ctx,
    seriesTextLinesBoundingRect,
    lineHeight,
    lineVerticalPadding,
    labelTexts,
    valueTexts,
    tooltipBoxContentMetrics.labelTextWidths,
    props,
  )
}

export default draw
