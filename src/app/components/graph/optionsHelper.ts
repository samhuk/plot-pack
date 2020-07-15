import Options from './types/Options'

export const cloneOptions = (options: Options): Options => ({
  heightPx: options.heightPx,
  series: options.series,
  widthPx: options.widthPx,
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
})

export default cloneOptions
