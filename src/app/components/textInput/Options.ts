export type Options = {
  id?: string
  format?: string
  label?: string
  icon?: string
  placeholder?: string
  maxLength?: number
  onChange: (newValue: string) => void
}

export default Options
