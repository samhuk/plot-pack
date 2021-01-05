import { LineOptions } from '../../../common/types/canvas'
import ErrorBarsMode from './ErrorBarsMode'

export type ErrorBarsOptions = LineOptions & {
  mode: ErrorBarsMode
  capSize?: number
}

export default ErrorBarsOptions
