export const isObject = (item: unknown): boolean => (
  item != null && typeof item === 'object' && !Array.isArray(item)
)

export const deepMergeObjects = <T extends { [k: string]: any }>(target: T, source: T) => {
  const output: T = { ...target }

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] })
        else
          // @ts-ignore
          output[key] = deepMergeObjects(target[key], source[key])
      }
      else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }

  return output
}
