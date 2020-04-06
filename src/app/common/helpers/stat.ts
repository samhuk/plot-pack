import { Point2D, StraightLineEquation } from '../types/geometry'
import { sum } from './math'

export const calculateStraightLineOfBestFit = (points: Point2D[]): StraightLineEquation => {
  const n = points.length
  const xPoints = points.map(p => p.x)
  const meanX = sum(xPoints) / n
  const meanY = sum(points.map(p => p.y)) / n

  const numerator = sum(points.map(p => (p.x - meanX) * (p.y - meanY)))
  const denominator = sum(xPoints.map(x => (x - meanX) ** 2))
  const m = numerator / denominator

  const C = meanY - (m * meanX)

  return { gradient: m, yIntercept: C, y: x => (m * x) + C }
}
