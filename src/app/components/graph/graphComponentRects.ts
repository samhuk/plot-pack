import Options from './types/Options'
import { getTitle, applyTitleTextOptionsToDrawer, getTitleMargin } from './title'
import { CanvasDrawer } from '../../common/drawer/types'
import { InputRow, SizeUnit, ColumnJustification, InputColumn, RowJustification } from '../../common/canvasFlex/types'
import { measureTextLineHeight, measureTextWidth } from '../../common/helpers/canvas'
import GraphComponents from './types/GraphComponents'
import { getAxisLabelText, applyAxisLabelTextOptionsToDrawer, getAxisLabelMargin } from './axisLabels'
import { Axis2D } from '../../common/types/geometry'
import { DEFAULT_NAVIGATOR_HEIGHT_PX } from './navigator'
import GraphComponentRects from './types/GraphComponentRects'
import { renderInputColumn } from '../../common/canvasFlex/rendering'

const DEFAULT_GRAPH_MARGIN = 10

const createTitleRow = (drawer: CanvasDrawer, props: Options): InputRow => {
  const titleText = getTitle(props)
  if (titleText == null)
    return null

  applyTitleTextOptionsToDrawer(drawer, props)
  const titleTextHeight = measureTextLineHeight(drawer.getRenderingContext())
  const titleTextWidth = measureTextWidth(drawer.getRenderingContext(), titleText)
  return {
    height: titleTextHeight,
    heightUnits: SizeUnit.PX,
    width: 100,
    widthUnits: SizeUnit.PERCENT,
    margin: getTitleMargin(props),
    columnJustification: ColumnJustification.CENTER,
    columns: [{
      id: GraphComponents.TITLE_BAR,
      height: 100,
      heightUnits: SizeUnit.PERCENT,
      width: titleTextWidth,
      widthUnits: SizeUnit.PX,
    }],
  }
}

const createYAxisLabelColumn = (drawer: CanvasDrawer, props: Options): InputColumn => {
  const labelText = getAxisLabelText(props, Axis2D.Y)
  if (labelText == null)
    return null

  applyAxisLabelTextOptionsToDrawer(drawer, Axis2D.Y, props)
  const labelTextHeight = measureTextLineHeight(drawer.getRenderingContext())
  const labelTextWidth = measureTextWidth(drawer.getRenderingContext(), labelText)

  return {
    width: labelTextHeight,
    widthUnits: SizeUnit.PX,
    height: 100,
    heightUnits: SizeUnit.PERCENT,
    margin: getAxisLabelMargin(props, Axis2D.Y),
    rowJustification: RowJustification.CENTER,
    rows: [{
      id: GraphComponents.Y_AXIS_TITLE,
      width: 100,
      widthUnits: SizeUnit.PERCENT,
      height: labelTextWidth,
      heightUnits: SizeUnit.PX,
    }],
  }
}

const getGraphMargin = (props: Options) => props.graphMargin ?? DEFAULT_GRAPH_MARGIN

const createGraphColumn = (props: Options): InputColumn => ({
  id: GraphComponents.CHART,
  evenlyFillAvailableWidth: true,
  height: 100,
  heightUnits: SizeUnit.PERCENT,
  margin: getGraphMargin(props),
})

const createXAxisLabelRow = (drawer: CanvasDrawer, props: Options): InputRow => {
  const labelText = getAxisLabelText(props, Axis2D.X)
  if (labelText == null)
    return null

  applyAxisLabelTextOptionsToDrawer(drawer, Axis2D.X, props)
  const labelTextHeight = measureTextLineHeight(drawer.getRenderingContext())
  const labelTextWidth = measureTextWidth(drawer.getRenderingContext(), labelText)

  return {
    height: labelTextHeight,
    heightUnits: SizeUnit.PX,
    width: 100,
    widthUnits: SizeUnit.PERCENT,
    columnJustification: ColumnJustification.CENTER,
    margin: getAxisLabelMargin(props, Axis2D.X),
    columns: [{
      id: GraphComponents.X_AXIS_TITLE,
      height: 100,
      heightUnits: SizeUnit.PERCENT,
      width: labelTextWidth,
      widthUnits: SizeUnit.PX,
    }],
  }
}

const createNavigatorRow = (props: Options): InputRow => {
  if (props.visibilityOptions?.showNavigator ?? false)
    return null

  return {
    height: props.navigatorOptions?.height ?? DEFAULT_NAVIGATOR_HEIGHT_PX,
    heightUnits: props.navigatorOptions?.height != null ? (props.navigatorOptions?.heightUnit ?? SizeUnit.PX) : SizeUnit.PX,
    width: 100,
    widthUnits: SizeUnit.PERCENT,
    id: GraphComponents.NAVIGATOR,
  }
}

const createCanvasFlexColumn = (drawer: CanvasDrawer, props: Options): InputColumn => {
  const titleRow = createTitleRow(drawer, props)
  const yAxisLabelColumn = createYAxisLabelColumn(drawer, props)
  const graphColumn = createGraphColumn(props)
  const xAxisLabelRow = createXAxisLabelRow(drawer, props)
  const navigatorRow = createNavigatorRow(props)

  return {
    height: props.heightPx,
    width: props.widthPx,
    widthUnits: SizeUnit.PX,
    rows: [
      // -- Title
      titleRow,
      {
        evenlyFillAvailableHeight: true,
        width: 100,
        widthUnits: SizeUnit.PERCENT,
        columns: [
          // -- LHS y-axis label
          yAxisLabelColumn,
          // Graph
          graphColumn,
        ],
      },
      // Bottom x-axis label
      xAxisLabelRow,
      navigatorRow,
    ],
  }
}

export const getGraphComponentRects = (drawer: CanvasDrawer, props: Options): GraphComponentRects => {
  const graphComponentRectsRaw = renderInputColumn(createCanvasFlexColumn(drawer, props))
  return {
    [GraphComponents.TITLE_BAR]: graphComponentRectsRaw[GraphComponents.TITLE_BAR],
    [GraphComponents.Y_AXIS_TITLE]: graphComponentRectsRaw[GraphComponents.Y_AXIS_TITLE],
    [GraphComponents.CHART]: graphComponentRectsRaw[GraphComponents.CHART],
    [GraphComponents.X_AXIS_TITLE]: graphComponentRectsRaw[GraphComponents.X_AXIS_TITLE],
    [GraphComponents.NAVIGATOR]: graphComponentRectsRaw[GraphComponents.NAVIGATOR],
  }
}
