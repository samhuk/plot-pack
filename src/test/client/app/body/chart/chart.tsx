import React, { useState } from 'react'

import Chart from '../../../../../app/components/chart/react'
import { AngleUnits, Axis2D, Point2D, RectHorizontalAlign, RectVerticalAlign } from '../../../../../app/common/types/geometry'
import { NumberFormatNotation } from '../../../../../app/common/types/math'
import BestFitLine from '../../../../../app/components/chart/types/BestFitLineType'
import MarkerType from '../../../../../app/components/chart/types/MarkerType'
import XAxisOrientation from '../../../../../app/components/chart/types/xAxisOrientation'
import YAxisOrientation from '../../../../../app/components/chart/types/yAxisOrientation'
import DatumSnapMode from '../../../../../app/components/chart/types/DatumSnapMode'
import { DatumHighlightType } from '../../../../../app/components/chart/types/DatumHighlightType'
import AnnotationType from '../../../../../app/components/chart/types/AnnotationType'

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

  const data5: Point2D[] = []
  for (let i = 1; i < 1000; i += 1)
    data5.push({ x: i, y: Math.exp(i / 500) })

  const data6: Point2D[] = []
  for (let i = 1; i < 1000; i += 1)
    data6.push({ x: i, y: i / 500 })

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
              labelOptions: {
                fontSize: 18,
                color: 'purple',
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
                textOptions: {
                  fontSize: 20,
                  color: 'red',
                },
                rectOptions: {
                  fillOptions: { color: 'white' },
                  borderColor: 'blue',
                  borderRadii: { topLeft: 10, topRight: 10 },
                  borderLineWidth: 5,
                },
                padding: 10,
              },
            },
          }}
          annotationsOptions={{
            annotationOptionsList: [
              {
                type: AnnotationType.RANGE,
                axesValueBound: {
                  x: { lower: 1, upper: 12 },
                  y: { lower: 5, upper: 16 },
                },
                rectOptions: {
                  stroke: true,
                  fill: true,
                  fillOptions: {
                    color: 'green',
                    opacity: 0.2,
                  },
                  borderDashPattern: { top: [5, 5], right: [3, 3] },
                  borderColor: { top: 'red', right: 'green', bottom: 'blue', left: 'purple' },
                  borderLineWidth: 3,
                  borderRadii: { topLeft: 20, topRight: 10, bottomLeft: 5, bottomRight: 15 },
                },
                labelOptions: {
                  text: 'A range annotation!',
                  horizontalAlign: RectHorizontalAlign.CENTER,
                  verticalAlign: RectVerticalAlign.TOP_INSIDE,
                  offsetY: 10,
                  textOptions: {
                    fontSize: 16,
                    fontFamily: 'Tahoma',
                    color: 'purple',
                    italic: true,
                  },
                },
              },
              {
                type: AnnotationType.RANGE,
                axesValueBound: {
                  x: { lower: 0, upper: null },
                  y: { lower: -10, upper: -3 },
                },
                labelOptions: {
                  text: 'Y-Axis sink region',
                },
              },
              {
                type: AnnotationType.RANGE,
                axesValueBound: {
                  x: { lower: null, upper: 0 },
                  y: { lower: null, upper: 0 },
                },
                labelOptions: {
                  text: 'All negative region',
                },
              },
              {
                type: AnnotationType.VALUE_TEXT,
                textLabelOptions: {
                  text: 'A value text annotation',
                  backgroundRectOptions: {
                    draw: true,
                    stroke: false,
                    fillOptions: {
                      opacity: 0.5,
                    },
                  },
                  offsetVector: {
                    radius: 15,
                    direction: { angle: 20, angleUnits: AngleUnits.DEGREES },
                  },
                },
                value: { x: 3.5, y: -7.61 },
              },
            ],
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
              showXValue: true,
              showXValueDivider: true,
              showYSeriesPreviewColumn: true,
            },
            rectOptions: {
              borderColor: 'pink',
              borderLineWidth: 8,
              borderRadii: 8,
              fillOptions: {
                color: 'yellow',
              },
              fill: true,
              stroke: true,
              padding: 30,
              shadow: true,
              shadowOptions: {
                color: 'black',
                opacity: 1,
                blurDistance: 10,
                offsetX: 10,
                offsetY: 10,
              },
            },
            xValueOptions: {
              color: 'teal',
              fontSize: 22,
            },
            xValueDividerOptions: {
              color: 'red',
              lineWidth: 5,
              dashPattern: [2, 2],
            },
            yDataRowOptions: {
              verticalSpacing: 10,
            },
            yLabelOptions: {
              color: 'purple',
              fontSize: 20,
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
            type: DatumHighlightType.CROSSHAIR,
            hairLength: 10,
            lineOptions: {
              lineWidth: 2,
              color: 'blue',
            },
          }}
          navigatorOptions={{
            boundBoxOptions: {
              stroke: { bottom: true },
              borderColor: 'red',
              fillOptions: {
                color: 'red',
              },
            },
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
            3: data5,
            4: data6,
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
            3: {
              connectingLineOptions: {
                color: 'green',
                lineWidth: 2,
              },
            },
            4: {
              connectingLineOptions: {
                color: 'purple',
                lineWidth: 2,
              },
            },
          }}
          tooltipOptions={{
            visibilityOptions: {
              showXValue: true,
              showXValueDivider: true,
            },
          }}
          visibilityOptions={{
            showMarkers: false,
            showConnectingLine: true,
            showStraightLineOfBestFit: false,
            showDatumHighlight: true,
          }}
          datumHighlightOptions={{
            drawOptions: {
              fill: true,
              stroke: false,
              fillOptions: {
                opacity: 0.4,
              },
            },
            type: DatumHighlightType.CIRCLE,
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
