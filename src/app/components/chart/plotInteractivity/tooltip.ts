import { Point2D, Rect, Axis2D } from '../../../common/types/geometry'
import Options from '../types/Options'
import { mapDict, findEntryOfMaxValue, combineDicts, anyDict } from '../../../common/helpers/dict'
import { measureTextWidth,
  measureTextLineHeight,
  createTextStyle,
  createRoundedRect } from '../../../common/helpers/canvas'
import ProcessedDatum from '../types/ProcessedDatum'
import { getSize as getMarkerSize, drawStandardMarker, getShouldShowMarkers } from '../data/marker'
import { drawConnectingLine, getShouldShowConnectingLine } from '../data/connectingLine'
import { formatNumber } from '../plotBase/components/axisMarkerLabels'
import { TextOptions, LineOptions } from '../../../common/types/canvas'
import { parseInputColumn } from '../../../common/rectPositioningEngine/elementParsing'
import { renderColumn } from '../../../common/rectPositioningEngine/rendering'
import { ColumnJustification, InputColumn, InputRow } from '../../../common/rectPositioningEngine/types'
import { CanvasDrawer } from '../../../common/drawer/types'

const PREVIEW_RIGHT_MARGIN = 10
const DEFAULT_BOX_PADDING_X = 6
const DEFAULT_BOX_PADDING_Y = 6
const DEFAULT_TEXT_OPTIONS: TextOptions = {
  color: 'black',
  fontFamily: 'Helvetica',
  fontSize: 12,
}
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
  props?.tooltipOptions?.fontFamily ?? DEFAULT_TEXT_OPTIONS.fontFamily,
  props?.tooltipOptions?.fontSize ?? DEFAULT_TEXT_OPTIONS.fontSize,
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
  drawer: CanvasDrawer,
  shouldDrawMarkerPreview: boolean,
  shouldDrawConnectingLinePreview: boolean,
  rect: Rect,
  props: Options,
  seriesKey: string,
) => {
  const ctx = drawer.getRenderingContext()
  const y = rect.y + rect.height / 2 // Vertically centered
  if (shouldDrawMarkerPreview) {
    const markerSize = Math.min(rect.height, getMarkerSize(props, seriesKey)) // limit height to rect height
    drawStandardMarker(drawer, rect.x + rect.width / 2, y, props, seriesKey, markerSize)
  }
  if (shouldDrawConnectingLinePreview)
    drawConnectingLine(ctx, { x: rect.x, y }, { x: rect.x + rect.width, y }, props, seriesKey)
}

const drawXValueHeaderDividerLine = (drawer: CanvasDrawer, dividerRect: Rect, lineOptions: LineOptions) => {
  const y = dividerRect.y + dividerRect.height / 2
  drawer.line([{ x: dividerRect.x, y }, { x: dividerRect.x + dividerRect.width, y }], lineOptions)
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

  ctx.fillStyle = props?.tooltipOptions?.textColor ?? DEFAULT_TEXT_OPTIONS.color
  ctx.font = createTextStyleInternal(props, false) // Series key text is not bold
  ctx.fillText(labelText, rect.x, y)
  ctx.font = createTextStyleInternal(props, true) // value is bold
  ctx.fillText(valueText, rect.x + labelTextWidth, y)
}

const createTitleRow = (
  drawer: CanvasDrawer,
  text: string,
  props: Options,
): InputRow => {
  // Apply text options now for accurate width and height measurements
  drawer.applyTextOptions(props.tooltipOptions?.xValueLabelTextOptions, DEFAULT_TEXT_OPTIONS)
  return {
    margin: { bottom: 0 },
    columnJustification: ColumnJustification.CENTER,
    height: drawer.measureTextHeight(),
    width: '100%',
    columns: [{
      height: '100%',
      width: drawer.measureTextWidth(text),
      render: rect => drawer.text(text, rect, null, props.tooltipOptions?.xValueLabelTextOptions, DEFAULT_TEXT_OPTIONS),
    }],
  }
}

const createTitleDividerRow = (
  drawer: CanvasDrawer,
  height: number,
  props: Options,
): InputRow => ({
  width: '100%', // Full width of the box
  height,
  render: rect => {
    drawXValueHeaderDividerLine(drawer, rect, props.tooltipOptions?.xValueLabelDividerOptions)
  },
})

const createSeriesPreviewColumn = (
  drawer: CanvasDrawer,
  width: number,
  height: number,
  shouldDrawMarkerPreviews: { [seriesKey: string]: boolean },
  shouldDrawConnectingLinePreviews: { [seriesKey: string]: boolean },
  props: Options,
  seriesKeys: string[],
): InputColumn => ({
  width,
  margin: { right: PREVIEW_RIGHT_MARGIN },
  rowTemplate: {
    height,
    render: (rect, i) => {
      const seriesKey = seriesKeys[i]
      drawSeriesPreview(
        drawer,
        shouldDrawMarkerPreviews[seriesKey],
        shouldDrawConnectingLinePreviews[seriesKey],
        rect,
        props,
        seriesKey,
      )
    },
  },
  numRows: seriesKeys.length,
})

const createSeriesLabelValueColumn = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  labelTexts: { [seriesKey: string]: string },
  valueTexts: { [seriesKey: string]: string },
  labelTextWidths: { [seriesKey: string]: number },
  props: Options,
  seriesKeys: string[],
): InputColumn => ({
  width,
  rowTemplate: {
    height,
    render: (rect, i) => {
      const seriesKey = seriesKeys[i]
      drawSeriesLabelValueText(ctx, rect, labelTexts[seriesKey], valueTexts[seriesKey], labelTextWidths[seriesKey], props)
    },
  },
  numRows: seriesKeys.length,
})

export const draw = (
  drawer: CanvasDrawer,
  cursorPoint: Point2D,
  highlightedDatums: { [seriesKey: string]: ProcessedDatum },
  nearestDatumOfAllSeries: ProcessedDatum,
  props: Options,
) => {
  const ctx = drawer.getRenderingContext()
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

  const inputColumn: InputColumn = {
    render: rect => {
      drawBox(ctx, rect, props)
    },
    padding: { left: boxPaddingX, right: boxPaddingX, top: boxPaddingY, bottom: boxPaddingY },
    rows: [
      // Title row
      shouldShowXValueTitle ? createTitleRow(drawer, xValueHeaderText, props) : null,
      // divider row
      shouldShowXValueTitleDivider ? createTitleDividerRow(drawer, xValueHeaderDividerHeight, props) : null,
      {
        columns: [
          // Series preview column (marker and connecting line)
          shouldDrawAtleastOnePreview ? createSeriesPreviewColumn(
            drawer,
            seriesPreviewWidth,
            lineHeight,
            shouldDrawMarkerPreviews,
            shouldDrawConnectingLinePreviews,
            props,
            Object.keys(highlightedDatums),
          ) : null,
          // Series label and value column
          createSeriesLabelValueColumn(
            ctx,
            maximumSeriesTextLineWidth,
            lineHeight,
            labelTexts,
            valueTexts,
            labelTextWidths,
            props,
            Object.keys(highlightedDatums),
          ),
        ],
      },
    ],
  }

  const column = parseInputColumn(inputColumn)

  const { boundingWidth, boundingHeight } = column

  const tooltipBoxPosition: Point2D = {
    x: determineTooltipBoxXCoord(props.width, boundingWidth, nearestDatumOfAllSeries.fpX),
    /* Position vertically centered relative to cursor position,
     * ensuring that it doesn't overflow at the top (negative y position)
     */
    y: Math.max(0, cursorPoint.y - (boundingHeight / 2)),
  }

  renderColumn({ x: tooltipBoxPosition.x, y: tooltipBoxPosition.y, width: boundingWidth, height: boundingHeight }, column, 0)
}

export default draw
