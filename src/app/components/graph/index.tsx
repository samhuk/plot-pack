import React, { useEffect, useRef } from 'react'
import { renderGraph } from './graph'
import Options from './types/Options'

export const Graph = (props: Options) => {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => renderGraph(canvas.current, props))

  return (
    <div>
      <canvas
        style={{ border: '1px solid black' }}
        ref={canvas}
        height={props.heightPx}
        width={props.widthPx}
      />
    </div>
  )
}

export default Graph
