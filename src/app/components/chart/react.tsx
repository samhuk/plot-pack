import React from 'react'
import render from '.'
import InputOptions from './types/InputOptions'

export const Chart = (props: InputOptions) => {
  const onElementReady = (element: HTMLElement): void => {
    if (element != null) {
      if (element.firstElementChild != null)
        element.removeChild(element.firstElementChild)
      render(element, props)
    }
  }

  return (
    <div ref={onElementReady} style={{ position: 'relative', height: props.heightPx ?? '100%', width: props.widthPx ?? '100%' }} />
  )
}

export default Chart
