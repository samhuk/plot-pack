import InputOptions from './types/InputOptions'
import Options from './types/Options'

export const cloneOptions = <T extends InputOptions | Options>(options: T): T => ({
  height: options.height,
  width: options.width,
  series: options.series,
  axesLabelOptions: options.axesLabelOptions,
  axesOptions: options.axesOptions,
  backgroundColor: options.backgroundColor,
  bestFitLineOptions: options.bestFitLineOptions,
  connectingLineOptions: options.connectingLineOptions,
  datumFocusPointDeterminationMode: options.datumFocusPointDeterminationMode,
  datumHighlightOptions: options.datumHighlightOptions,
  datumSnapOptions: options.datumSnapOptions,
  errorBarsOptions: options.errorBarsOptions,
  markerOptions: options.markerOptions,
  seriesOptions: options.seriesOptions,
  title: options.title,
  titleOptions: options.titleOptions,
  tooltipOptions: options.tooltipOptions,
  visibilityOptions: options.visibilityOptions,
  chartMargin: options.chartMargin,
  navigatorOptions: options.navigatorOptions,
} as T)

export default cloneOptions
