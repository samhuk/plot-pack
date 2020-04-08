import React, { useState } from 'react'

import Graph from '../../../../app/components/graph'
import { Axis2D } from '../../../../app/common/types/geometry'
import Notation from '../../../../app/components/graph/types/Notation'
import BestFitLine from '../../../../app/components/graph/types/BestFitLineType'
import MarkerType from '../../../../app/components/graph/types/MarkerType'
import XAxisOrientation from '../../../../app/components/graph/types/xAxisOrientation'
import YAxisOrientation from '../../../../app/components/graph/types/yAxisOrientation'
import DatumFocusMode from '../../../../app/components/graph/types/DatumFocusMode'

export const render = () => {
  const [height, setHeight] = useState(500)
  const [width, setWidth] = useState(500)
  const [xMax, setXMax] = useState(1)
  const [numPoints, setNumPoints] = useState(20)

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
              visibilityOptions: {
                showCursorPositionLine: true,
                showCursorPositionValueLabel: true,
              },
            },
            [Axis2D.X]: {
              dvGrid: 0.15,
              notation: Notation.DECIMAL,
              numFigures: 2,
              axisLineColor: '#333',
              axisMarkerLineColor: '#333',
              orientation: XAxisOrientation.ORIGIN,
              visibilityOptions: {
                showCursorPositionLine: true,
                showCursorPositionValueLabel: true,
              },
              cursorPositionLineOptions: {
                snapToNearestDatum: true,
                color: 'red',
              },
              cursorPositionValueLabelOptions: {
                snapToNearestDatum: true,
                fontSize: 20,
                color: 'red',
                backgroundColor: 'white',
                borderColor: 'blue',
                borderLineWidth: 3,
                borderRadius: 15,
                padding: 10,
              },
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
            type: MarkerType.DOT,
            color: '#333',
          }}
          datumFocusMode={DatumFocusMode.SNAP_NEAREST_X}
        />
      </div>
    </div>
  )
}

export default render
