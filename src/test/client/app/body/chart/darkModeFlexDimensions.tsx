import React, { useState } from 'react'
import Chart from '../../../../../app/components/chart/react'
import { Axis2D } from '../../../../../app/common/types/geometry'
import ErrorBarsMode from '../../../../../app/components/chart/types/ErrorBarsMode'
import MarkerType from '../../../../../app/components/chart/types/MarkerType'
import DatumSnapMode from '../../../../../app/components/chart/types/DatumSnapMode'
import DatumHighlightType from '../../../../../app/components/chart/types/DatumHighlightType'

export const DarkModeFlexDimensions = () => {
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

  const data1WithErrorBars = data1.map(({ x, y }) => ({
    x,
    y: [y, 2, 2],
  }))

  const data2 = []
  for (let i = -10; i < 10; i += 1)
    data2.push({ x: i, y: i })

  /* eslint-disable object-curly-newline */
  return (
    <div className="chart dark-mode-flex-dimensions">
      <div className="sandbox" style={{ }}>
        <div style={{ height: '50%' }}>
          <h3>DARK MODE (with error bars and auto height and width)!</h3>
          # of points:
          <input type="number" min="0" value={numPoints} onChange={e => setNumPoints(parseInt(e.target.value))} />
          X Max:
          <input type="number" value={xMax} onChange={e => setXMax(parseInt(e.target.value))} />
        </div>
        <div style={{ height: '50%' }}>
          <Chart
            series={{
              1: data1WithErrorBars,
              2: data2,
            }}
            seriesOptions={{
              1: {
                connectingLineOptions: {
                  color: 'red',
                },
                markerOptions: {
                  color: 'red',
                },
                errorBarsOptions: {
                  [Axis2D.Y]: {
                    mode: ErrorBarsMode.TWO_ABSOLUTE_DIFFERENCE,
                    color: 'red',
                  },
                  [Axis2D.X]: {
                    mode: ErrorBarsMode.TWO_ABSOLUTE_DIFFERENCE,
                    color: 'red',
                  },
                },
              },
              2: {
                connectingLineOptions: {
                  color: 'green',
                },
                markerOptions: {
                  color: 'green',
                },
              },
            }}
            axesOptions={{
              [Axis2D.X]: {
                labelText: 'value of x',
                labelOptions: {
                  color: 'white',
                },
                markerLabelOptions: {
                  color: 'white',
                },
                markerLineOptions: {
                  color: 'white',
                },
                lineOptions: {
                  color: 'white',
                },
                gridLineOptions: {
                  color: 'white',
                },
                cursorPositionLineOptions: {
                  dashPattern: [],
                  color: 'white',
                  lineWidth: 1,
                },
              },
              [Axis2D.Y]: {
                labelText: 'f(x)',
                labelOptions: {
                  color: 'white',
                },
                markerLabelOptions: {
                  color: 'white',
                },
                markerLineOptions: {
                  color: 'white',
                },
                lineOptions: {
                  color: 'white',
                },
                gridLineOptions: {
                  color: 'white',
                },
                cursorPositionLineOptions: {
                  snapToNearestDatum: true,
                  color: 'white',
                },
                cursorPositionValueLabelOptions: {
                  snapToNearestDatum: true,
                },
              },
            }}
            backgroundColor="#222"
            axesLabelOptions={{
              color: 'white',
            }}
            markerOptions={{
              type: MarkerType.CROSS,
              size: 8,
            }}
            tooltipOptions={{
              rectOptions: {
                fillOptions: {
                  color: '#666',
                },
              },
            }}
            visibilityOptions={{
              showConnectingLine: true,
            }}
            datumSnapOptions={{
              mode: DatumSnapMode.SNAP_NEAREST_X_Y,
              distanceThresholdPx: 30,
            }}
            datumHighlightOptions={{
              type: DatumHighlightType.CIRCLE,
              drawOptions: {
                lineOptions: {
                  color: 'white',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default DarkModeFlexDimensions
