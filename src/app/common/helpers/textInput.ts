import { createIcon, wrap } from './element'

export const FORM_INPUT_ICON_CONTAINER_CLASS = 'ui-text-input-icon-container'

export const createTextInputIcon = (icon: string) => wrap('div', FORM_INPUT_ICON_CONTAINER_CLASS, null, createIcon(icon))
