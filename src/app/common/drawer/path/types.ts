import { LineOptions, FillOptions } from '../../types/canvas'
import { Point2D, Rect } from '../../types/geometry'

export type DrawOptions = {
  lineOptions?: LineOptions
  fillOptions?: FillOptions
  stroke?: boolean
  fill?: boolean
}

export enum PathComponentType {
  MOVE_TO = 'move',
  LINE_TO = 'line_to',
  LINE = 'line',
  QUADRATIC_CURVE_TO = 'quadratic_curve',
  RECT = 'rect',
  CIRCLE = 'circle',
  ARC = 'arc',
  ISOSCELES_TRIANGLE = 'isos_tri',
}

type Circle = Point2D & { radius: number }

type CircularSector = Circle & { startAngle?: number, endAngle: number }

type PathTypeToOptionsMap = {
  [PathComponentType.MOVE_TO]: Point2D
  [PathComponentType.LINE_TO]: Point2D & LineOptions
  [PathComponentType.LINE]: { from: Point2D, to: Point2D }
  [PathComponentType.QUADRATIC_CURVE_TO]: { cPos: Point2D, pos: Point2D }
  [PathComponentType.RECT]: Rect
  [PathComponentType.CIRCLE]: Circle
  [PathComponentType.ARC]: CircularSector
  [PathComponentType.ISOSCELES_TRIANGLE]: Rect
}

type PathComponentUnion = {
  [K in PathComponentType]: { type: K } & PathTypeToOptionsMap[K]
}[PathComponentType]

export type PathComponent<T extends PathComponentType> = PathComponentUnion & { type: T }

export type Path = PathComponent<PathComponentType>[]
