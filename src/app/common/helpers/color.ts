/* eslint-disable no-bitwise, no-mixed-operators, prefer-template, no-nested-ternary */
import { Color } from '../types/color'

export const colorClassMap: { [color in Color]: string } = {
  [Color.BLUE]: 'blue',
  [Color.GREEN]: 'green',
  [Color.GREY]: 'grey',
  [Color.RED]: 'red',
  [Color.ORANGE]: 'orange',
  [Color.WHITE]: 'white',
  [Color.BLACK]: 'black',
  [Color.YELLOW]: 'yellow',
}

export const colorHexMap: { [color in Color]: string } = {
  [Color.BLUE]: '#bae1ff',
  [Color.GREEN]: '#baffc9',
  [Color.GREY]: 'grey',
  [Color.RED]: '#ffb3ba',
  [Color.ORANGE]: '#ffdfba',
  [Color.YELLOW]: '#ffffba',
  [Color.WHITE]: 'white',
  [Color.BLACK]: 'black',
}

export const lighten = (colorHex: string, percent: number) => {
  const num = parseInt(colorHex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const B = (num >> 8 & 0x00FF) + amt
  const G = (num & 0x0000FF) + amt
  return '#' + (
    0x1000000
    + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000
    + (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100
    + (G < 255 ? (G < 1 ? 0 : G) : 255)
  ).toString(16).slice(1)
}
