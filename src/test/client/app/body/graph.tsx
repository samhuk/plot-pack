import React, { useState } from 'react'

import Graph from '../../../../app/components/graph'
import { Axis2D } from '../../../../app/common/types/geometry'
import Notation from '../../../../app/components/graph/types/Notation'
import BestFitLine from '../../../../app/components/graph/types/BestFitLineType'
import MarkerType from '../../../../app/components/graph/types/MarkerType'
import XAxisOrientation from '../../../../app/components/graph/types/xAxisOrientation'
import YAxisOrientation from '../../../../app/components/graph/types/yAxisOrientation'

export const render = () => {
  const [height, setHeight] = useState(500)
  const [width, setWidth] = useState(500)
  const [xMax, setXMax] = useState(1)
  const [numPoints, setNumPoints] = useState(200)

  const fn = (x: number) => x ** x
  const data = []
  const xMin = 0
  const dx = (xMax - xMin) / numPoints
  for (let i = xMin; i < xMax; i += dx) {
    data.push({ x: i, y: fn(i) })
    if (i > 1E7)
      break
  }

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
              axisLineColor: '#333',
              axisMarkerLineColor: '#333',
              axisMarkerLabelColor: '#333',
              orientation: YAxisOrientation.ORIGIN,
            },
            [Axis2D.X]: {
              notation: Notation.DECIMAL,
              numFigures: 2,
              axisLineColor: '#333',
              axisMarkerLineColor: '#333',
              orientation: XAxisOrientation.ORIGIN,
            },
          }}
          bestFitLineOptions={{
            type: BestFitLine.STRAIGHT,
            lineDashPattern: [5, 5],
          }}
          visibilityOptions={{
            showMarkers: true,
            showLine: false,
            showGridLines: true,
          }}
          markerOptions={{
            lineWidth: 1,
            size: 6,
            type: MarkerType.PLUS,
            color: '#333',
          }}
        />
      </div>
    </div>
  )
}

export default render
