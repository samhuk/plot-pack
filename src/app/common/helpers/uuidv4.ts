/* eslint-disable no-bitwise */
import crypto from 'crypto'

const byteToHex: { [key: number]: string } = []
for (let i = 0; i < 256; i += 1)
  byteToHex[i] = (i + 0x100).toString(16).substr(1)

const bytesToUuid = (buf: any) => {
  let i = 0
  const bth = byteToHex
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return [
    bth[buf[i += 1]],
    bth[buf[i += 1]],
    bth[buf[i += 1]],
    bth[buf[i += 1]],
    '-',
    bth[buf[i += 1]],
    bth[buf[i += 1]],
    '-',
    bth[buf[i += 1]],
    bth[buf[i += 1]],
    '-',
    bth[buf[i += 1]],
    bth[buf[i += 1]],
    '-',
    bth[buf[i += 1]],
    bth[buf[i += 1]],
    bth[buf[i += 1]],
    bth[buf[i += 1]],
    bth[buf[i += 1]],
    bth[buf[i += 1]],
  ].join('')
}

export const v4 = () => {
  const rnds = crypto.randomBytes(16)

  rnds[6] = (rnds[6] & 0x0f) | 0x40
  rnds[8] = (rnds[8] & 0x3f) | 0x80

  return bytesToUuid(rnds)
}

export default v4
