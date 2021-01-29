export const createError = (componentName?: string, message?: string) => (
  new Error(`[plot-pack.${componentName ?? ''}] ${message}`)
)

export const createNotYetSupportedError = (componentName?: string, featureName?: string, remarks?: string) => (
  createError(componentName, `${featureName ?? 'This feature'} is not yet supported.${remarks != null ? `${remarks}` : ''}`)
)
