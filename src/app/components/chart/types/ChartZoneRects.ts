import ChartZones from './ChartZones'
import { Rect } from '../../../common/types/geometry'

export type ChartZoneRects = {
[chartZone in ChartZones]: Rect
}

export default ChartZoneRects
