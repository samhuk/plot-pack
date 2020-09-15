export type NavigatorBoundSelector = {
  onMouseMove: (e: MouseEvent) => void
  onMouseDown: (e: MouseEvent) => void
  onMouseUp: (e: MouseEvent) => void
  onMouseLeave: () => void
  onMouseEnter: () => void
  resetBoundsToInitial: () => void
}

export default NavigatorBoundSelector
