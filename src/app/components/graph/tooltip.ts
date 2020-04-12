import { Point2D } from '../../common/types/geometry'
import Options from './types/Options'
import { mapDict, findEntryOfMaxValue, combineDicts } from '../../common/helpers/dict'
import { measureTextWidth, measureTextLineHeight, createTextStyle, createRoundedRect } from '../../common/helpers/canvas'
import PositionedDatum from './types/PositionedDatum'

export const draw = (
  ctx: CanvasRenderingContext2D,
  cursorPoint: Point2D,
  highlightedDatums: { [seriesKey: string]: PositionedDatum },
  props: Options,
) => {
  const numSeries = Object.keys(highlightedDatums).length
  if (numSeries === 0)
    return
  // Create series key label texts and widths
  const seriesKeyLabels = mapDict(highlightedDatums, seriesKey => `${seriesKey}: `)
  const seriesKeyLabelWidths = mapDict(seriesKeyLabels, (_, label) => measureTextWidth(ctx, label))
  // Create value texts and widths
  const valueTexts = mapDict(highlightedDatums, (_, { vY }) => (typeof vY === 'number' ? vY : vY[0]).toString())
  const valueTextWidths = mapDict(valueTexts, (_, value) => measureTextWidth(ctx, value))
  // Create line texts and widths
  const lineWidths = combineDicts(seriesKeyLabelWidths, valueTextWidths, (_, w1, w2) => w1 + w2)
  const largestLineWidth = findEntryOfMaxValue(lineWidths).value

  const lineVerticalPadding = 5
  const lineHeight = measureTextLineHeight(ctx) + lineVerticalPadding

  const boxPadding = 20

  const height = (numSeries * lineHeight) + (2 * boxPadding)
  const width = largestLineWidth + (2 * boxPadding)

  const x = cursorPoint.x + 5
  const y = cursorPoint.y - (height / 2)

  const boxPath = createRoundedRect(x, y, width, height, 3)
  ctx.lineWidth = 1
  ctx.strokeStyle = '#333'
  ctx.fillStyle = '#f0f0f0'
  ctx.stroke(boxPath)
  ctx.fill(boxPath)
  const lineTextX = x + boxPadding
  const lineTextInitialY = y + boxPadding
  ctx.fillStyle = 'black'
  Object.entries(seriesKeyLabels).forEach(([seriesKey, labelText], i) => {
    const textY = lineTextInitialY + (i * lineHeight)
    ctx.font = createTextStyle('Helvetica', 12, false)
    ctx.fillText(labelText, lineTextX, textY)
    ctx.font = createTextStyle('Helvetica', 12, true)
    ctx.fillText(valueTexts[seriesKey], lineTextX + seriesKeyLabelWidths[seriesKey], textY)
  })
}

export default draw
