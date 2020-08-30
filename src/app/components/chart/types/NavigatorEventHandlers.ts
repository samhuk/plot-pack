import Bound from './Bound'

export type NavigatorEventHandlers = {
  onSelectXValueBound: (newBound: Bound) => void
  onResetXValueBound: () => void
}

export default NavigatorEventHandlers
