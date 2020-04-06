import { sum } from '../../common/helpers/math'
import { Point2D, CircularSector } from '../../common/types/geometry'

import DataMode from './types/DataMode'

import WedgeGeometry from './types/WedgeGeometry'
import WedgeDrawOptions from './types/WedgeDrawOptions'
import { calculateTextBoxRect, drawTextToTextBoxRect } from './internalWedgeTextBox'

const DEFAULT_TEXT_CENTER_POINT_ON_RADII = 0.6

const createWedgePath = (circularSector: CircularSector): Path2D => {
  const path = new Path2D()
  path.moveTo(circularSector.position.x, circularSector.position.y)
  path.arc(circularSector.position.x, circularSector.position.y, circularSector.radius, circularSector.arc.start, circularSector.arc.end)
  path.lineTo(circularSector.position.x, circularSector.position.y)
  path.closePath()
  return path
}

/**
 * Creates the geometries of a wedge (text box rect + wedge path)
 */
const createWedgeGeometry = (
  circleCenterPoint: Point2D,
  circleRadius: number,
  value: number,
  total: number,
  previousEndAngle: number,
  textBoxDistanceFromCenter: number,
  textBoxHeight: number,
): WedgeGeometry => {
  const circularSector: CircularSector = {
    position: circleCenterPoint,
    radius: circleRadius,
    arc: {
      start: previousEndAngle,
      end: previousEndAngle + (value / total) * 2 * Math.PI,
    },
  }

  return {
    textBoxRect: calculateTextBoxRect(circularSector, textBoxDistanceFromCenter, textBoxHeight),
    circularSector,
  }
}

export const createWedgeGeometries = (
  circleCenterPoint: Point2D,
  circleRadius: number,
  values: number[],
  dataMode: DataMode,
  textBoxDistanceFromCenter: number,
  textBoxHeight: number,
): WedgeGeometry[] => {
  const total = dataMode === DataMode.RAW ? sum(values) : 1
  const wedgeGeometries: WedgeGeometry[] = []

  for (let i = 0; i < values.length; i += 1) {
    wedgeGeometries.push(createWedgeGeometry(
      circleCenterPoint,
      circleRadius,
      values[i],
      total,
      // current wedge begins where the previous wedge ended (in terms of angles)
      i === 0 ? 0 : wedgeGeometries[i - 1].circularSector.arc.end,
      textBoxDistanceFromCenter ?? DEFAULT_TEXT_CENTER_POINT_ON_RADII,
      textBoxHeight,
    ))
  }

  return wedgeGeometries
}

export const drawWedgeText = (ctx: CanvasRenderingContext2D, wedgeGeometry: WedgeGeometry, drawOptions?: WedgeDrawOptions) => {
  // Populate wedge text box
  if (drawOptions?.text?.length > 0)
    drawTextToTextBoxRect(ctx, wedgeGeometry.textBoxRect, drawOptions.text, drawOptions.textColor)
}

export const drawWedgeShape = (ctx: CanvasRenderingContext2D, wedgeGeometry: WedgeGeometry, drawOptions?: WedgeDrawOptions): Path2D => {
  const path = createWedgePath(wedgeGeometry.circularSector)
  ctx.save()
  // Draw outline of wedge
  ctx.lineWidth = drawOptions?.lineWidth ?? 1
  ctx.stroke(path)
  // Optionally fill wedge
  if (drawOptions?.fillColorHex != null) {
    ctx.fillStyle = drawOptions.fillColorHex
    ctx.fill(path)
  }
  ctx.restore()
  return path
}
