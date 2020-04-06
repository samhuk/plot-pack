import React, { useEffect, useRef } from 'react'
import { renderPieChart } from './pieChart'
import Options from './types/Options'

export const PieChart = (props: Options) => {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => renderPieChart(canvas.current, props))

  return (
    <div style={{ border: '1px solid black' }}>
      <canvas
        ref={canvas}
        height={props.radiusPx * 2}
        width={props.radiusPx * 2}
      />
    </div>
  )
}

export default PieChart
