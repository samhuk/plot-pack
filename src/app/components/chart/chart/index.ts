import Options from '../types/Options'
import Geometry from '../types/Geometry'
import { CanvasDrawer } from '../../../common/drawer/types'
import drawPlotInteractivity from '../plotInteractivity'
import Chart from '../types/Chart'
import drawPlotBase from './plotBase'
import { render as renderAnnotations } from '../annotations'

export const drawChart = (
  drawers: { plotBase: CanvasDrawer, interactivity: CanvasDrawer, annotations: CanvasDrawer },
  geometry: Geometry,
  props: Options,
): Chart => {
  drawPlotBase(drawers.plotBase, geometry, props)

  renderAnnotations(drawers.annotations, geometry, props.annotationsOptions)

  const interactivity = drawPlotInteractivity(drawers.interactivity, props, geometry.chartAxesGeometry, geometry.datumKdTrees)

  return { interactivity, annotations: null }
}
