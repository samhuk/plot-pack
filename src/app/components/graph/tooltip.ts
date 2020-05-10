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
import { sizeInputColumn } from '../../common/canvasFlex/dimensions'
import { renderColumn } from '../../common/canvasFlex/rendering'
import { ColumnJustification, InputColumn, InputRow, SizeUnit } from '../../common/canvasFlex/types'

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

export const getShouldDrawTooltip = (props: Options) => (
  props.visibilityOptions?.showTooltip ?? true
)

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

const drawXValueHeaderText = (
  ctx: CanvasRenderingContext2D,
  textRect: Rect,
  valueText: string,
  textOptions: TextOptions,
) => {
  applyTextOptionsToContext(ctx, textOptions)
  const lineHeight = measureTextLineHeight(ctx)

  ctx.fillText(valueText, textRect.x, textRect.y + lineHeight)
}

const drawXValueHeaderDividerLine = (ctx: CanvasRenderingContext2D, dividerRect: Rect, lineOptions: LineOptions) => {
  const dividerPath = new Path2D()
  const y = dividerRect.y + dividerRect.height / 2
  dividerPath.moveTo(dividerRect.x, y)
  dividerPath.lineTo(dividerRect.x + dividerRect.width, y)

  applyLineOptionsToContext(ctx, lineOptions)
  ctx.stroke(dividerPath)
}

const drawSeriesLabelValueText = (
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  labelText: string,
  valueText: string,
  labelTextWidth: number,
  props: Options,
) => {
  // Calculate y coordinate, vertically centered in rect
  const textHeight = measureTextLineHeight(ctx, labelText)
  const differenceInHeight = Math.max(0, rect.height - textHeight)
  const y = rect.y + rect.height - differenceInHeight / 2

  ctx.fillStyle = props?.tooltipOptions?.textColor ?? DEFAULT_TEXT_COLOR
  ctx.font = createTextStyleInternal(props, false) // Series key text is not bold
  ctx.fillText(labelText, rect.x, y)
  ctx.font = createTextStyleInternal(props, true) // value is bold
  ctx.fillText(valueText, rect.x + labelTextWidth, y)
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
  // Measure maximum line height
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

  const boxPaddingX = props?.tooltipOptions?.boxPaddingX ?? DEFAULT_BOX_PADDING_X
  const boxPaddingY = props?.tooltipOptions?.boxPaddingY ?? DEFAULT_BOX_PADDING_Y

  const shouldShowXValueTitle = getShouldShowXValueTitle(props)
  const shouldShowXValueTitleDivider = getShouldShowXValueHeaderDivider(props)
  const xValueHeaderDividerHeight = shouldShowXValueTitleDivider ? (2 * boxPaddingY) + getShouldShowXValueHeaderDividerLineWidth(props) : 0

  // Calculate width of each series line component
  const labelTextWidths = mapDict(labelTexts, (_, text) => measureTextWidth(ctx, text))
  const valueTextWidths = mapDict(valueTexts, (_, value) => measureTextWidth(ctx, value))
  // Calculate width of each series line
  const seriesTextLineWidths = combineDicts(labelTextWidths, valueTextWidths, (_, w1, w2) => w1 + w2)
  const maximumSeriesTextLineWidth = findEntryOfMaxValue(seriesTextLineWidths).value

  const titleRow: InputRow = {
    margin: { bottom: 0 },
    columnJustification: ColumnJustification.CENTER,
    height: lineHeight,
    width: 100,
    widthUnits: SizeUnit.PERCENT,
    columns: [{
      height: 100,
      heightUnits: SizeUnit.PERCENT,
      width: measureTextWidth(ctx, xValueHeaderText),
      render: rect => {
        drawXValueHeaderText(ctx, rect, xValueHeaderText, props.tooltipOptions?.xValueLabelTextOptions)
      },
    }],
  }

  const dividerRow: InputRow = {
    width: 100, // Full width of the box
    widthUnits: SizeUnit.PERCENT,
    height: xValueHeaderDividerHeight,
    render: rect => {
      drawXValueHeaderDividerLine(ctx, rect, props.tooltipOptions?.xValueLabelDividerOptions)
    },
  }

  const seriesKeys = Object.keys(highlightedDatums)

  const seriesPreviewColumn: InputColumn = {
    width: seriesPreviewWidth,
    margin: { right: PREVIEW_RIGHT_MARGIN },
    rowTemplate: {
      height: lineHeight,
      render: (rect, i) => {
        const seriesKey = seriesKeys[i]

        drawSeriesPreview(
          ctx,
          shouldDrawMarkerPreviews[seriesKey],
          shouldDrawConnectingLinePreviews[seriesKey],
          rect.x,
          rect.y + rect.height / 2,
          rect.width,
          lineHeight,
          props,
          seriesKey,
        )
      },
    },
    numRows: numSeries,
  }

  const seriesLabelValueColumn: InputColumn = {
    width: maximumSeriesTextLineWidth,
    rowTemplate: {
      height: lineHeight,
      render: (rect, i) => {
        const seriesKey = seriesKeys[i]
        drawSeriesLabelValueText(ctx, rect, labelTexts[seriesKey], valueTexts[seriesKey], labelTextWidths[seriesKey], props)
      },
    },
    numRows: numSeries,
  }

  const inputColumn: InputColumn = {
    render: rect => {
      drawBox(ctx, rect, props)
    },
    padding: { left: boxPaddingX, right: boxPaddingX, top: boxPaddingY, bottom: boxPaddingY },
    rows: [
      shouldShowXValueTitle ? titleRow : null,
      shouldShowXValueTitleDivider ? dividerRow : null,
      {
        columns: [
          shouldDrawAtleastOnePreview ? seriesPreviewColumn : null,
          seriesLabelValueColumn,
        ],
      },
    ],
  }

  const column = sizeInputColumn(inputColumn)

  const { boundingWidth, boundingHeight } = column

  const tooltipBoxPosition: Point2D = {
    x: determineTooltipBoxXCoord(props.widthPx, boundingWidth, nearestDatumOfAllSeries.fpX),
    /* Position vertically centered relative to cursor position,
     * ensuring that it doesn't overflow at the top (negative y position)
     */
    y: Math.max(0, cursorPoint.y - (boundingHeight / 2)),
  }

  renderColumn({ x: tooltipBoxPosition.x, y: tooltipBoxPosition.y, width: boundingWidth, height: boundingHeight }, column, 0)
}

export default draw
