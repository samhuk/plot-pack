import React from 'react'
import { iconClass } from '../../common/helpers/element'
import { Color } from '../../common/types/color'
import { colorClassMap } from '../../common/helpers/color'

type Options = { icon: string, color?: Color, className?: string }

export const Icon = (props: Options) => (
  <i className={[
    iconClass(props.icon),
    props.color != null ? colorClassMap[props.color] : null,
    props.className,
  ].filter(c => Boolean(c)).join(' ')}
  />
)

export default Icon
