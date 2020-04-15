import React from 'react'
import Graph from '../../../../../app/components/graph'
import DatumFocusPointDeterminationMode from '../../../../../app/components/graph/types/DatumFocusPointDeterminationMode'
import { Axis2D } from '../../../../../app/common/types/geometry'

export const Candlestick = () => {
  return (
    <div className="graph">
      <h2>Candlestick graphs</h2>

      <div className="sandbox">
        <h3>Standard</h3>
        <Graph
          heightPx={700}
          widthPx={700}
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
                x: 1,
                y: [6629.81, 6650.5, 6623.04, 6633.33]
              },
              {
                x: 2,
                y: [6632.01, 6643.59, 6620, 6630.11]
              },
              {
                x: 3,
                y: [6630.71, 6648.95, 6623.34, 6635.65]
              },
              {
                x: 4,
                y: [6635.65, 6651, 6629.67, 6638.24]
              },
              {
                x: 5,
                y: [6638.24, 6640, 6620, 6624.47]
              },
              {
                x: 6,
                y: [6624.53, 6636.03, 6621.68, 6624.31]
              },
              {
                x: 7,
                y: [6624.61, 6632.2, 6617, 6626.02]
              },
              {
                x: 8,
                y: [6627, 6627.62, 6584.22, 6603.02]
              },
              {
                x: 9,
                y: [6605, 6608.03, 6598.95, 6604.01]
              },
              {
                x: 10,
                y: [6604.5, 6614.4, 6602.26, 6608.02]
              },
              {
                x: 11,
                y: [6608.02, 6610.68, 6601.99, 6608.91]
              },
              {
                x: 12,
                y: [6608.91, 6618.99, 6608.01, 6612]
              },
              {
                x: 13,
                y: [6612, 6615.13, 6605.09, 6612]
              },
              {
                x: 14,
                y: [6612, 6624.12, 6608.43, 6622.95]
              },
              {
                x: 15,
                y: [6623.91, 6623.91, 6615, 6615.67]
              },
              {
                x: 16,
                y: [6618.69, 6618.74, 6610, 6610.4]
              },
              {
                x: 17,
                y: [6611, 6622.78, 6610.4, 6614.9]
              },
              {
                x: 18,
                y: [6614.9, 6626.2, 6613.33, 6623.45]
              },
              {
                x: 19,
                y: [6623.48, 6627, 6618.38, 6620.35]
              },
              {
                x: 20,
                y: [6619.43, 6620.35, 6610.05, 6615.53]
              },
              {
                x: 21,
                y: [6615.53, 6617.93, 6610, 6615.19]
              },
              {
                x: 22,
                y: [6615.19, 6621.6, 6608.2, 6620]
              },
              {
                x: 23,
                y: [6619.54, 6625.17, 6614.15, 6620]
              },
              {
                x: 24,
                y: [6620.33, 6634.15, 6617.24, 6624.61]
              },
              {
                x: 25,
                y: [6625.95, 6626, 6611.66, 6617.58]
              },
              {
                x: 26,
                y: [6619, 6625.97, 6595.27, 6598.86]
              },
              {
                x: 27,
                y: [6598.86, 6598.88, 6570, 6587.16]
              },
              {
                x: 28,
                y: [6588.86, 6600, 6580, 6593.4]
              },
              {
                x: 29,
                y: [6593.99, 6598.89, 6585, 6587.81]
              },
              {
                x: 30,
                y: [6587.81, 6592.73, 6567.14, 6578]
              },
              {
                x: 31,
                y: [6578.35, 6581.72, 6567.39, 6579]
              },
              {
                x: 32,
                y: [6579.38, 6580.92, 6566.77, 6575.96]
              },
              {
                x: 33,
                y: [6575.96, 6589, 6571.77, 6588.92]
              },
              {
                x: 34,
                y: [6588.92, 6594, 6577.55, 6589.22]
              },
              {
                x: 35,
                y: [6589.3, 6598.89, 6589.1, 6596.08]
              },
              {
                x: 36,
                y: [6597.5, 6600, 6588.39, 6596.25]
              },
              {
                x: 37,
                y: [6598.03, 6600, 6588.73, 6595.97]
              },
              {
                x: 38,
                y: [6595.97, 6602.01, 6588.17, 6602]
              },
              {
                x: 39,
                y: [6602, 6607, 6596.51, 6599.95]
              },
              {
                x: 40,
                y: [6600.63, 6601.21, 6590.39, 6591.02]
              },
              {
                x: 41,
                y: [6591.02, 6603.08, 6591, 6591]
              },
              {
                x: 42,
                y: [6591, 6601.32, 6585, 6592]
              },
              {
                x: 43,
                y: [6593.13, 6596.01, 6590, 6593.34]
              },
              {
                x: 44,
                y: [6593.34, 6604.76, 6582.63, 6593.86]
              },
              {
                x: 45,
                y: [6593.86, 6604.28, 6586.57, 6600.01]
              },
              {
                x: 46,
                y: [6601.81, 6603.21, 6592.78, 6596.25]
              },
              {
                x: 47,
                y: [6596.25, 6604.2, 6590, 6602.99]
              },
              {
                x: 48,
                y: [6602.99, 6606, 6584.99, 6587.81]
              },
              {
                x: 49,
                y: [6587.81, 6595, 6583.27, 6591.96]
              },
              {
                x: 50,
                y: [6591.97, 6596.07, 6585, 6588.39]
              },
              {
                x: 51,
                y: [6587.6, 6598.21, 6587.6, 6594.27]
              },
              {
                x: 52,
                y: [6596.44, 6601, 6590, 6596.55]
              },
              {
                x: 53,
                y: [6598.91, 6605, 6596.61, 6600.02]
              },
              {
                x: 54,
                y: [6600.55, 6605, 6589.14, 6593.01]
              },
              {
                x: 55,
                y: [6593.15, 6605, 6592, 6603.06]
              },
              {
                x: 56,
                y: [6603.07, 6604.5, 6599.09, 6603.89]
              },
              {
                x: 57,
                y: [6604.44, 6604.44, 6600, 6603.5]
              },
              {
                x: 58,
                y: [6603.5, 6603.99, 6597.5, 6603.86]
              },
              {
                x: 59,
                y: [6603.85, 6605, 6600, 6604.07]
              },
              {
                x: 60,
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

                    ctx.lineWidth = 1
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
    </div>
  )
}

export default Candlestick
