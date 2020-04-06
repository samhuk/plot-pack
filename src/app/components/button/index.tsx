import React from 'react'
import { colorClassMap } from '../../common/helpers/color'
import Options from './Options'

import Icon from '../icon'
import LoadingIcon from '../icon/loadingIcon'

export const CONTAINER_CLASS = 'ui-button-container'
export const ICON_CLASS = 'ui-button-icon'
export const HAS_TEXT_CLASS = 'has-text'

export const Button = (props: Options) => (
  <button
    className={[
      CONTAINER_CLASS,
      props.text?.length > 0 ? HAS_TEXT_CLASS : null,
      props.color != null ? colorClassMap[props.color] : null,
      props.className,
    ].filter(s => Boolean(s)).join(' ')}
    onClick={props.onClick}
    disabled={props.isEnabled === false || props.isLoading === true}
    type="button"
  >
    {props.icon != null ? <Icon icon={props.icon} color={props.color} className={ICON_CLASS} /> : null}
    <div>{props.text}</div>
    {props.isLoading ? <LoadingIcon /> : null}
  </button>
)

export default Button
