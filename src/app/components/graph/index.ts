import ResizeObserver from 'resize-observer-polyfill'
import Options from './types/Options'
import renderGraph from './graph'
import { createGraphGeometry } from './geometry'
import renderInteractivity from './interactivity'
import CanvasElements from './types/CanvasElements'
import cloneInputOptions from './optionsHelper'
import { RenderedGraph } from './types/RenderedGraph'
import InputOptions from './types/InputOptions'

const CONTAINER_CLASS = 'pp-graph'

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
  const graphGeometry = createGraphGeometry(canvasElements.graph, options)
  renderGraph(canvasElements.graph, options, graphGeometry)
  renderInteractivity(canvasElements.interactivity, options, graphGeometry)
}

const addCanvasElementsToContainer = (container: HTMLElement, canvasElements: CanvasElements) => {
  container.appendChild(canvasElements.graph)
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

const createContainer = (options: InputOptions) => {
  // Create element
  const innerContainer = document.createElement('div')
  innerContainer.classList.add(CONTAINER_CLASS)
  // Size element as given dimensions, or expand to fit outer container if not given
  innerContainer.style.height = options.heightPx != null ? `${options.heightPx}px` : '100%'
  innerContainer.style.width = options.widthPx != null ? `${options.widthPx}px` : '100%'
  return innerContainer
}

export const render = (container: HTMLElement, options: InputOptions): RenderedGraph => {
  const inputOptions: InputOptions = cloneInputOptions(options)
  const canvasElements = createCanvasElements()

  const innerContainer = createContainer(options)
  container.appendChild(innerContainer)

  addCanvasElementsToContainer(innerContainer, canvasElements)

  const bindHeight = inputOptions.heightPx == null
  const bindWidth = inputOptions.widthPx == null

  const _options: Options = applyContainerBoundingRectToOptions(innerContainer, inputOptions, bindHeight, bindWidth)

  let resizeObserver: ResizeObserver = null
  if (bindHeight || bindWidth) {
    const _onResize = createHandleResizeEventFunction(inputOptions, innerContainer, canvasElements, bindHeight, bindWidth)
    let _currentContainerRect = innerContainer.getBoundingClientRect()
    resizeObserver = new ResizeObserver(() => {
      const _newContainerRect = innerContainer.getBoundingClientRect()
      if (!areClientRectsEqualSize(_currentContainerRect, _newContainerRect))
        _onResize()
      _currentContainerRect = _newContainerRect
    })

    resizeObserver.observe(innerContainer)
  }

  renderIntoCanvasElements(canvasElements, _options)

  return {
    destroy: () => {
      if (resizeObserver != null)
        resizeObserver.disconnect()
    },
  }
}

export default render
