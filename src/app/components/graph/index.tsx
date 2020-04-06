import React, { useEffect, useRef } from 'react'
import { renderGraph } from './graph'
import Options from './types/Options'
import { init } from './interactivityLayer'
import MouseMoveHandler from './types/MouseMoveHandler'
import GraphGeometry from './types/GraphGeometry'

export const Graph = (props: Options) => {
  const graphCanvas = useRef<HTMLCanvasElement>(null)
  const interactivityCanvas = useRef<HTMLCanvasElement>(null)
  const onMouseMove = useRef<MouseMoveHandler>(() => undefined)

  const onGraphRenderComplete = (graphGeometry: GraphGeometry) => {
    if (interactivityCanvas.current == null || graphGeometry == null)
      return
    const initializedInteractivityLayer = init(interactivityCanvas.current, props, graphGeometry)
    onMouseMove.current = initializedInteractivityLayer.onMouseMove
  }

  useEffect(() => renderGraph(graphCanvas.current, props, onGraphRenderComplete))

  return (
    <div style={{ position: 'relative', height: props.heightPx, width: props.widthPx }}>
      <canvas
        style={{ border: '1px solid black', position: 'absolute' }}
        ref={graphCanvas}
        height={props.heightPx}
        width={props.widthPx}
      />
      <canvas
        style={{ border: '1px solid black', position: 'absolute' }}
        ref={interactivityCanvas}
        height={props.heightPx}
        width={props.widthPx}
      />
    </div>
  )
}

export default Graph
