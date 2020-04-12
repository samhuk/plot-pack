export const mapDict = <T, R>(
  dict: { [key: string]: T },
  fn: (key: string, value: T) => R,
): { [key: string]: R } => {
  if (dict == null || fn == null)
    return null

  const outputDict: { [key: string]: R } = {}
  Object.entries(dict).forEach(([key, value]) => outputDict[key] = fn(key, value))
  return outputDict
}

export const findEntryOfMinValue = (dict: { [key: string]: number }): { key: string, value: number } => {
  if (dict == null)
    return null

  const entries = Object.entries(dict)
  let keyOfMinValue = entries[0][0]
  let minValue = entries[0][1]
  if (entries.length === 1)
    return { key: keyOfMinValue, value: minValue }

  for (let i = 1; i < entries.length; i += 1) {
    if (entries[i][1] < minValue)
      [keyOfMinValue, minValue] = entries[i]
  }

  return { key: keyOfMinValue, value: minValue }
}

export const findEntryOfMaxValue = (dict: { [key: string]: number }): { key: string, value: number } => {
  if (dict == null)
    return null

  const entries = Object.entries(dict)

  if (entries.length === 0)
    return null

  let keyOfMaxValue = entries[0][0]
  let maxValue = entries[0][1]

  if (entries.length === 1)
    return { key: keyOfMaxValue, value: maxValue }

  for (let i = 1; i < entries.length; i += 1) {
    if (entries[i][1] > maxValue)
      [keyOfMaxValue, maxValue] = entries[i]
  }

  return { key: keyOfMaxValue, value: maxValue }
}

export const combineDicts = <T1, T2, R>(
  dict1: { [key: string]: T1 },
  dict2: { [key: string]: T2 },
  fn: (key: string, value1: T1, value2: T2) => R,
): { [key: string]: R } => {
  if (dict1 == null || dict2 == null)
    return null

  const outputDict: { [key: string]: R } = {}
  Object.entries(dict1).forEach(([key, value]) => outputDict[key] = fn(key, value, dict2[key]))
  return outputDict
}

export const filterDict = <T>(
  dict: { [key: string]: T },
  fn: (key: string, value: T) => boolean,
): { [key: string]: T } => {
  if (dict == null || fn == null)
    return dict

  const outputDict: { [key: string]: T } = {}
  Object.entries(dict).forEach(([key, value]) => {
    if (fn(key, value))
      outputDict[key] = dict[key]
  })
  return outputDict
}
