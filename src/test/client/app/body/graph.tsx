import React, { useState } from 'react'

import Graph from '../../../../app/components/graph'
import { Axis2D, Point2D } from '../../../../app/common/types/geometry'
import Notation from '../../../../app/components/graph/types/Notation'
import BestFitLine from '../../../../app/components/graph/types/BestFitLineType'
import MarkerType from '../../../../app/components/graph/types/MarkerType'
import XAxisOrientation from '../../../../app/components/graph/types/xAxisOrientation'
import YAxisOrientation from '../../../../app/components/graph/types/yAxisOrientation'
import DatumSnapMode from '../../../../app/components/graph/types/DatumSnapMode'
import { DatumHighlightAppearanceType } from '../../../../app/components/graph/types/DatumHighlightAppearanceType'
import ErrorBarsMode from '../../../../app/components/graph/types/ErrorBarsMode'
import DatumFocusPointDeterminationMode from '../../../../app/components/graph/types/DatumFocusPointDeterminationMode'

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

  const data1WithErrorBars = data1.map(({ x, y }) => ({
    x,
    y: [y, 2, 2],
  }))

  const data3 = []
  for (let i = 1; i < 1000; i += 1)
    data3.push({ x: i, y: Math.log(i) })

  const data4: Point2D[] = []
  for (let i = 1; i < 1000; i += 1)
    data4.push({ x: i, y: (data4[i - 2]?.y ?? 0) + (1 / i) })

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
              labelText: 'This is the Y Axis',
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
              labelText: 'This is the X Axis',
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
          tooltipOptions={{
            showSeriesStylePreview: true,
            boxPaddingX: 15,
            boxPaddingY: 15,
            fontSize: 14,
            borderRadius: 10,
            backgroundColor: '#333',
            textColor: 'white',
            borderLineColor: '#999',
          }}
          markerOptions={{
            lineWidth: 1,
            size: 6,
            type: MarkerType.DOT,
            color: '#333',
          }}
          datumSnapOptions={{
            mode: DatumSnapMode.SNAP_NEAREST_X,
            excludedSeriesKeys: [],
          }}
          datumHighlightOptions={{
            type: DatumHighlightAppearanceType.CROSSHAIR,
            lineWidth: 2,
            color: 'blue',
          }}
        />
      </div>

      <div className="sandbox">
        <h3>Mostly default options (realistic use case example)</h3>
        <Graph
          heightPx={height}
          widthPx={width}
          series={{
            1: data3,
            2: data4,
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
            showMarkers: false,
            showConnectingLine: true,
            showStraightLineOfBestFit: false,
            showDatumHighlight: false,
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

      <div className="sandbox">
        <h3>Candlestick</h3>
        <Graph
          heightPx={height}
          widthPx={width}
          datumFocusPointDeterminationMode={DatumFocusPointDeterminationMode.AVERAGE}
          axesOptions={{
            [Axis2D.X]: {
              visibilityOptions: {
                showGridLines: false,
              }
            },
            [Axis2D.Y]: {
              visibilityOptions: {
                showAxisMarkerLines: false,
                showAxisLine: false,
              }
            }
          }}
          series={{
            1: [
              {
                x: 1538778600000,
                y: [6629.81, 6650.5, 6623.04, 6633.33]
              },
              {
                x: 1538780400000,
                y: [6632.01, 6643.59, 6620, 6630.11]
              },
              {
                x: 1538782200000,
                y: [6630.71, 6648.95, 6623.34, 6635.65]
              },
              {
                x: 1538784000000,
                y: [6635.65, 6651, 6629.67, 6638.24]
              },
              {
                x: 1538785800000,
                y: [6638.24, 6640, 6620, 6624.47]
              },
              {
                x: 1538787600000,
                y: [6624.53, 6636.03, 6621.68, 6624.31]
              },
              {
                x: 1538789400000,
                y: [6624.61, 6632.2, 6617, 6626.02]
              },
              {
                x: 1538791200000,
                y: [6627, 6627.62, 6584.22, 6603.02]
              },
              {
                x: 1538793000000,
                y: [6605, 6608.03, 6598.95, 6604.01]
              },
              {
                x: 1538794800000,
                y: [6604.5, 6614.4, 6602.26, 6608.02]
              },
              {
                x: 1538796600000,
                y: [6608.02, 6610.68, 6601.99, 6608.91]
              },
              {
                x: 1538798400000,
                y: [6608.91, 6618.99, 6608.01, 6612]
              },
              {
                x: 1538800200000,
                y: [6612, 6615.13, 6605.09, 6612]
              },
              {
                x: 1538802000000,
                y: [6612, 6624.12, 6608.43, 6622.95]
              },
              {
                x: 1538803800000,
                y: [6623.91, 6623.91, 6615, 6615.67]
              },
              {
                x: 1538805600000,
                y: [6618.69, 6618.74, 6610, 6610.4]
              },
              {
                x: 1538807400000,
                y: [6611, 6622.78, 6610.4, 6614.9]
              },
              {
                x: 1538809200000,
                y: [6614.9, 6626.2, 6613.33, 6623.45]
              },
              {
                x: 1538811000000,
                y: [6623.48, 6627, 6618.38, 6620.35]
              },
              {
                x: 1538812800000,
                y: [6619.43, 6620.35, 6610.05, 6615.53]
              },
              {
                x: 1538814600000,
                y: [6615.53, 6617.93, 6610, 6615.19]
              },
              {
                x: 1538816400000,
                y: [6615.19, 6621.6, 6608.2, 6620]
              },
              {
                x: 1538818200000,
                y: [6619.54, 6625.17, 6614.15, 6620]
              },
              {
                x: 1538820000000,
                y: [6620.33, 6634.15, 6617.24, 6624.61]
              },
              {
                x: 1538821800000,
                y: [6625.95, 6626, 6611.66, 6617.58]
              },
              {
                x: 1538823600000,
                y: [6619, 6625.97, 6595.27, 6598.86]
              },
              {
                x: 1538825400000,
                y: [6598.86, 6598.88, 6570, 6587.16]
              },
              {
                x: 1538827200000,
                y: [6588.86, 6600, 6580, 6593.4]
              },
              {
                x: 1538829000000,
                y: [6593.99, 6598.89, 6585, 6587.81]
              },
              {
                x: 1538830800000,
                y: [6587.81, 6592.73, 6567.14, 6578]
              },
              {
                x: 1538832600000,
                y: [6578.35, 6581.72, 6567.39, 6579]
              },
              {
                x: 1538834400000,
                y: [6579.38, 6580.92, 6566.77, 6575.96]
              },
              {
                x: 1538836200000,
                y: [6575.96, 6589, 6571.77, 6588.92]
              },
              {
                x: 1538838000000,
                y: [6588.92, 6594, 6577.55, 6589.22]
              },
              {
                x: 1538839800000,
                y: [6589.3, 6598.89, 6589.1, 6596.08]
              },
              {
                x: 1538841600000,
                y: [6597.5, 6600, 6588.39, 6596.25]
              },
              {
                x: 1538843400000,
                y: [6598.03, 6600, 6588.73, 6595.97]
              },
              {
                x: 1538845200000,
                y: [6595.97, 6602.01, 6588.17, 6602]
              },
              {
                x: 1538847000000,
                y: [6602, 6607, 6596.51, 6599.95]
              },
              {
                x: 1538848800000,
                y: [6600.63, 6601.21, 6590.39, 6591.02]
              },
              {
                x: 1538850600000,
                y: [6591.02, 6603.08, 6591, 6591]
              },
              {
                x: 1538852400000,
                y: [6591, 6601.32, 6585, 6592]
              },
              {
                x: 1538854200000,
                y: [6593.13, 6596.01, 6590, 6593.34]
              },
              {
                x: 1538856000000,
                y: [6593.34, 6604.76, 6582.63, 6593.86]
              },
              {
                x: 1538857800000,
                y: [6593.86, 6604.28, 6586.57, 6600.01]
              },
              {
                x: 1538859600000,
                y: [6601.81, 6603.21, 6592.78, 6596.25]
              },
              {
                x: 1538861400000,
                y: [6596.25, 6604.2, 6590, 6602.99]
              },
              {
                x: 1538863200000,
                y: [6602.99, 6606, 6584.99, 6587.81]
              },
              {
                x: 1538865000000,
                y: [6587.81, 6595, 6583.27, 6591.96]
              },
              {
                x: 1538866800000,
                y: [6591.97, 6596.07, 6585, 6588.39]
              },
              {
                x: 1538868600000,
                y: [6587.6, 6598.21, 6587.6, 6594.27]
              },
              {
                x: 1538870400000,
                y: [6596.44, 6601, 6590, 6596.55]
              },
              {
                x: 1538872200000,
                y: [6598.91, 6605, 6596.61, 6600.02]
              },
              {
                x: 1538874000000,
                y: [6600.55, 6605, 6589.14, 6593.01]
              },
              {
                x: 1538875800000,
                y: [6593.15, 6605, 6592, 6603.06]
              },
              {
                x: 1538877600000,
                y: [6603.07, 6604.5, 6599.09, 6603.89]
              },
              {
                x: 1538879400000,
                y: [6604.44, 6604.44, 6600, 6603.5]
              },
              {
                x: 1538881200000,
                y: [6603.5, 6603.99, 6597.5, 6603.86]
              },
              {
                x: 1538883000000,
                y: [6603.85, 6605, 6600, 6604.07]
              },
              {
                x: 1538884800000,
                y: [6604.98, 6606, 6604.07, 6606]
              },
            ],
          }}
          seriesOptions={{
            1: {
              markerOptions: {
                customOptions: {
                  doesCompliment: false,
                  customRenderFunction: (ctx, datum) => {
                    const sticksPath = new Path2D()
                    sticksPath.moveTo(datum.fpX, datum.pY[0]) // open
                    sticksPath.lineTo(datum.fpX, datum.pY[1]) // high

                    sticksPath.moveTo(datum.fpX, datum.pY[3]) // close
                    sticksPath.lineTo(datum.fpX, datum.pY[2]) // low

                    const boxWidth = 6

                    const halfBoxWith = boxWidth / 2

                    const boxRect = new Path2D()
                    boxRect.rect(datum.fpX - halfBoxWith, Math.min(datum.pY[0], datum.pY[3]), boxWidth, Math.abs(datum.pY[0] - datum.pY[3]))

                    const isLoss = datum.vY[0] > datum.vY[3]
                    ctx.strokeStyle = isLoss ? 'red' : 'green'
                    ctx.fillStyle = isLoss ? 'red' : 'green'

                    ctx.lineWidth = 2
                    ctx.stroke(sticksPath)
                    ctx.fill(boxRect)
                  }
                }
              },
            }
          }}
          visibilityOptions={{
            showDatumHighlight: false,
          }}
        />
      </div>

      <div className="sandbox">
        <h3>DARK MODE (with error bars)!</h3>
        <Graph
          heightPx={700}
          widthPx={700}
          series={{
            1: data1WithErrorBars,
            2: data2,
          }}
          seriesOptions={{
            1: {
              lineOptions: {
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
              lineOptions: {
                color: 'blue',
              },
              markerOptions: {
                color: 'blue',
              },
            },
          }}
          axesOptions={{
            [Axis2D.X]: {
              labelText: 'value of x',
              cursorPositionLineOptions: {
                dashPattern: [],
                color: 'white',
                lineWidth: 1,
              },
            },
            [Axis2D.Y]: {
              labelText: 'f(x)',
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
          axesMarkerLabelOptions={{
            color: 'white',
          }}
          axesMarkerLineOptions={{
            color: 'white',
          }}
          axesLineOptions={{
            color: 'white',
          }}
          gridLineOptions={{
            color: 'white',
          }}
          markerOptions={{
            type: MarkerType.CROSS,
            size: 8,
          }}
          tooltipOptions={{
            backgroundColor: '#666',
            textColor: 'white',
            borderLineColor: '#999',
          }}
          visibilityOptions={{
            showConnectingLine: true,
          }}
          datumSnapOptions={{
            mode: DatumSnapMode.SNAP_NEAREST_X_Y,
            distanceThresholdPx: 30,
          }}
          datumHighlightOptions={{
            type: DatumHighlightAppearanceType.CIRCLE,
            color: 'white',
            lineWidth: 2,
          }}
        />
      </div>
    </div>
  )
}

export default render
