/**
 * Represents the canvas element layers of the component
 * @param graph The static chart layer, containing unchanging parts like axes, markers, grid lines, title, etc.
 * @param interactivity The dynamic layer, containing changing parts like marker highlight, tooltip, etc.
 */
export type CanvasElements = {
  graph: HTMLCanvasElement
  interactivity: HTMLCanvasElement
}

export default CanvasElements
