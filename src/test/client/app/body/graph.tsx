import React, { useState } from 'react'

import Graph from '../../../../app/components/graph'
import { Axis2D } from '../../../../app/common/types/geometry'
import Notation from '../../../../app/components/graph/types/Notation'
import BestFitLine from '../../../../app/components/graph/types/BestFitLineType'
import MarkerType from '../../../../app/components/graph/types/MarkerType'

export const render = () => {
  const [height, setHeight] = useState(1000)
  const [width, setWidth] = useState(1000)
  const [xMax, setXMax] = useState(2 * Math.PI)
  const [numPoints, setNumPoints] = useState(200)

  const fn = (x: number) => x ** 2 * (Math.sin(x) - Math.tanh(x))
  const data = []
  const dx = (xMax - 0.01) / numPoints
  for (let i = -2 * Math.PI; i < xMax; i += dx)
    data.push({ x: i, y: fn(i * 5) })

  return (
    <div className="graph">
      <h2>Graph</h2>

      <div className="sandbox">
        # of points:
        <input type="number" min="0" value={numPoints} onChange={e => setNumPoints(parseInt(e.target.value))} />
        X Max:
        <input type="number" value={xMax} onChange={e => setXMax(parseInt(e.target.value))} />
        Width:
        <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value))} />
        Height:
        <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value))} />
        <Graph
          heightPx={height}
          widthPx={width}
          data={data}
          axesOptions={{
            [Axis2D.Y]: {
              notation: Notation.DECIMAL,
              numFigures: 2,
              axisLineColor: 'blue',
              axisMarkerLineColor: 'blue',
              axisMarkerLabelColor: 'blue',
            },
            [Axis2D.X]: {
              notation: Notation.DECIMAL,
              numFigures: 2,
              axisLineColor: 'red',
              axisLineWidth: 5,
            },
          }}
          bestFitLineType={BestFitLine.STRAIGHT}
          visibilitySettings={{
            showMarkers: true,
            showLine: false,
            showGridLines: true,
          }}
          markerOptions={{
            size: 6,
            type: MarkerType.SQUARE,
          }}
        />
      </div>
    </div>
  )
}

export default render
