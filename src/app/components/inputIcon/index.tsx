import React from 'react'
import Options from './Options'

import Icon from '../icon'

const FORM_INPUT_ICON_CONTAINER_CLASS = 'ui-text-input-icon-container'

export const InputIcon = (props: Options) => (
  <div className={FORM_INPUT_ICON_CONTAINER_CLASS}>
    <Icon icon={props.icon} />
  </div>
)

export default InputIcon
