import TextInputPart from './TextInputPart'

export type Options = {
  id?: string
  label?: string
  icon?: string
  placeholder?: string
  partList: TextInputPart[]
  onChange?: (valuePartList: string[]) => void
}

export default Options
