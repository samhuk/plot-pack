import React from 'react'
import renderGraph from './graph'
import Options from './types/Options'
import renderInteractivity from './interactivity'
import { createGraphGeometry } from './geometry'

export const Graph = (props: Options) => {
  const graphGeometry = createGraphGeometry(props)

  const onGraphCanvasReady = (canvas: HTMLCanvasElement): void => {
    if (canvas == null)
      return
    renderGraph(canvas, props, graphGeometry)
  }

  const onDynamicAxisMarkerCanvasReady = (canvas: HTMLCanvasElement): void => {
    if (canvas == null)
      return
    renderInteractivity(canvas, props, graphGeometry)
  }

  return (
    <div style={{ position: 'relative', height: props.heightPx, width: props.widthPx }}>
      <canvas
        style={{ border: '1px solid black', position: 'absolute' }}
        ref={onGraphCanvasReady}
        height={props.heightPx}
        width={props.widthPx}
      />
      <canvas
        style={{ border: '1px solid black', position: 'absolute' }}
        ref={onDynamicAxisMarkerCanvasReady}
        height={props.heightPx}
        width={props.widthPx}
      />
    </div>
  )
}

export default Graph
