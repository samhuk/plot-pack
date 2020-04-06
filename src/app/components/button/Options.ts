import { Color } from '../../common/types/color'

export type Options = {
  id?: string
  className?: string
  text?: string
  color?: Color
  isEnabled?: boolean
  isLoading?: boolean
  icon?: string
  iconColor?: Color
  onClick: (e: React.MouseEvent) => void
}

export default Options
