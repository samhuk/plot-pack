import { Point2D } from '../../common/types/geometry'
import Options from './types/Options'
import { mapDict, findEntryOfMaxValue, combineDicts } from '../../common/helpers/dict'
import { measureTextWidth, measureTextLineHeight, createTextStyle, createRoundedRect } from '../../common/helpers/canvas'
import PositionedDatum from './types/PositionedDatum'

export const draw = (
  ctx: CanvasRenderingContext2D,
  cursorPoint: Point2D,
  highlightedDatums: { [seriesKey: string]: PositionedDatum },
  nearestDatumOfAllSeries: PositionedDatum,
  props: Options,
) => {
  const numSeries = Object.keys(highlightedDatums).length
  if (numSeries === 0)
    return

  // Set font early such that we can measure text according to the preferences
  ctx.font = createTextStyle('Helvetica', 12, true)

  // Create series key label texts and widths
  const seriesKeyLabels = mapDict(highlightedDatums, seriesKey => `${seriesKey}: `)
  const seriesKeyLabelWidths = mapDict(seriesKeyLabels, (_, label) => measureTextWidth(ctx, label))
  // Create value texts and widths
  const valueTexts = mapDict(highlightedDatums, (_, { vY }) => (typeof vY === 'number' ? vY : vY[0]).toString())
  const valueTextWidths = mapDict(valueTexts, (_, value) => measureTextWidth(ctx, value))
  // Create x value text and width
  const xValueLabelText = nearestDatumOfAllSeries.vX.toString()
  const xValueLabelTextWidth = measureTextWidth(ctx, xValueLabelText)
  // Create line texts and widths
  const lineWidths = combineDicts(seriesKeyLabelWidths, valueTextWidths, (_, w1, w2) => w1 + w2)
  const largestLineWidth = Math.max(xValueLabelTextWidth, findEntryOfMaxValue(lineWidths).value)
  // Measure line height
  const lineVerticalPadding = 5
  const lineHeight = measureTextLineHeight(ctx) + lineVerticalPadding

  const boxPaddingX = 10
  const boxPaddingY = 10

  const boxHeight = (numSeries * lineHeight) + (2 * boxPaddingY)
  const boxWidth = largestLineWidth + (2 * boxPaddingX)

  // Try placing on RHS
  let prospectiveBoxX = cursorPoint.x + 5
  // Determine if the box is overflowing on the RHS
  const rhsOverflow = Math.max(0, prospectiveBoxX + boxWidth - props.widthPx)
  // If not overflowing, remain on RHS, else try placing on LHS
  prospectiveBoxX = rhsOverflow === 0 ? prospectiveBoxX : cursorPoint.x - 5 - boxWidth
  // If not overflowing, remain on LHS, else place in the middle
  const boxX = prospectiveBoxX > 0 ? prospectiveBoxX : cursorPoint.x - (boxWidth / 2)

  // Place vertically centered, ensuring that it doesn't overflow at the top (negative y position)
  const boxY = Math.max(0, cursorPoint.y - (boxHeight / 2))

  const boxPath = createRoundedRect(boxX, boxY, boxWidth, boxHeight, 3)

  ctx.lineWidth = 1
  ctx.strokeStyle = '#333'
  ctx.fillStyle = '#f0f0f0'

  ctx.stroke(boxPath)
  ctx.fill(boxPath)

  const lineTextX = boxX + boxPaddingX
  const lineTextInitialY = boxY + boxPaddingY + lineHeight - lineVerticalPadding

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
