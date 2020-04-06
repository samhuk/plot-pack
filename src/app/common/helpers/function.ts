export const debounce = <T extends any[], R>(
  fn: (...args: T) => void,
  debounceTimeMs: number = 250,
) => {
  let handle: NodeJS.Timeout = null
  return (...args: T) => {
    if (handle != null)
      clearTimeout(handle)
    handle = setTimeout(() => {
      fn(...args)
    }, debounceTimeMs)
  }
}

export const repeat = <T extends any[], R>(
  fn: (index: number, stop: () => void) => void,
  intervalMs: number = 1000,
) => {
  let i = 0
  let isRunning = false
  let stopLoop: () => void = null
  let intervalHandle: NodeJS.Timeout = null

  const startLoop = (_intervalMs: number) => {
    // Don't duplicate loops if fn errornously calls startLoop multiple times
    if (isRunning)
      return
    isRunning = true
    intervalHandle = setInterval(() => fn(i += 1, stopLoop), _intervalMs)
  }

  stopLoop = () => {
    isRunning = false
    clearInterval(intervalHandle)
  }

  // Start loop
  startLoop(intervalMs)

  return startLoop
}

export const merge = <T extends any[], R>(...fns: ((...args: T) => R)[]) => (...args: T) => fns
  .filter(fn => fn != null)
  .map(fn => fn(...args))
