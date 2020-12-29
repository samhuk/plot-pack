import { createLinePath } from '../canvasDrawer'
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
    else if (pc.type === PathComponentType.LINE)
      createLinePath([pc.from, pc.to], p)
    else if (pc.type === PathComponentType.RECT)
      p.rect(pc.x, pc.y, pc.width, pc.height)
    else if (pc.type === PathComponentType.CIRCLE)
      p.arc(pc.position.x, pc.position.y, pc.radius, 0, Math.PI * 2)
    else if (pc.type === PathComponentType.ARC)
      p.arc(pc.position.x, pc.position.y, pc.radius, pc.arc.start ?? 0, pc.arc.end)
    else if (pc.type === PathComponentType.QUADRATIC_CURVE_TO)
      p.quadraticCurveTo(pc.cPos.x, pc.cPos.y, pc.pos.x, pc.pos.y)
  }
  return p
}
