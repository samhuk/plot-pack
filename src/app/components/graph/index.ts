import Options from './types/Options'
import renderGraph from './graph'
import { createGraphGeometry } from './geometry'
import renderInteractivity from './interactivity'
import CanvasElements from './types/CanvasElements'
import cloneOptions from './optionsHelper'
import { RenderedGraph } from './types/RenderedGraph'

const CONTAINER_CLASS = 'pp-graph'

const applyContainerBoundingRectToOptions = (container: HTMLElement, options: Options, bindHeight: boolean, bindWidth: boolean) => {
  const boundingRect = container.getBoundingClientRect()
  if (bindHeight)
    // eslint-disable-next-line no-param-reassign
    options.heightPx = boundingRect.height
  if (bindWidth)
    // eslint-disable-next-line no-param-reassign
    options.widthPx = boundingRect.width
}

const renderIntoCanvasElements = (canvasElements: CanvasElements, options: Options) => {
  const graphGeometry = createGraphGeometry(canvasElements.graph, options)
  renderGraph(canvasElements.graph, options, graphGeometry)
  renderInteractivity(canvasElements.interactivity, options, graphGeometry)
}

const addCanvasElementsToContainer = (container: HTMLElement, canvasElements: CanvasElements) => {
  container.appendChild(canvasElements.graph)
  container.appendChild(canvasElements.interactivity)
}

const handleResizeEvent = (
  e: UIEvent,
  options: Options,
  container: HTMLElement,
  canvasElements: CanvasElements,
  bindHeight: boolean,
  bindWidth: boolean,
) => {
  applyContainerBoundingRectToOptions(container, options, bindHeight, bindWidth)
  renderIntoCanvasElements(canvasElements, options)
}

const createHandleResizeEventFunction = (
  options: Options,
  container: HTMLElement,
  canvasElements: CanvasElements,
  bindHeight: boolean,
  bindWidth: boolean,
) => (e: UIEvent) => handleResizeEvent(e, options, container, canvasElements, bindHeight, bindWidth)

const createCanvasElements = (): CanvasElements => {
  const graphCanvasElement = document.createElement('canvas')
  const interactivityCanvasElement = document.createElement('canvas')

  graphCanvasElement.style.border = '1px solid black' // DEBUG LINE
  graphCanvasElement.style.position = 'absolute'
  graphCanvasElement.style.display = 'inline'
  interactivityCanvasElement.style.border = '1px solid black' // DEBUG LINE
  interactivityCanvasElement.style.position = 'absolute'
  interactivityCanvasElement.style.display = 'inline'

  return {
    graph: graphCanvasElement,
    interactivity: interactivityCanvasElement,
  }
}

const createContainer = (options: Options) => {
  // Create element
  const innerContainer = document.createElement('div')
  innerContainer.classList.add(CONTAINER_CLASS)
  // Size element as given dimensions, or expand to fit outer container if not given
  innerContainer.style.height = options.heightPx != null ? `${options.heightPx}px` : '100%'
  innerContainer.style.width = options.widthPx != null ? `${options.widthPx}px` : '100%'
  return innerContainer
}

export const render = (container: HTMLElement, options: Options): RenderedGraph => {
  const _options = cloneOptions(options)
  const canvasElements = createCanvasElements()

  const innerContainer = createContainer(options)
  container.appendChild(innerContainer)

  addCanvasElementsToContainer(innerContainer, canvasElements)

  const bindHeight = options.heightPx == null
  const bindWidth = options.widthPx == null

  const _onResize = createHandleResizeEventFunction(_options, innerContainer, canvasElements, bindHeight, bindWidth)
  if (_options.heightPx == null || _options.widthPx == null)
    window.addEventListener('resize', _onResize)

  applyContainerBoundingRectToOptions(innerContainer, _options, bindHeight, bindWidth)

  renderIntoCanvasElements(canvasElements, _options)

  return {
    destroy: () => {
      window.removeEventListener('resize', _onResize)
    },
  }
}

export default render
