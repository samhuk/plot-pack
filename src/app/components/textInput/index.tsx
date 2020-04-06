import React from 'react'

import Options from './Options'

import InputIcon from '../inputIcon'

export const CONTAINER_CLASS = 'ui-text-input-container'
export const INPUT_ICON_CONTAINER_CLASS = 'ui-input-icon-container'
export const INPUT_CLASS = 'ui-text-input'
export const LABEL_CLASS = 'ui-text-input-label'
export const HAS_ICON_CLASS = 'has-icon'

export const TextInput = (props: Options) => (
  <div
    className={`${CONTAINER_CLASS} ${props.icon != null ? HAS_ICON_CLASS : ''}`}
    id={props.id}
  >
    {props.label != null ? <div className={LABEL_CLASS}>{props.label}</div> : null}
    <div className={INPUT_ICON_CONTAINER_CLASS}>
      {props.icon != null ? <InputIcon icon={props.icon} /> : null}
      <input
        className={INPUT_CLASS}
        type="text"
        placeholder={props.placeholder}
        maxLength={props.maxLength}
        onInput={e => props.onChange((e.target as HTMLInputElement).value)}
      />
    </div>
  </div>
)

export default TextInput
