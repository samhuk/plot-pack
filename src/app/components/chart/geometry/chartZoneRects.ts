import Options from '../types/Options'
import { getTitle, applyTitleTextOptionsToDrawer, getTitleMargin } from '../title'
import { CanvasDrawer } from '../../../common/drawer/types'
import { InputRow, ColumnJustification, InputColumn, RowJustification } from '../../../common/rectPositioningEngine/types'
import ChartZones from '../types/ChartZones'
import { getAxisLabelText, applyAxisLabelTextOptionsToDrawer, getAxisLabelMargin } from '../plotBase/components/axisLabels'
import { Axis2D } from '../../../common/types/geometry'
import { DEFAULT_NAVIGATOR_HEIGHT_PX } from '../navigator'
import ChartZoneRects from '../types/ChartZoneRects'
import { renderInputColumn } from '../../../common/rectPositioningEngine/rendering'
import { createDimensionValue } from '../../../common/rectPositioningEngine/elementParsing'

const DEFAULT_GRAPH_MARGIN = 10

const createTitleRow = (drawer: CanvasDrawer, props: Options): InputRow => {
  const titleText = getTitle(props)
  if (titleText == null)
    return null

  applyTitleTextOptionsToDrawer(drawer, props)
  return {
    height: drawer.measureTextHeight(),
    width: '100%',
    margin: getTitleMargin(props),
    columnJustification: ColumnJustification.CENTER,
    columns: [{
      id: ChartZones.TITLE_BAR,
      height: '100%',
      width: drawer.measureTextWidth(titleText),
    }],
  }
}

const createYAxisLabelColumn = (drawer: CanvasDrawer, props: Options): InputColumn => {
  const labelText = getAxisLabelText(props, Axis2D.Y)
  if (labelText == null)
    return null

  applyAxisLabelTextOptionsToDrawer(drawer, Axis2D.Y, props)

  return {
    width: drawer.measureTextHeight(),
    height: '100%',
    margin: getAxisLabelMargin(props, Axis2D.Y),
    rowJustification: RowJustification.CENTER,
    rows: [{
      id: ChartZones.Y_AXIS_TITLE,
      width: '100%',
      height: drawer.measureTextWidth(labelText),
    }],
  }
}

const getChartMargin = (props: Options) => props.chartMargin ?? DEFAULT_GRAPH_MARGIN

const createChartPlotBaseColumn = (props: Options): InputColumn => ({
  id: ChartZones.CHART_PLOT_BASE,
  evenlyFillAvailableWidth: true,
  height: '100%',
  margin: getChartMargin(props),
})

const createXAxisLabelRow = (drawer: CanvasDrawer, props: Options): InputRow => {
  const labelText = getAxisLabelText(props, Axis2D.X)
  if (labelText == null)
    return null

  applyAxisLabelTextOptionsToDrawer(drawer, Axis2D.X, props)

  return {
    height: drawer.measureTextHeight(),
    width: '100%',
    columnJustification: ColumnJustification.CENTER,
    margin: getAxisLabelMargin(props, Axis2D.X),
    columns: [{
      id: ChartZones.X_AXIS_TITLE,
      height: '100%',
      width: drawer.measureTextWidth(labelText),
    }],
  }
}

const getNavigatorPlotBaseHeight = (props: Options) => props.navigatorOptions?.height != null
  ? createDimensionValue(props.navigatorOptions.height, props.navigatorOptions.heightUnit)
  : DEFAULT_NAVIGATOR_HEIGHT_PX

const createNavigatorRow = (props: Options): InputRow => {
  if (props.visibilityOptions?.showNavigator ?? false)
    return null

  return {
    id: ChartZones.NAVIGATOR,
    width: '100%',
    padding: 5,
    columns: [{
      id: ChartZones.NAVIGATOR_PLOT_BASE,
      width: '100%',
      height: getNavigatorPlotBaseHeight(props),
    }],
  }
}

const createCanvasRectEngineColumn = (drawer: CanvasDrawer, props: Options): InputColumn => {
  const titleRow = createTitleRow(drawer, props)
  const yAxisLabelColumn = createYAxisLabelColumn(drawer, props)
  const chartPlotBaseColumn = createChartPlotBaseColumn(props)
  const xAxisLabelRow = createXAxisLabelRow(drawer, props)
  const navigatorRow = createNavigatorRow(props)

  return {
    height: props.height,
    width: props.width,
    rows: [
      {
        width: '100%',
        evenlyFillAvailableHeight: true,
        id: ChartZones.CHART,
        columns: [{
          width: '100%',
          height: '100%',
          rows: [
            // -- Title
            titleRow,
            {
              evenlyFillAvailableHeight: true,
              width: '100%',
              columns: [
                // -- LHS y-axis label column
                yAxisLabelColumn,
                // -- Chart plot base column
                chartPlotBaseColumn,
              ],
            },
            // -- Bottom x-axis label row
            xAxisLabelRow,
          ],
        }],
      },
      // -- Navigator row
      navigatorRow,
    ],
  }
}

export const getChartZoneRects = (drawer: CanvasDrawer, props: Options): ChartZoneRects => {
  const chartZoneRectsRaw = renderInputColumn(createCanvasRectEngineColumn(drawer, props))
  return {
    [ChartZones.TITLE_BAR]: chartZoneRectsRaw[ChartZones.TITLE_BAR],
    [ChartZones.Y_AXIS_TITLE]: chartZoneRectsRaw[ChartZones.Y_AXIS_TITLE],
    [ChartZones.CHART]: chartZoneRectsRaw[ChartZones.CHART],
    [ChartZones.CHART_PLOT_BASE]: chartZoneRectsRaw[ChartZones.CHART_PLOT_BASE],
    [ChartZones.X_AXIS_TITLE]: chartZoneRectsRaw[ChartZones.X_AXIS_TITLE],
    [ChartZones.NAVIGATOR]: chartZoneRectsRaw[ChartZones.NAVIGATOR],
    [ChartZones.NAVIGATOR_PLOT_BASE]: chartZoneRectsRaw[ChartZones.NAVIGATOR_PLOT_BASE]
  }
}
