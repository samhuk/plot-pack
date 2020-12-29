/* eslint-disable no-bitwise, no-mixed-operators, prefer-template, no-nested-ternary */
import { Color } from '../types/color'
import { cssNamedColorMapToHexCode } from './cssNamedColorMap'

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

export const hexToRgb = (hex: string) => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const _hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(_hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null
}

export const convertHexAndOpacityToRgba = (hex: string, opacity: number = 1) => {
  if (hex == null)
    return null

  const { r, g, b } = hexToRgb(hex)

  return opacity == null || opacity === 1
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export const normalizeCssColorToHex = (color: string) => {
  if (color == null || color.length < 2)
    return null

  const _color = color.trim()

  return _color.charAt(0) === '#' ? _color.substring(0, 7) : cssNamedColorMapToHexCode[_color]
}

export const convertCssColorAndOpacityToRgba = (color: string, opacity: number = 1) => (
  convertHexAndOpacityToRgba(normalizeCssColorToHex(color), opacity)
)
