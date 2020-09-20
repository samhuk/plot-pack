import CanvasLayers from './CanvasLayers'
import { CanvasDrawer } from '../../../common/drawer/types'

/**
 * Represents the canvas drawer of each layer of the component
 */
export type CanvasLayerDrawers = { [layer in CanvasLayers]: CanvasDrawer }

export default CanvasLayerDrawers
