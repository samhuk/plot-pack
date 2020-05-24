import { Point2D, Rect, Line, CircularSector } from '../types/geometry'
import { LineOptions } from '../types/canvas'

type Drawer<T, R> = {
  line: (line: Line, lineOptions?: LineOptions) => R;
  path: (vertices: Point2D[], lineOptions?: LineOptions, fillOptions?: any) => R;
  rect: (rect: Rect, lineOptions?: LineOptions, fillOptions?: any) => R;
  circle: (centerPosition: Point2D, radius: number, lineOptions?: LineOptions, fillOptions?: any) => R;
  arc: (sector: CircularSector, lineOptions?: LineOptions) => R;
  isoscelesTriangle: (boundingRect: Rect, lineOptions?: LineOptions, fillOptions?: any) => R;
  applyLineOptions: (lineOptions?: LineOptions, defaultOptions?: LineOptions) => void;
  applyFillOptions: (fillOptions?: any, defaultOptions?: LineOptions) => void;
  getRenderingContext: () => T
  clearRenderingSpace: (rectToClear?: Rect) => void
}

export type CanvasDrawer = Drawer<CanvasRenderingContext2D, Path2D>

export type CanvasDrawerState = {
  ctx: CanvasRenderingContext2D
  drawnObjects: Path2D[]
}
