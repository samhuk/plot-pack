import React, { useRef } from 'react'
import renderGraph from './graph'
import Options from './types/Options'
import renderDynamicAxisMarker from './dynamicAxisMarker'
import GraphGeometry from './types/GraphGeometry'
import { createGraphGeometry } from './geometry'
import { runWhen } from '../../common/helpers/function'

export const Graph = (props: Options) => {
  const graphGeometry = useRef<GraphGeometry>(createGraphGeometry(props))
  const hasGraphDrawn = useRef<boolean>(false)

  const onGraphCanvasReady = (canvas: HTMLCanvasElement): void => {
    renderGraph(canvas, props, graphGeometry.current)
    hasGraphDrawn.current = true
  }

  const onDynamicAxisMarkerCanvasReady = (canvas: HTMLCanvasElement): void => {
    // Render axis marker once graph has
    runWhen(() => hasGraphDrawn.current, () => {
      renderDynamicAxisMarker(canvas, props, graphGeometry.current)
    })
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
