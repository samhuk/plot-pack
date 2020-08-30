import Options from '../types/Options'
import Geometry from '../types/Geometry'
import { CanvasDrawer } from '../../../common/drawer/types'
import drawPlotInteractivity from '../plotInteractivity'
import Chart from '../types/Chart'
import drawPlotBase from './plotBase'

export const drawChart = (
  drawers: { plotBase: CanvasDrawer, interactivity: CanvasDrawer },
  geometry: Geometry,
  props: Options,
): Chart => {
  drawPlotBase(drawers.plotBase, geometry, props)

  const interactivity = drawPlotInteractivity(drawers.interactivity, props, geometry.chartAxesGeometry, geometry.datumKdTrees)

  return { interactivity }
}
