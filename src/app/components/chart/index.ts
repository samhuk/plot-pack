import ResizeObserver from 'resize-observer-polyfill'
import Options from './types/Options'
import { createChartGeometry } from './geometry'
import renderInteractivity from './interactivity'
import CanvasElements from './types/CanvasElements'
import cloneInputOptions from './optionsHelper'
import { RenderedChart } from './types/RenderedChart'
import InputOptions from './types/InputOptions'
import { createCanvasDrawer } from '../../common/drawer/canvasDrawer'
import { drawNavigator } from './navigator'
import ChartComponents from './types/ChartComponents'
import { drawChart } from './chart'

const CONTAINER_CLASS = 'pp-chart'

const areClientRectsEqualSize = (r1: DOMRect, r2: DOMRect): boolean => (
  r1.width === r2.width
  && r1.height === r2.height
  && r1.top === r2.top
  && r1.left === r2.left
)

const applyContainerBoundingRectToOptions = (container: HTMLElement, options: InputOptions, bindHeight: boolean, bindWidth: boolean): Options => {
  const boundingRect = container.getBoundingClientRect()
  if (bindHeight)
    // eslint-disable-next-line no-param-reassign
    options.heightPx = boundingRect.height
  if (bindWidth)
    // eslint-disable-next-line no-param-reassign
    options.widthPx = boundingRect.width

  return options as Options
}

const renderIntoCanvasElements = (canvasElements: CanvasElements, options: Options) => {
  const staticContentDrawer = createCanvasDrawer(canvasElements.chart, options.heightPx, options.widthPx)
  const chartGeometry = createChartGeometry(staticContentDrawer, options)

  drawChart(staticContentDrawer, chartGeometry, options)
  drawNavigator(staticContentDrawer, chartGeometry.processedDatums, chartGeometry.chartComponentRects[ChartComponents.NAVIGATOR], options)

  renderInteractivity(canvasElements.interactivity, options, chartGeometry)
}

const addCanvasElementsToContainer = (container: HTMLElement, canvasElements: CanvasElements) => {
  container.appendChild(canvasElements.chart)
  container.appendChild(canvasElements.interactivity)
}

const handleResizeEvent = (
  options: InputOptions,
  container: HTMLElement,
  canvasElements: CanvasElements,
  bindHeight: boolean,
  bindWidth: boolean,
) => {
  const _options = applyContainerBoundingRectToOptions(container, options, bindHeight, bindWidth)
  renderIntoCanvasElements(canvasElements, _options)
}

const createHandleResizeEventFunction = (
  options: InputOptions,
  container: HTMLElement,
  canvasElements: CanvasElements,
  bindHeight: boolean,
  bindWidth: boolean,
) => () => handleResizeEvent(options, container, canvasElements, bindHeight, bindWidth)

const createCanvasElements = (): CanvasElements => {
  const chartCanvasElement = document.createElement('canvas')
  const interactivityCanvasElement = document.createElement('canvas')

  chartCanvasElement.style.border = '1px solid black' // DEBUG LINE
  chartCanvasElement.style.position = 'absolute'
  chartCanvasElement.style.display = 'inline'
  interactivityCanvasElement.style.border = '1px solid black' // DEBUG LINE
  interactivityCanvasElement.style.position = 'absolute'
  interactivityCanvasElement.style.display = 'inline'

  return {
    chart: chartCanvasElement,
    interactivity: interactivityCanvasElement,
  }
}

const createContainer = (options: InputOptions) => {
  // Create element
  const innerContainer = document.createElement('div')
  innerContainer.classList.add(CONTAINER_CLASS)
  // Size element as given dimensions, or expand to fit outer container if not given
  innerContainer.style.height = options.heightPx != null ? `${options.heightPx}px` : '100%'
  innerContainer.style.width = options.widthPx != null ? `${options.widthPx}px` : '100%'
  return innerContainer
}

const bindContainerResizeToResizeFunction = (
  container: HTMLElement,
  canvasElements: CanvasElements,
  inputOptions: InputOptions,
  bindHeight: boolean,
  bindWidth: boolean,
): ResizeObserver => {
  const _onResize = createHandleResizeEventFunction(inputOptions, container, canvasElements, bindHeight, bindWidth)
  let _currentContainerRect = container.getBoundingClientRect()
  const resizeObserver = new ResizeObserver(() => {
    const _newContainerRect = container.getBoundingClientRect()
    if (!areClientRectsEqualSize(_currentContainerRect, _newContainerRect))
      _onResize()
    _currentContainerRect = _newContainerRect
  })

  resizeObserver.observe(container)

  return resizeObserver
}

export const render = (container: HTMLElement, options: InputOptions): RenderedChart => {
  if (options.series == null || Object.keys(options.series).length === 0)
    return null

  const inputOptions: InputOptions = cloneInputOptions(options)
  const canvasElements = createCanvasElements()

  const innerContainer = createContainer(options)
  container.appendChild(innerContainer)

  addCanvasElementsToContainer(innerContainer, canvasElements)

  const bindHeight = inputOptions.heightPx == null
  const bindWidth = inputOptions.widthPx == null

  const _options: Options = applyContainerBoundingRectToOptions(innerContainer, inputOptions, bindHeight, bindWidth)

  const resizeObserver: ResizeObserver = bindHeight || bindWidth
    ? bindContainerResizeToResizeFunction(innerContainer, canvasElements, inputOptions, bindHeight, bindWidth)
    : null

  renderIntoCanvasElements(canvasElements, _options)

  return {
    destroy: () => {
      if (resizeObserver != null)
        resizeObserver.disconnect()
    },
  }
}

export default render
