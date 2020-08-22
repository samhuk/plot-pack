import InputOptions from './types/InputOptions'

export const cloneInputOptions = (options: InputOptions): InputOptions => ({
  heightPx: options.heightPx,
  widthPx: options.widthPx,
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
})

export default cloneInputOptions
