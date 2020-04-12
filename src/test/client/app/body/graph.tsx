import React, { useState } from 'react'

import Graph from '../../../../app/components/graph'
import { Axis2D } from '../../../../app/common/types/geometry'
import Notation from '../../../../app/components/graph/types/Notation'
import BestFitLine from '../../../../app/components/graph/types/BestFitLineType'
import MarkerType from '../../../../app/components/graph/types/MarkerType'
import XAxisOrientation from '../../../../app/components/graph/types/xAxisOrientation'
import YAxisOrientation from '../../../../app/components/graph/types/yAxisOrientation'
import DatumSnapMode from '../../../../app/components/graph/types/DatumSnapMode'
import { DatumHighlightAppearanceType } from '../../../../app/components/graph/types/DatumHighlightAppearanceType'

export const render = () => {
  const [height, setHeight] = useState(500)
  const [width, setWidth] = useState(500)
  const [xMax, setXMax] = useState(20)
  const [numPoints, setNumPoints] = useState(20)

  const fn = (x: number) => 10 * Math.cos(x) + 0.5 * x
  const data1 = []
  const xMin = -10
  const dx = (xMax - xMin) / numPoints
  for (let i = xMin; i < xMax; i += dx) {
    data1.push({ x: i, y: fn(i) })
    if (i > 1E7)
      break
  }

  const data2 = []
  for (let i = -10; i < 10; i += 1)
    data2.push({ x: i, y: i })

  return (
    <div className="graph">
      <h2>Graph</h2>

      <div className="sandbox">
        <h3>Highly customized, with changable options</h3>
        # of points:
        <input type="number" min="0" value={numPoints} onChange={e => setNumPoints(parseInt(e.target.value))} />
        X Max:
        <input type="number" value={xMax} onChange={e => setXMax(parseInt(e.target.value))} />
        Width:
        <input type="number" min="0" value={width} onChange={e => setWidth(parseInt(e.target.value))} />
        Height:
        <input type="number" min="0" value={height} onChange={e => setHeight(parseInt(e.target.value))} />
        <Graph
          heightPx={height}
          widthPx={width}
          series={{
            1: data1,
            2: data2,
          }}
          seriesOptions={{
            1: {
              visibilityOptions: {
                showLine: true,
              },
              lineOptions: {
                color: 'red',
                width: 2,
              },
              markerOptions: {
                color: 'purple',
                type: MarkerType.CROSS,
                size: 10,
                lineWidth: 2,
              },
            },
          }}
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
              // dvGrid: 0.15,
              // vl: 0,
              // vu: 1,
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
            showConnectingLine: true,
            showGridLines: true,
          }}
          markerOptions={{
            lineWidth: 1,
            size: 6,
            type: MarkerType.DOT,
            color: '#333',
          }}
          datumSnapMode={DatumSnapMode.SNAP_NEAREST_X}
          datumHighlightAppearance={{
            type: DatumHighlightAppearanceType.CROSSHAIR,
            lineWidth: 2,
            color: 'blue',
          }}
          seriesExcludedFromDatumHighlighting={[]}
        />
      </div>

      <div className="sandbox">
        <h3>Mostly default options (realistic use case example)</h3>
        <Graph
          heightPx={height}
          widthPx={width}
          series={{
            1: data1,
            2: data2,
          }}
          seriesOptions={{
            1: {
              lineOptions: {
                color: 'red',
                width: 2,
              },
            },
            2: {
              lineOptions: {
                color: 'blue',
                width: 2,
              },
            },
          }}
          visibilityOptions={{
            showConnectingLine: true,
          }}
          markerOptions={{
            size: 8,
            type: MarkerType.CROSS,
            lineWidth: 2,
          }}
        />
      </div>

      <div className="sandbox">
        <h3>All default options</h3>
        <Graph
          heightPx={height}
          widthPx={width}
          series={{
            1: data1,
            2: data2,
          }}
        />
      </div>
    </div>
  )
}

export default render
