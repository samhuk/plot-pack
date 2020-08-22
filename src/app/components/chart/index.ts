import ResizeObserver from 'resize-observer-polyfill'
import Options from './types/Options'
import { createGeometry } from './geometry/geometry'
import drawPlotInteractivity from './plotInteractivity'
import CanvasElements from './types/CanvasElements'
import cloneInputOptions from './optionsHelper'
import { RenderedChart } from './types/RenderedChart'
import InputOptions from './types/InputOptions'
import { createCanvasDrawer } from '../../common/drawer/canvasDrawer'
import { drawNavigator } from './navigator'
import ChartComponents from './types/ChartComponents'
import { drawChart } from './chart'
import { merge } from '../../common/helpers/function'

type RenderedComponents = {
  eventHandlers: {
    onMouseMove: (e: MouseEvent) => void,
    onMouseLeave: (e: MouseEvent) => void,
  }
}

type State = {
  renderedComponents: RenderedComponents
}

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

const renderIntoCanvasElements = (canvasElements: CanvasElements, options: Options): RenderedComponents => {
  const plotDrawer = createCanvasDrawer(canvasElements.chart, options.heightPx, options.widthPx)
  const plotInteractivityDrawer = createCanvasDrawer(canvasElements.interactivity, options.heightPx, options.widthPx)
  const navigatorPlotDrawer = createCanvasDrawer(canvasElements.navigatorPlotBase, options.heightPx, options.widthPx)
  const navigatorInteractivityDrawer = createCanvasDrawer(canvasElements.navigatorInteractivity, options.heightPx, options.widthPx)

  const geometry = createGeometry(plotDrawer, options)

  drawChart(plotDrawer, geometry, options)

  const drawnPlotInteractivity = drawPlotInteractivity(plotInteractivityDrawer, options, geometry)

  const drawnNavigator = drawNavigator(
    { interactivity: navigatorInteractivityDrawer, plotBase: navigatorPlotDrawer },
    geometry.processedDatums,
    geometry.chartComponentRects[ChartComponents.NAVIGATOR],
    options,
  )

  return {
    eventHandlers: {
      onMouseMove: merge(drawnNavigator.eventHandlers.onMouseMove, drawnPlotInteractivity.eventHandlers.onMouseMouse),
      onMouseLeave: merge(drawnNavigator.eventHandlers.onMouseLeave, drawnPlotInteractivity.eventHandlers.onMouseLeave),
    },
  }
}

const addCanvasElementsToContainer = (container: HTMLElement, canvasElements: CanvasElements) => {
  container.appendChild(canvasElements.chart)
  container.appendChild(canvasElements.interactivity)
  container.appendChild(canvasElements.navigatorInteractivity)
  container.appendChild(canvasElements.navigatorPlotBase)
}

const handleResizeEvent = (
  state: State,
  options: InputOptions,
  container: HTMLElement,
  canvasElements: CanvasElements,
  bindHeight: boolean,
  bindWidth: boolean,
) => {
  const _options = applyContainerBoundingRectToOptions(container, options, bindHeight, bindWidth)
  // eslint-disable-next-line no-param-reassign
  state.renderedComponents = renderIntoCanvasElements(canvasElements, _options)
}

const createHandleResizeEventFunction = (
  state: State,
  options: InputOptions,
  container: HTMLElement,
  canvasElements: CanvasElements,
  bindHeight: boolean,
  bindWidth: boolean,
) => () => handleResizeEvent(state, options, container, canvasElements, bindHeight, bindWidth)

const createCanvasElement = () => {
  const el = document.createElement('canvas')
  el.style.border = '1px solid black' // DEBUG LINE
  el.style.position = 'absolute'
  el.style.display = 'inline'
  return el
}

const createCanvasElements = (): CanvasElements => ({
  chart: createCanvasElement(),
  interactivity: createCanvasElement(),
  navigatorInteractivity: createCanvasElement(),
  navigatorPlotBase: createCanvasElement(),
})

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
  state: State,
  container: HTMLElement,
  canvasElements: CanvasElements,
  inputOptions: InputOptions,
  bindHeight: boolean,
  bindWidth: boolean,
): ResizeObserver => {
  const onResize = createHandleResizeEventFunction(state, inputOptions, container, canvasElements, bindHeight, bindWidth)
  let currentContainerRect = container.getBoundingClientRect()
  const resizeObserver = new ResizeObserver(() => {
    const newContainerRect = container.getBoundingClientRect()
    if (!areClientRectsEqualSize(currentContainerRect, newContainerRect))
      onResize()
    currentContainerRect = newContainerRect
  })

  resizeObserver.observe(container)

  return resizeObserver
}

const createEventContainer = (state: State): HTMLElement => {
  const eventElement = document.createElement('div')
  eventElement.classList.add('event-container')
  eventElement.style.width = '100%'
  eventElement.style.height = '100%'
  eventElement.style.position = 'absolute'
  eventElement.style.zIndex = '1'

  eventElement.onmousemove = (e: MouseEvent) => state.renderedComponents.eventHandlers.onMouseMove(e)
  eventElement.onmouseleave = (e: MouseEvent) => state.renderedComponents.eventHandlers.onMouseLeave(e)

  return eventElement
}

export const render = (container: HTMLElement, options: InputOptions): RenderedChart => {
  if (options.series == null || Object.keys(options.series).length === 0)
    return null

  const state: State = { renderedComponents: null }

  const inputOptions: InputOptions = cloneInputOptions(options)
  const canvasElements = createCanvasElements()

  const innerContainer = createContainer(options)
  container.appendChild(innerContainer)

  // Create event container and add to inner container
  const eventElement = createEventContainer(state)
  innerContainer.appendChild(eventElement)

  addCanvasElementsToContainer(innerContainer, canvasElements)

  const bindHeight = inputOptions.heightPx == null
  const bindWidth = inputOptions.widthPx == null

  const _options: Options = applyContainerBoundingRectToOptions(innerContainer, inputOptions, bindHeight, bindWidth)

  const resizeObserver: ResizeObserver = bindHeight || bindWidth
    ? bindContainerResizeToResizeFunction(state, innerContainer, canvasElements, inputOptions, bindHeight, bindWidth)
    : null

  state.renderedComponents = renderIntoCanvasElements(canvasElements, _options)

  return {
    destroy: () => {
      if (resizeObserver != null)
        resizeObserver.disconnect()
    },
  }
}

export default render
