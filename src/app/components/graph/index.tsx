import React from 'react'
import renderGraph from './graph'
import Options from './types/Options'
import renderInteractivity from './interactivity'
import { createGraphGeometry } from './geometry'
import GraphGeometry from './types/GraphGeometry'

export const Graph = (props: Options) => {
  let graphGeometry: GraphGeometry = null
  const queuedFunctionsToRunOnGraphGeometryCreation: (() => void)[] = []

  const onGraphCanvasReady = (canvas: HTMLCanvasElement): void => {
    if (canvas == null)
      return

    graphGeometry = createGraphGeometry(canvas, props)
    renderGraph(canvas, props, graphGeometry)

    if (queuedFunctionsToRunOnGraphGeometryCreation.length > 0)
      queuedFunctionsToRunOnGraphGeometryCreation.forEach(fn => fn())
  }

  const onDynamicAxisMarkerCanvasReady = (canvas: HTMLCanvasElement): void => {
    if (canvas == null)
      return
    if (graphGeometry != null)
      renderInteractivity(canvas, props, graphGeometry)
    else
      queuedFunctionsToRunOnGraphGeometryCreation.push(() => renderInteractivity(canvas, props, graphGeometry))
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
