export const isObject = (item: unknown): boolean => (
  item != null && typeof item === 'object' && !Array.isArray(item)
)

/**
 * Deep (i.e. recursively) merges target and source objects. This essentially
 * "overlays" `source` on-top of `target`.
 *
 * @example
 * deepMergeObjects({ b: 3 }, { a: 1, b: 2 }) // { a: 1, b: 3 }
 */
const deepMergeObjectsInternal = <T extends { [k: string]: any }>(source: T, target: T) => {
  const output: T = { ...target }

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] })
        else
          // @ts-ignore
          output[key] = deepMergeObjectsInternal(source[key], target[key])
      }
      else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }

  return output
}

/**
 * Deep (i.e. recursively) merges target and source objects. This essentially
 * "overlays" `source` on-top of `target`.
 *
 * @example
 * deepMergeObjects({ b: 3 }, { a: 1, b: 2 }) // { a: 1, b: 3 }
 */
export const deepMergeObjects = <T extends { [k: string]: any }>(source: T, target: T) => (
  deepMergeObjectsInternal(source, target ?? ({ } as T))
)
