import { FitTextLineResult, TextSizeMeasurer, FitTextResult } from '../types/textWrap'

const overflowText = (
  text: string,
  maxWidth: number,
  measureText: TextSizeMeasurer,
  trimText: string = '...',
): FitTextLineResult => {
  let shortenedText = ''
  let charIndex = 0
  let shortenedTextWidth = measureText(shortenedText).width
  while (charIndex < text.length && shortenedTextWidth < maxWidth) {
    shortenedText += text[charIndex]
    shortenedTextWidth = measureText(shortenedText).width
    charIndex += 1
  }
  // If text didn't fit the width, add on the trim text
  if (charIndex < text.length) {
    // Work backwards to determine how many chars to lose to make space for trim text
    while (charIndex > 0 && shortenedTextWidth > maxWidth) {
      charIndex -= 1
      shortenedText = shortenedText.slice(0, charIndex) + trimText
      shortenedTextWidth = measureText(shortenedText).width
    }
  }

  return { text: shortenedText, width: shortenedTextWidth, numCharsOverflowed: text.length - charIndex }
}

export const fitText = (
  text: string,
  maxWidth: number,
  maxHeight: number,
  measureText: TextSizeMeasurer,
  trimText: string = '...',
): FitTextResult => {
  const textSizeMeasurement = measureText(text)
  const initialTextWidth = textSizeMeasurement.width

  // If all text fits on a single line, then simply return one line, no overflowing
  if (initialTextWidth < maxWidth) {
    return {
      textLines: [{ text, width: initialTextWidth, numCharsOverflowed: 0 }],
      width: initialTextWidth,
      numCharsOverflowed: 0,
    }
  }

  const numLines = Math.floor(maxHeight / textSizeMeasurement.height)

  // If text doesn't fit line but we only have one line, then return one overflowed line
  if (numLines === 1) {
    const overflowedText = overflowText(text, maxWidth, measureText, trimText)
    return {
      textLines: [overflowedText],
      width: overflowedText.width,
      numCharsOverflowed: overflowedText.numCharsOverflowed,
    }
  }

  // Begin incrementally wrapping text onto new lines
  const words = text.split(' ').map(w => w.trim())
  const fittedTextLineResults: FitTextLineResult[] = []
  let wordIndex = 0
  /* Iterate over the lines apart from the last one, since any remaining
   * text post-wrapping will be overflowed.
   */
  for (let lineIndex = 0; lineIndex < numLines - 1; lineIndex += 1) {
    let lineText = ''
    let lineWidth = 0
    let currentWordsOnLine = 0
    let noMoreWordsFit = false
    while (!noMoreWordsFit && wordIndex < words.length) {
      const prospectiveNewLine = `${lineText} ${words[wordIndex]}`
      const newLineWidth = measureText(prospectiveNewLine).width
      if (newLineWidth < maxWidth) {
        wordIndex += 1
        currentWordsOnLine += 1
        lineWidth = newLineWidth
        lineText = prospectiveNewLine
      }
      else {
        noMoreWordsFit = true
      }
    }

    /*
     * This is the case for if the current word, on it's own, did not fit on a line.
     * Therefore, it cannot be wrapped, and must be overflowed in the current line.
     * If we didn't do this, then the above for-loop would continue trying to place
     * it into every single line, failing every time.
     */
    let numCharsOverflowed = 0
    if (currentWordsOnLine === 0 && wordIndex < words.length) {
      const overflowedText = overflowText(words[wordIndex], maxWidth, measureText, trimText)
      lineText = overflowedText.text
      lineWidth = overflowedText.width
      numCharsOverflowed = overflowedText.numCharsOverflowed
      wordIndex += 1
    }

    // Add the resulting line info to array
    fittedTextLineResults.push({
      text: lineText.trim(),
      width: lineWidth,
      numCharsOverflowed,
    })
  }

  // Overflow any remaining text into the last line
  const remainingText = wordIndex < words.length ? words.slice(wordIndex).join(' ').trim() : null
  if (remainingText?.length > 0)
    fittedTextLineResults.push(overflowText(remainingText, maxWidth, measureText, trimText))

  return {
    textLines: fittedTextLineResults,
    width: Math.max(...fittedTextLineResults.map(l => l.width)),
    numCharsOverflowed: fittedTextLineResults.reduce((acc, l) => acc + l.numCharsOverflowed, 0),
  }
}
