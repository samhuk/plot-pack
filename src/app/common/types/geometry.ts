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

export type BoundingRect = {
  left: number
  right: number
  top: number
  bottom: number
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

export type Circle = {
  position: Point2D,
  radius: number,
}

export type CircularSector = Circle & {
  arc: Arc,
}
