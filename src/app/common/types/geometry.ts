export enum Axis2D {
  X = 'x',
  Y = 'y',
}

export type Point2D = {
  x: number
  y: number
}

export type RectDimensions = {
  width: number
  height: number
}

export type Rect = Point2D & RectDimensions

export type Directions2D<T extends any> = {
  left: T
  right: T
  top: T
  bottom: T
}

export type Corners2D<T extends any> = {
  topLeft: T
  topRight: T
  bottomLeft: T
  bottomRight: T
}

export type Corners2DOptional<T extends any> = {
  topLeft?: T
  topRight?: T
  bottomLeft?: T
  bottomRight?: T
}

export type Directions2DOptional<T extends any> = {
  left?: T
  right?: T
  top?: T
  bottom?: T
}

export type QuadraticCurve = {
  fromPos: Point2D
  cPos: Point2D
  toPos: Point2D
}

export type BoundingRect = Directions2D<number>

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
  start: number
  end: number
}

export type Circle = {
  position: Point2D
  radius: number
}

export type CircularSector = Circle & {
  arc: Arc
}

export enum VerticalAlign {
  TOP = 'top',
  CENTER = 'center',
  BOTTOM = 'bottom',
}

export enum HoriztonalAlign {
  LEFT = 'right',
  CENTER = 'center',
  RIGHT = 'left',
}

export enum RectVerticalAlign {
  TOP_OUTSIDE = 'top_outside',
  TOP_INSIDE = 'top_inside',
  CENTER = 'center',
  BOTTOM_INSIDE = 'bottom_inside',
  BOTTOM_OUTSIDE = 'bottom_outside',
}

export enum RectHorizontalAlign {
  LEFT_OUTSIDE = 'left_outside',
  LEFT_INSIDE = 'left_inside',
  CENTER = 'center',
  RIGHT_INSIDE = 'right_inside',
  RIGHT_OUTSIDE = 'right_outside',
}

export enum OctalRadialDirection {
  TOP = 'top',
  TOP_RIGHT = 'top_right',
  RIGHT = 'right',
  BOTTOM_RIGHT = 'bottom_right',
  BOTTOM = 'bottom',
  BOTTOM_LEFT = 'bottom_left',
  LEFT = 'left',
  TOP_LEFT = 'top_left',
}

/**
 * Either an angle from the x-axis in radians (clockwise from RHS), or one of the octal radial directions
 */
export type InputDirection = { angle: number, angleUnits?: AngleUnits } | OctalRadialDirection

export enum AngleUnits {
  DEGREES = 'degrees',
  RADIANS = 'radians',
}

export type InputPolarVector = {
  direction: InputDirection
  radius?: number
}

/**
 * A 2D polar vector.
 */
export type PolarVector = {
  /**
   * Angle from the x-axis in radians (clockwise from RHS)
   */
  angle: number
  radius: number
}

export type CartesianVector = { [axis in Axis2D]: number }

export type CartesianOrInputPolarVector = CartesianVector | InputPolarVector
