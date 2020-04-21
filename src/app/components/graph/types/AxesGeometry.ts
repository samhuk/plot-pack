import { Axis2D } from '../../../common/types/geometry'
import AxisGeometry from './AxisGeometry'

export type AxesGeometry = { [axis in Axis2D]: AxisGeometry }

export default AxesGeometry
