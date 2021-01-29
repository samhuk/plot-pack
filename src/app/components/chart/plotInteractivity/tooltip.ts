import { Axis2D, HoriztonalAlign, Point2D, Rect, RectDimensions, VerticalAlign } from '../../../common/types/geometry'
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
import TooltipOptions, { TooltipReferencePosition } from '../types/TooltipOptions'
import { deepMergeObjects } from '../../../common/helpers/object'

const DEFAULT_OPTIONS: TooltipOptions = {
  positioningOptions: {
    x: {
      absoluteDistanceFromMarker: 10,
      allowFlexiblePositioning: false,
      preferredJustification: HoriztonalAlign.RIGHT,
      referencePosition: TooltipReferencePosition.MARKER,
    },
    y: {
      absoluteDistanceFromMarker: 0,
      allowFlexiblePositioning: true,
      preferredJustification: VerticalAlign.CENTER,
      referencePosition: TooltipReferencePosition.CURSOR,
    },
  },
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

  const mergedShadowOptions = deepMergeObjects(rectOptions?.shadowOptions, DEFAULT_OPTIONS.rectOptions.shadowOptions)
  return {
    x: mergedShadowOptions.offsetX + mergedShadowOptions.blurDistance,
    y: mergedShadowOptions.offsetY + mergedShadowOptions.blurDistance,
  }
}

const determineProspectivePosition = (
  referencePosition: number,
  rectSize: number,
  absoluteDistanceFromPosition: number,
  justification: HoriztonalAlign | VerticalAlign,
) => {
  // Centered
  if (justification === HoriztonalAlign.CENTER || justification === VerticalAlign.CENTER)
    return referencePosition - rectSize / 2
  // Negative direction
  if (justification === HoriztonalAlign.LEFT || justification === VerticalAlign.TOP)
    return referencePosition - rectSize - absoluteDistanceFromPosition
  // Positive direction
  if (justification === HoriztonalAlign.RIGHT || justification === VerticalAlign.BOTTOM)
    return referencePosition + absoluteDistanceFromPosition

  return referencePosition - rectSize / 2 // Default to centered
}

const measureRectPositionOverflows = (
  position: number,
  rectSize: number,
  canvasSize: number,
  shadowVector: number,
) => ({
  negative: -Math.min(0, position + Math.min(0, shadowVector)),
  positive: Math.max(0, position + rectSize + Math.max(0, shadowVector) - canvasSize),
})

type TooltipAxisPositioningOptionsBase = {
  refPos: number,
  rectSize: number,
  canvasSize: number,
  absDistFromPosition: number,
  shadowVector: number,
  preferredJustification: HoriztonalAlign | VerticalAlign,
}

const determinePositionForNonFlexiblePositioning = (options: TooltipAxisPositioningOptionsBase, axis: Axis2D) => {
  const isXAxis = axis === Axis2D.X
  // Form a list of justifications, in the order of which they will be attempted
  const justificationList: (HoriztonalAlign | VerticalAlign)[] = isXAxis
    ? [HoriztonalAlign.RIGHT, HoriztonalAlign.LEFT, HoriztonalAlign.CENTER]
    : [VerticalAlign.BOTTOM, VerticalAlign.TOP, VerticalAlign.CENTER]
  const justificationOrdering = [options.preferredJustification].concat(justificationList.filter(j => j !== options.preferredJustification))
  for (let i = 0; i < justificationOrdering.length; i += 1) {
    // Determine the prospective position
    const prospectivePosition = determineProspectivePosition(options.refPos, options.rectSize, options.absDistFromPosition, justificationOrdering[i])
    // Measure the negative and positive overflow of the prospective position over the canvas
    const overflows = measureRectPositionOverflows(prospectivePosition, options.rectSize, options.canvasSize, options.shadowVector)
    // If there is no overflow in either direction, then can return the prospective position straight away
    if (overflows.negative === 0 && overflows.positive === 0)
      return prospectivePosition
  }

  const defaultJustificationifAllElseFails = isXAxis ? HoriztonalAlign.CENTER : VerticalAlign.CENTER
  return determineProspectivePosition(options.refPos, options.rectSize, options.absDistFromPosition, defaultJustificationifAllElseFails)
}

const determinePositionForFlexiblePositioning = (options: TooltipAxisPositioningOptionsBase) => {
  // Determine the prospective position
  const prefdJustf = options.preferredJustification // Literally just because of line length limits...
  const prospectivePosition = determineProspectivePosition(options.refPos, options.rectSize, options.absDistFromPosition, prefdJustf)
  // Measure the negative and positive overflow of the prospective position over the canvas
  const overflows = measureRectPositionOverflows(prospectivePosition, options.rectSize, options.canvasSize, options.shadowVector)
  /* Determine the offset vector required to correct the position to ensure it's as much
   * inside the canvas as possible
   */
  const offsetVector = (
    (overflows.negative !== 0 ? overflows.negative : -overflows.positive)
    - (overflows.positive !== 0 ? overflows.positive : -overflows.negative)
  ) / 2
  return prospectivePosition + offsetVector
}

const determineRectPosition = (
  datumScreenFocusPoint: Point2D,
  cursorScreenPosition: Point2D,
  rectDimensions: RectDimensions,
  canvasDimensions: RectDimensions,
  tooltipOptions: TooltipOptions,
): Point2D => {
  const positioningOptions = deepMergeObjects(tooltipOptions?.positioningOptions, DEFAULT_OPTIONS.positioningOptions)
  // Reference position
  const refPos = {
    x: positioningOptions.x.referencePosition === TooltipReferencePosition.MARKER ? datumScreenFocusPoint.x : cursorScreenPosition.x,
    y: positioningOptions.y.referencePosition === TooltipReferencePosition.MARKER ? datumScreenFocusPoint.y : cursorScreenPosition.y,
  }
  const shadowVector = getRectShadowVector(tooltipOptions?.rectOptions)

  // Declare options for determining the position. We are doing this because of line-length limits and for readability
  const tooltipAxesPositioningOptionsBase: { [axis in Axis2D]: TooltipAxisPositioningOptionsBase } = {
    x: {
      refPos: refPos.x,
      rectSize: rectDimensions.width,
      canvasSize: canvasDimensions.width,
      absDistFromPosition: positioningOptions.x.absoluteDistanceFromMarker,
      shadowVector: shadowVector.x,
      preferredJustification: positioningOptions.x.preferredJustification,
    },
    y: {
      refPos: refPos.y,
      rectSize: rectDimensions.height,
      canvasSize: canvasDimensions.height,
      absDistFromPosition: positioningOptions.y.absoluteDistanceFromMarker,
      shadowVector: shadowVector.y,
      preferredJustification: positioningOptions.y.preferredJustification,
    },
  }

  return {
    x: positioningOptions.x.allowFlexiblePositioning
      ? determinePositionForFlexiblePositioning(tooltipAxesPositioningOptionsBase.x)
      : determinePositionForNonFlexiblePositioning(tooltipAxesPositioningOptionsBase.x, Axis2D.X),
    y: positioningOptions.y.allowFlexiblePositioning
      ? determinePositionForFlexiblePositioning(tooltipAxesPositioningOptionsBase.y)
      : determinePositionForNonFlexiblePositioning(tooltipAxesPositioningOptionsBase.y, Axis2D.Y),
  }
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
  cursorPosition: Point2D,
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

  const rectPosition = determineRectPosition(
    { x: nearestDatumOfAllSeries.fpX, y: nearestDatumOfAllSeries.fpY },
    cursorPosition,
    { height: boundingHeight, width: boundingWidth },
    { height: props.height, width: props.width },
    props.tooltipOptions,
  )

  renderColumn({ x: rectPosition.x, y: rectPosition.y, width: boundingWidth, height: boundingHeight }, column, 0)
}

export default draw
