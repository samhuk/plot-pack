import { Rect, Line, Circle, CircularSector } from '../types/geometry'
import { LineOptions, FillOptions } from '../types/canvas'
import { Path } from './path/types'

export type DrawOptions = {
  lineOptions?: LineOptions
  fillOptions?: FillOptions
  stroke?: boolean
  fill?: boolean
}

type Drawer<T, R> = {
  // -- Draw commands
  line: (line: Line, lineOptions?: LineOptions) => R
  rect: (rect: Rect, drawOptions?: DrawOptions) => R
  circle: (circle: Circle, drawOptions?: DrawOptions) => R
  arc: (sector: CircularSector, drawOptions?: DrawOptions) => R
  isoscelesTriangle: (boundingRect: Rect, drawOptions?: DrawOptions) => R
  path: (drawerPath: Path, drawOptions?: DrawOptions) => R
  clearRenderingSpace: (rectToClear?: Rect) => void
  // -- Style modifiers
  applyLineOptions: (lineOptions?: LineOptions, defaultOptions?: LineOptions) => void
  applyFillOptions: (fillOptions?: any, defaultOptions?: LineOptions) => void
  // -- Misc
  getRenderingContext: () => T
}

export type CanvasDrawer = Drawer<CanvasRenderingContext2D, Path2D>

export type CanvasDrawerState = {
  ctx: CanvasRenderingContext2D
  drawnObjects: Path2D[]
}
