/**
 * A generalized and declarative version of Path2D.
 */
import { PathComponentType, Path } from './types'

export const createPath2DFromPath = (path: Path, precreatedPath2D?: Path2D): Path2D => {
  if (path.length < 1)
    return null

  const p = precreatedPath2D ?? new Path2D()

  for (let i = 0; i < path.length; i += 1) {
    const pc = path[i]

    if (pc.type === PathComponentType.MOVE_TO)
      p.moveTo(pc.x, pc.y)
    else if (pc.type === PathComponentType.LINE_TO)
      p.lineTo(pc.x, pc.y)
    else if (pc.type === PathComponentType.RECT)
      p.rect(pc.x, pc.y, pc.width, pc.height)
    else if (pc.type === PathComponentType.CIRCLE)
      p.arc(pc.x, pc.y, pc.radius, 0, Math.PI * 2)
    else if (pc.type === PathComponentType.ARC)
      p.arc(pc.x, pc.y, pc.radius, pc.startAngle ?? 0, pc.endAngle)
  }
  return p
}
