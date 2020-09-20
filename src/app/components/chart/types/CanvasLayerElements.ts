import CanvasLayers from './CanvasLayers'

/**
 * Represents the canvas element of each layer of the component
 */
export type CanvasLayerElements = { [layer in CanvasLayers]: HTMLCanvasElement }

export default CanvasLayerElements
