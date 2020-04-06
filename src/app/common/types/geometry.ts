export enum Axis2D {
  X,
  Y,
}

export type Point2D = {
  x: number,
  y: number,
}

export type Rect = Point2D & {
  width: number,
  height: number,
}

export type Line = [Point2D, Point2D]

export type StraightLineParameters = {
  gradient: number
  yIntercept: number
}

export type StraightLineEquation = {
  gradient: number
  yIntercept: number
  y: (x: number) => number
  x: (y: number) => number
}

export type Quadrilateral = [Point2D, Point2D, Point2D, Point2D]

export type Polygon = Point2D[]

export type Arc = {
  start: number,
  end: number
}

export type CircularSector = {
  position: Point2D,
  arc: Arc,
  radius: number
}
