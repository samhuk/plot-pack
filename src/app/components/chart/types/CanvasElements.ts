/**
 * Represents the canvas element layers of the component
 * @param chartPlotBase The static chart plot layer, containing unchanging parts like axes, markers, grid lines, title, etc.
 * @param chartInteractivity The dynamic chart layer, containing changing parts like marker highlight, tooltip, etc.
 */
export type CanvasElements = {
  chartPlotBase: HTMLCanvasElement
  chartInteractivity: HTMLCanvasElement
  navigatorPlotBase: HTMLCanvasElement
  navigatorBoundSelector: HTMLCanvasElement
  navigatorActionButtons: HTMLCanvasElement
}

export default CanvasElements
