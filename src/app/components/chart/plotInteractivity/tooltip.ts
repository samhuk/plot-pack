import { Point2D, Rect } from '../../../common/types/geometry'
import Options from '../types/Options'
import { mapDict, combineDicts, anyDict } from '../../../common/helpers/dict'
import ProcessedDatum from '../types/ProcessedDatum'
import { getSize as getMarkerSize, drawStandardMarker, getShouldShowMarkers } from '../data/marker'
import { drawConnectingLine, getShouldShowConnectingLine } from '../data/connectingLine'
import { formatNumberForAxisOptions } from '../plotBase/components/axisMarkerLabels'
import { parseInputColumn } from '../../../common/rectPositioningEngine/elementParsing'
import { renderColumn } from '../../../common/rectPositioningEngine/rendering'
import { ColumnJustification, InputColumn, InputRow, RowJustification } from '../../../common/rectPositioningEngine/types'
import { CanvasDrawer, RoundedRectOptions } from '../../../common/drawer/types'
import TooltipOptions from '../types/TooltipOptions'
import { deepMergeObjects } from '../../../common/helpers/object'

const DEFAULT_OPTIONS: TooltipOptions = {
  positioningOptions: { xDistanceFromMarker: 10 },
  xValueOptions: {
    color: 'black',
    fontFamily: 'Helvetica',
    fontSize: 14,
    margin: 0,
    textHorizontalAlign: ColumnJustification.CENTER,
    bold: true,
  },
  xValueDividerOptions: {
    lineWidth: 1,
    color: 'grey',
    dashPattern: [],
    margin: { top: 5, bottom: 5 },
  },
  yDataRowOptions: { verticalSpacing: 5 },
  ySeriesPreviewOptions: {
    width: 20,
    marginRight: 10,
  },
  yLabelOptions: {
    color: 'black',
    fontFamily: 'Helvetica',
    fontSize: 12,
    bold: true,
    marginRight: 7,
  },
  yValueOptions: {
    color: 'black',
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  rectOptions: {
    borderColor: '#ccc',
    borderDashPattern: [],
    borderLineWidth: 1,
    borderRadii: 3,
    fill: true,
    fillOptions: {
      color: '#f0f0f0',
      opacity: 1,
    },
    stroke: true,
    shadow: true,
    shadowOptions: {
      offsetX: 3,
      offsetY: 3,
      blurDistance: 5,
      opacity: 0.8,
      color: 'black',
    },
    padding: 5,
  },
  visibilityOptions: {
    showYSeriesPreviewColumn: true,
    showXValue: false,
    showXValueDivider: false,
  },
}

export const getShouldDrawTooltip = (props: Options) => (
  props.visibilityOptions?.showTooltip ?? true
)

const getShouldShowMarkerPreview = (props: Options, seriesKey: string) => (
  (props?.tooltipOptions?.visibilityOptions?.showYSeriesPreviewColumn ?? DEFAULT_OPTIONS.visibilityOptions.showYSeriesPreviewColumn)
  && getShouldShowMarkers(props, seriesKey)
)

const getShouldShowConnectingLinePreview = (props: Options, seriesKey: string) => (
  (props?.tooltipOptions?.visibilityOptions?.showYSeriesPreviewColumn ?? DEFAULT_OPTIONS.visibilityOptions.showYSeriesPreviewColumn)
  && getShouldShowConnectingLine(props, seriesKey)
)

const getRectShadowVector = (rectOptions: RoundedRectOptions) => {
  if (!(rectOptions?.shadow ?? DEFAULT_OPTIONS.rectOptions.shadow))
    return { x: 0, y: 0 }

  const mergedShadowOptions = deepMergeObjects(DEFAULT_OPTIONS.rectOptions.shadowOptions, rectOptions?.shadowOptions)
  return {
    x: mergedShadowOptions.offsetX + mergedShadowOptions.blurDistance,
    y: mergedShadowOptions.offsetY + mergedShadowOptions.blurDistance,
  }
}

const determineTooltipBoxXCoord = (canvasWidth: number, boxWidth: number, x: number, tooltipOptions: TooltipOptions) => {
  const xDistanceFromMarker = tooltipOptions?.positioningOptions?.xDistanceFromMarker ?? DEFAULT_OPTIONS.positioningOptions.xDistanceFromMarker
  // Measure the distance the shadow contributes to the sides of the box
  const shadowVector = getRectShadowVector(tooltipOptions?.rectOptions)
  const prospectiveRHSRectX = x + xDistanceFromMarker
  const prospectiveLHSRectX = x - xDistanceFromMarker - boxWidth
  // Measure rect RHS overflow
  const rhsOverflow = Math.max(0, prospectiveRHSRectX + boxWidth + Math.max(0, shadowVector.x) - canvasWidth)
  // Measure rect LHS overflow
  const lhsOverflow = Math.min(0, prospectiveLHSRectX + Math.min(0, shadowVector.x))
  if (rhsOverflow !== 0 && lhsOverflow !== 0) // If RHS and LHS overrun, center
    return x - (boxWidth / 2)
  if (rhsOverflow === 0) // Else if there is no RHS overflow, RHS
    return prospectiveRHSRectX
  if (lhsOverflow === 0) // Else if there is no LHS overflow, LHS
    return prospectiveLHSRectX
  return prospectiveRHSRectX
}

const drawYSeriesPreview = (
  drawer: CanvasDrawer,
  shouldDrawMarkerPreview: boolean,
  shouldDrawConnectingLinePreview: boolean,
  rect: Rect,
  props: Options,
  seriesKey: string,
) => {
  const y = rect.y + rect.height / 2 // Vertically centered
  if (shouldDrawMarkerPreview) {
    const markerSize = Math.min(rect.height, getMarkerSize(props, seriesKey)) // limit height to rect height
    drawStandardMarker(drawer, rect.x + rect.width / 2, y, props, seriesKey, markerSize)
  }
  if (shouldDrawConnectingLinePreview)
    drawConnectingLine(drawer, { x: rect.x, y }, { x: rect.x + rect.width, y }, props, seriesKey)
}

const createXValueRow = (
  drawer: CanvasDrawer,
  props: Options,
  nearestDatumOfAllSeries: ProcessedDatum,
): InputRow => {
  if (!(props.tooltipOptions?.visibilityOptions?.showXValue ?? DEFAULT_OPTIONS.visibilityOptions.showXValue))
    return null

  const text = formatNumberForAxisOptions(nearestDatumOfAllSeries.fvX, props.axesOptions?.x)
  // Apply text options now for accurate width and height measurements
  drawer.applyTextOptions(props.tooltipOptions?.xValueOptions, DEFAULT_OPTIONS.xValueOptions)
  return {
    margin: props.tooltipOptions?.xValueOptions?.margin ?? DEFAULT_OPTIONS.xValueOptions.margin,
    columnJustification: props.tooltipOptions?.xValueOptions?.textHorizontalAlign ?? DEFAULT_OPTIONS.xValueOptions.textHorizontalAlign,
    width: '100%',
    columns: [{
      height: drawer.measureTextHeight(text),
      width: drawer.measureTextWidth(text),
      render: rect => drawer.text(text, rect, null, props.tooltipOptions?.xValueOptions, DEFAULT_OPTIONS.xValueOptions),
    }],
  }
}

const createXValueDividerRow = (
  drawer: CanvasDrawer,
  tooltipOptions: TooltipOptions,
): InputRow => {
  if (!(tooltipOptions?.visibilityOptions?.showXValueDivider ?? DEFAULT_OPTIONS.visibilityOptions.showXValueDivider))
    return null

  return {
    width: '100%',
    height: tooltipOptions?.xValueDividerOptions?.lineWidth ?? DEFAULT_OPTIONS.xValueDividerOptions.lineWidth,
    margin: tooltipOptions?.xValueDividerOptions?.margin ?? DEFAULT_OPTIONS.xValueDividerOptions.margin,
    render: rect => {
      const y = rect.y + rect.height / 2
      drawer.line([{ x: rect.x, y }, { x: rect.x + rect.width, y }], tooltipOptions?.xValueDividerOptions, DEFAULT_OPTIONS.xValueDividerOptions)
    },
  }
}

const createYSeriesPreviewColumn = (
  drawer: CanvasDrawer,
  props: Options,
  seriesKeys: string[],
  yDataRowMaxTextHeights: { [seriesKey: string]: number },
): InputColumn => {
  // Get "should draw X" values ahead of time to not have to recalculate them all
  const shouldDrawMarkerPreviews = mapDict(yDataRowMaxTextHeights, seriesKey => getShouldShowMarkerPreview(props, seriesKey))
  const shouldDrawConnectingLinePreviews = mapDict(yDataRowMaxTextHeights, seriesKey => getShouldShowConnectingLinePreview(props, seriesKey))

  // Determine if we have to draw at least one preview. If not, then return null column
  const shouldDrawAtleastOneYSeriesPreview = anyDict(
    combineDicts(shouldDrawMarkerPreviews, shouldDrawConnectingLinePreviews, (_, should1, should2) => should1 || should2),
    (_, shouldDrawSomeKindOfPreview) => shouldDrawSomeKindOfPreview,
  )

  if (!shouldDrawAtleastOneYSeriesPreview)
    return null

  const render = (rect: Rect, seriesKey: string) => {
    const shouldDrawMarker = shouldDrawMarkerPreviews[seriesKey]
    const shouldDrawConnectingLine = shouldDrawConnectingLinePreviews[seriesKey]
    drawYSeriesPreview(drawer, shouldDrawMarker, shouldDrawConnectingLine, rect, props, seriesKey)
  }

  const verticalSpacing = props.tooltipOptions?.yDataRowOptions?.verticalSpacing ?? DEFAULT_OPTIONS.yDataRowOptions.verticalSpacing

  return {
    rows: seriesKeys.map((seriesKey, i) => ({
      margin: { bottom: i !== seriesKeys.length - 1 ? verticalSpacing : 0 },
      columns: [{
        height: yDataRowMaxTextHeights[seriesKey],
        width: props.tooltipOptions?.ySeriesPreviewOptions?.width ?? DEFAULT_OPTIONS.ySeriesPreviewOptions.width,
        margin: {
          left: props.tooltipOptions?.ySeriesPreviewOptions?.marginLeft ?? DEFAULT_OPTIONS.ySeriesPreviewOptions.marginLeft,
          right: props.tooltipOptions?.ySeriesPreviewOptions?.marginRight ?? DEFAULT_OPTIONS.ySeriesPreviewOptions.marginRight,
        },
        render: rect => render(rect, seriesKeys[i]),
      }],
    })),
  }
}

const createYLabelColumn = (
  drawer: CanvasDrawer,
  labelTexts: { [seriesKey: string]: string },
  options: TooltipOptions,
  seriesKeys: string[],
  yDataRowMaxTextHeights: { [seriesKey: string]: number },
): InputColumn => {
  drawer.applyTextOptions(options?.yLabelOptions, DEFAULT_OPTIONS.yLabelOptions)
  const render = (rect: Rect, seriesKey: string) => (
    drawer.text(labelTexts[seriesKey], rect, null, options?.yLabelOptions, DEFAULT_OPTIONS.yLabelOptions)
  )
  const verticalSpacing = options?.yDataRowOptions?.verticalSpacing ?? DEFAULT_OPTIONS.yDataRowOptions.verticalSpacing
  return {
    rows: seriesKeys.map((seriesKey, i) => ({
      margin: { bottom: i !== seriesKeys.length - 1 ? verticalSpacing : 0 },
      columns: [{
        height: yDataRowMaxTextHeights[seriesKey],
        width: drawer.measureTextWidth(labelTexts[seriesKey]),
        margin: {
          left: options?.yLabelOptions?.marginLeft ?? DEFAULT_OPTIONS.yLabelOptions.marginLeft,
          right: options?.yLabelOptions?.marginRight ?? DEFAULT_OPTIONS.yLabelOptions.marginRight,
        },
        rowJustification: RowJustification.CENTER,
        rows: [{
          height: drawer.measureTextHeight(labelTexts[seriesKey]),
          render: rect => render(rect, seriesKeys[i]),
        }],
      }],
    })),
  }
}

const createYValueColumn = (
  drawer: CanvasDrawer,
  valueTexts: { [seriesKey: string]: string },
  options: TooltipOptions,
  seriesKeys: string[],
  yDataRowMaxTextHeights: { [seriesKey: string]: number },
): InputColumn => {
  drawer.applyTextOptions(options?.yValueOptions, DEFAULT_OPTIONS.yValueOptions)
  const render = (rect: Rect, seriesKey: string) => (
    drawer.text(valueTexts[seriesKey], rect, null, options?.yValueOptions, DEFAULT_OPTIONS.yValueOptions)
  )
  const verticalSpacing = options?.yDataRowOptions?.verticalSpacing ?? DEFAULT_OPTIONS.yDataRowOptions.verticalSpacing
  return {
    rows: seriesKeys.map((seriesKey, i) => ({
      margin: { bottom: i !== seriesKeys.length - 1 ? verticalSpacing : 0 },
      columns: [{
        height: yDataRowMaxTextHeights[seriesKey],
        width: drawer.measureTextWidth(valueTexts[seriesKey]),
        margin: {
          left: options?.yValueOptions?.marginLeft ?? DEFAULT_OPTIONS.yValueOptions.marginLeft,
          right: options?.yValueOptions?.marginRight ?? DEFAULT_OPTIONS.yValueOptions.marginRight,
        },
        rowJustification: RowJustification.CENTER,
        rows: [{
          height: drawer.measureTextHeight(valueTexts[seriesKey]),
          render: rect => render(rect, seriesKeys[i]),
        }],
      }],
    })),
  }
}

export const draw = (
  drawer: CanvasDrawer,
  cursorPoint: Point2D,
  highlightedDatums: { [seriesKey: string]: ProcessedDatum },
  nearestDatumOfAllSeries: ProcessedDatum,
  props: Options,
) => {
  if (highlightedDatums == null)
    return

  const seriesKeys = Object.keys(highlightedDatums)
  const numSeries = seriesKeys.length
  if (numSeries === 0)
    return

  // Create series key label texts and widths
  const yLabelTexts = mapDict(highlightedDatums, seriesKey => `${seriesKey}:`)
  // Create value texts and widths
  const yValueTexts = mapDict(highlightedDatums, (_, { fvY }) => formatNumberForAxisOptions(fvY, props.axesOptions?.y))

  drawer.applyTextOptions(props.tooltipOptions?.yLabelOptions, DEFAULT_OPTIONS.yLabelOptions)
  const yLabelTextHeights = mapDict(yLabelTexts, seriesKey => drawer.measureTextHeight(yLabelTexts[seriesKey]))
  drawer.applyTextOptions(props.tooltipOptions?.yValueOptions, DEFAULT_OPTIONS.yValueOptions)
  const yValueTextHeights = mapDict(yValueTexts, seriesKey => drawer.measureTextHeight(yValueTexts[seriesKey]))
  const yDataRowMaxTextHeights = mapDict(yLabelTexts, seriesKey => Math.max(yLabelTextHeights[seriesKey], yValueTextHeights[seriesKey]))

  const inputColumn: InputColumn = {
    render: rect => drawer.roundedRect(rect, props.tooltipOptions?.rectOptions, DEFAULT_OPTIONS.rectOptions),
    padding: props.tooltipOptions?.rectOptions?.padding ?? DEFAULT_OPTIONS.rectOptions.padding,
    rows: [
      // Title row
      createXValueRow(drawer, props, nearestDatumOfAllSeries),
      // divider row
      createXValueDividerRow(drawer, props.tooltipOptions),
      // Y data section (table)
      {
        columns: [
          // Y series preview column (marker and connecting line)
          createYSeriesPreviewColumn(drawer, props, seriesKeys, yDataRowMaxTextHeights),
          // Y label (i.e. series key/"name") column
          createYLabelColumn(drawer, yLabelTexts, props.tooltipOptions, seriesKeys, yDataRowMaxTextHeights),
          // Y value column
          createYValueColumn(drawer, yValueTexts, props.tooltipOptions, seriesKeys, yDataRowMaxTextHeights),
        ],
      },
    ],
  }

  const column = parseInputColumn(inputColumn)

  const { boundingWidth, boundingHeight } = column

  const tooltipBoxPosition: Point2D = {
    x: determineTooltipBoxXCoord(props.width, boundingWidth, nearestDatumOfAllSeries.fpX, props.tooltipOptions),
    /* Position vertically centered relative to cursor position,
     * ensuring that it doesn't overflow at the top (negative y position)
     */
    y: Math.max(0, cursorPoint.y - (boundingHeight / 2)),
  }

  renderColumn({ x: tooltipBoxPosition.x, y: tooltipBoxPosition.y, width: boundingWidth, height: boundingHeight }, column, 0)
}

export default draw
