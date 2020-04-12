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
