import Options from '../types/Options'
import { getTitle, applyTitleTextOptionsToDrawer, getTitleMargin } from '../title'
import { CanvasDrawer } from '../../../common/drawer/types'
import { InputRow, SizeUnit, ColumnJustification, InputColumn, RowJustification } from '../../../common/canvasFlex/types'
import { measureTextLineHeight, measureTextWidth } from '../../../common/helpers/canvas'
import ChartComponents from '../types/ChartComponents'
import { getAxisLabelText, applyAxisLabelTextOptionsToDrawer, getAxisLabelMargin } from '../plotBase/components/axisLabels'
import { Axis2D } from '../../../common/types/geometry'
import { DEFAULT_NAVIGATOR_HEIGHT_PX } from '../navigator'
import ChartComponentRects from '../types/ChartComponentRects'
import { renderInputColumn } from '../../../common/canvasFlex/rendering'

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
      id: ChartComponents.TITLE_BAR,
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
      id: ChartComponents.Y_AXIS_TITLE,
      width: 100,
      widthUnits: SizeUnit.PERCENT,
      height: labelTextWidth,
      heightUnits: SizeUnit.PX,
    }],
  }
}

const getChartMargin = (props: Options) => props.chartMargin ?? DEFAULT_GRAPH_MARGIN

const createChartColumn = (props: Options): InputColumn => ({
  id: ChartComponents.CHART,
  evenlyFillAvailableWidth: true,
  height: 100,
  heightUnits: SizeUnit.PERCENT,
  margin: getChartMargin(props),
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
      id: ChartComponents.X_AXIS_TITLE,
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
    id: ChartComponents.NAVIGATOR,
  }
}

const createCanvasFlexColumn = (drawer: CanvasDrawer, props: Options): InputColumn => {
  const titleRow = createTitleRow(drawer, props)
  const yAxisLabelColumn = createYAxisLabelColumn(drawer, props)
  const chartColumn = createChartColumn(props)
  const xAxisLabelRow = createXAxisLabelRow(drawer, props)
  const navigatorRow = createNavigatorRow(props)

  return {
    height: props.height,
    width: props.width,
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
          // Chart
          chartColumn,
        ],
      },
      // Bottom x-axis label
      xAxisLabelRow,
      navigatorRow,
    ],
  }
}

export const getChartComponentRects = (drawer: CanvasDrawer, props: Options): ChartComponentRects => {
  const chartComponentRectsRaw = renderInputColumn(createCanvasFlexColumn(drawer, props))
  return {
    [ChartComponents.TITLE_BAR]: chartComponentRectsRaw[ChartComponents.TITLE_BAR],
    [ChartComponents.Y_AXIS_TITLE]: chartComponentRectsRaw[ChartComponents.Y_AXIS_TITLE],
    [ChartComponents.CHART]: chartComponentRectsRaw[ChartComponents.CHART],
    [ChartComponents.X_AXIS_TITLE]: chartComponentRectsRaw[ChartComponents.X_AXIS_TITLE],
    [ChartComponents.NAVIGATOR]: chartComponentRectsRaw[ChartComponents.NAVIGATOR],
  }
}
