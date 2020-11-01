import { Rect, Line, Circle, CircularSector, Point2D, RectDimensions, Directions2DOptional, Corners2DOptional } from '../types/geometry'
import { LineOptions, FillOptions, TextOptions as TextOptionsBase } from '../types/canvas'
import { Path } from './path/types'

export type DrawOptions = {
  lineOptions?: LineOptions
  fillOptions?: FillOptions
  stroke?: boolean
  fill?: boolean
}

export type TextOptions = TextOptionsBase

export type RoundedRectSimpleOptions = {
  borderLineOptions?: LineOptions & {
    radii?: number | Corners2DOptional<number>,
  }
  backgroundColor?: string
  backgroundOpacity?: number
  stroke?: boolean
  fill?: boolean
}

export type RoundedRectOptions = {
  borderDashPattern?: number[] | Directions2DOptional<number[]>
  borderColor?: string | Directions2DOptional<string>
  borderLineWidth?: number
  borderRadii?: number | Corners2DOptional<number>
  backgroundColor?: string
  backgroundOpacity?: number
  stroke?: boolean
  fill?: boolean
}

/**
 * A drawer.
 */
type Drawer<T, R> = {
  // -- Draw text commands
  /**
   * Draws text at the specified position.
   * @param text The text to draw
   * @param position The top-left position of the text
   * @param angle The angle of rotation of the text.
   */
  text: (text: string, position: Point2D, angle?: number, textOptions?: TextOptions) => void
  // -- Draw shape commands
  /**
   * Draws a line between the given two points.
   */
  line: (line: Line, lineOptions?: LineOptions) => R
  /**
   * Draws a rectangle for the given Rect.
   */
  rect: (rect: Rect, drawOptions?: DrawOptions) => R
  /**
   * Draws a single-path rounded rect. This differs from `roundedRect`; this sacrifices
   * the ability to define per-side and per-corner properties for increased speed. If
   * you expect border radii to always be zero, then `.rect()`.
   */
  roundedRectSimple: (rect: Rect, roundedRectOptions: RoundedRectSimpleOptions) => R
  /**
   * Draws a multi-path rounded rect. This differs from `roundedRectSimple`; this sacrifices
   * speed for the ability to define per-side and per-corner properties.
   */
  roundedRect: (rect: Rect, roundedRectOptions: RoundedRectOptions) => void
  /**
   * Draws a circle for the given Circle
   */
  circle: (circle: Circle, drawOptions?: DrawOptions) => R
  /**
   * Draws an arc (i.e. part of a circle) given the CircularSector
   */
  arc: (sector: CircularSector, drawOptions?: DrawOptions) => R
  isoscelesTriangle: (boundingRect: Rect, drawOptions?: DrawOptions) => R
  path: (drawerPath: Path, drawOptions?: DrawOptions) => R
  clearRenderingSpace: (rectToClear?: Rect) => void
  // -- Style modifiers
  applyLineOptions: (lineOptions?: LineOptions, defaultOptions?: LineOptions) => void
  applyFillOptions: (fillOptions?: FillOptions, defaultOptions?: FillOptions) => void
  applyTextOptions: (textOptions?: TextOptionsBase, fallbackOptions?: TextOptionsBase) => void
  // -- Misc
  getRenderingContext: () => T
  measureTextWidth: (text: string) => number,
  measureTextHeight: (text?: string) => number,
  measureTextRectDimensions: (text: string) => RectDimensions,
}

export type CanvasDrawer = Drawer<CanvasRenderingContext2D, Path2D>

export type CanvasDrawerState = {
  ctx: CanvasRenderingContext2D
  drawnObjects: Path2D[]
}
