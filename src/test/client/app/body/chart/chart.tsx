import React, { useState } from 'react'

import Chart from '../../../../../app/components/chart/react'
import { Axis2D, Point2D } from '../../../../../app/common/types/geometry'
import { NumberFormatNotation } from '../../../../../app/common/types/math'
import BestFitLine from '../../../../../app/components/chart/types/BestFitLineType'
import MarkerType from '../../../../../app/components/chart/types/MarkerType'
import XAxisOrientation from '../../../../../app/components/chart/types/xAxisOrientation'
import YAxisOrientation from '../../../../../app/components/chart/types/yAxisOrientation'
import DatumSnapMode from '../../../../../app/components/chart/types/DatumSnapMode'
import { DatumHighlightAppearanceType } from '../../../../../app/components/chart/types/DatumHighlightAppearanceType'

export const render = () => {
  const [height, setHeight] = useState(500)
  const [width, setWidth] = useState(500)
  const [xMax, setXMax] = useState(20)
  const [numPoints, setNumPoints] = useState(20)
  const [axesMargin, setAxesMargin] = useState(10)
  const [forceVu, setForceVu] = useState(false)
  const [forceVl, setForceVl] = useState(false)
  const [vu, setVu] = useState(20)
  const [vl, setVl] = useState(-20)

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

  const data3 = []
  for (let i = 1; i < 1000; i += 1)
    data3.push({ x: i, y: Math.log(i) })

  const data4: Point2D[] = []
  for (let i = 1; i < 1000; i += 1)
    data4.push({ x: i, y: (data4[i - 2]?.y ?? 0) + (1 / i) })

  const randomData1: Point2D[] = []
  for (let i = 1; i < 50; i += 1)
    randomData1.push({ x: Math.random(), y: Math.random() })

  /* eslint-disable object-curly-newline */
  return (
    <div className="chart">
      <h2>Chart</h2>

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
        <br />
        Axes Margin:
        <input type="number" min="0" value={axesMargin} onChange={e => setAxesMargin(parseInt(e.target.value))} />
        <br />
        Force upper x:
        <input type="checkbox" checked={forceVu} onChange={e => setForceVu(e.target.checked)} />
        Force lower x:
        <input type="checkbox" checked={forceVl} onChange={e => setForceVl(e.target.checked)} />
        upper x:
        <input type="number" value={vu} onChange={e => setVu(parseInt(e.target.value))} />
        lower x:
        <input type="number" value={vl} onChange={e => setVl(parseInt(e.target.value))} />
        <Chart
          height={height}
          width={width}
          title="This is the title for the chart"
          titleOptions={{
            color: 'blue',
            fontSize: 22,
            margin: { top: 20 },
            fontFamily: 'Times New Roman',
          }}
          series={{
            1: data1,
            2: data2,
          }}
          chartMargin={axesMargin}
          seriesOptions={{
            1: {
              visibilityOptions: {
                showConnectingLine: true,
              },
              connectingLineOptions: {
                color: 'red',
                lineWidth: 2,
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
              notation: NumberFormatNotation.DECIMAL,
              numFigures: 2,
              lineOptions: {
                color: '#333',
              },
              markerLineOptions: {
                color: '#333',
              },
              markerLabelOptions: {
                color: '#333',
              },
              orientation: YAxisOrientation.ORIGIN,
              markerOrientation: null,
              visibilityOptions: {
                showCursorPositionLine: true,
                showCursorPositionValueLabel: true,
              },
            },
            [Axis2D.X]: {
              valueBound: {
                lower: forceVl ? vl : null,
                upper: forceVu ? vu : null,
              },
              labelText: 'This is the X Axis',
              // dvGrid: 0.5,
              // valueBound: { lower: -1.25, upper: 5 },
              notation: NumberFormatNotation.DECIMAL,
              numFigures: 2,
              lineOptions: {
                color: '#333',
              },
              markerLineOptions: {
                color: '#333',
              },
              orientation: XAxisOrientation.ORIGIN,
              markerOrientation: null,
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
            showStraightLineOfBestFit: true,
          }}
          tooltipOptions={{
            visibilityOptions: {
              showXValueTitle: true,
              showXValueTitleDivider: true,
            },
            boxPaddingX: null,
            boxPaddingY: null,
            fontSize: 14,
            borderRadius: 10,
            backgroundColor: '#333',
            textColor: 'white',
            borderLineColor: '#999',
            xValueLabelTextOptions: {
              color: 'white',
            },
            xValueLabelDividerOptions: {
              color: 'white',
              dashPattern: [],
            },
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
        <Chart
          height={height}
          width={width}
          series={{
            1: data3,
            2: data4,
          }}
          seriesOptions={{
            1: {
              connectingLineOptions: {
                color: 'red',
                lineWidth: 2,
              },
            },
            2: {
              connectingLineOptions: {
                color: 'blue',
                lineWidth: 2,
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
        <Chart
          height={height}
          width={width}
          series={{
            1: data1,
            2: data2,
          }}
        />
      </div>

      <div className="sandbox">
        <h3>Some random data</h3>
        <Chart
          height={height}
          width={width}
          series={{
            1: randomData1,
          }}
          seriesOptions={{
            1: {
              visibilityOptions: {
                showConnectingLine: true,
                showStraightLineOfBestFit: true,
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export default render
