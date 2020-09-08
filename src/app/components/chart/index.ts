import ResizeObserver from 'resize-observer-polyfill'
import Options from './types/Options'
import { createGeometry } from './geometry/geometry'
import CanvasElements from './types/CanvasElements'
import cloneOptions from './optionsHelper'
import { RenderedChart } from './types/RenderedChart'
import InputOptions from './types/InputOptions'
import { createCanvasDrawer } from '../../common/drawer/canvasDrawer'
import { drawNavigator } from './navigator'
import { drawChart } from './chart'
import { merge } from '../../common/helpers/function'
import Bound from './types/Bound'
import { Axis2D } from '../../common/types/geometry'

/* eslint-disable no-param-reassign */

type InteractiveEventHandlers = {
  onMouseMove: (e: MouseEvent) => void
  onMouseLeave: (e: MouseEvent) => void
  onMouseDown: (e: MouseEvent) => void
  onMouseUp: (e: MouseEvent) => void
}

type ComponentEventHandlers = {
  onSelectNewXValueBound: (newBound: Bound) => void
}

type EventHandlers = InteractiveEventHandlers & ComponentEventHandlers & {
  onContainerResize: () => void
}

type RenderedComponents = {
  eventHandlers: InteractiveEventHandlers
}

type State = {
  eventHandlers: EventHandlers
  canvasElements: CanvasElements,
  renderedComponents: RenderedComponents
  inputOptions: InputOptions
  options: Options
  interactiveEventElement: HTMLElement
  containerElement: HTMLElement
}

const CONTAINER_CLASS = 'pp-chart'

const areClientRectsEqualSize = (r1: DOMRect, r2: DOMRect): boolean => (
  r1.width === r2.width
  && r1.height === r2.height
  && r1.top === r2.top
  && r1.left === r2.left
)

const createCanvasElement = () => {
  const el = document.createElement('canvas')
  el.style.position = 'absolute'
  el.style.display = 'inline'
  return el
}

const createCanvasElements = (): CanvasElements => ({
  chartPlotBase: createCanvasElement(),
  chartInteractivity: createCanvasElement(),
  navigatorInteractivity: createCanvasElement(),
  navigatorPlotBase: createCanvasElement(),
})

const createContainer = (rectDimensions?: { height?: number, width?: number }) => {
  // Create element
  const el = document.createElement('div')
  el.classList.add(CONTAINER_CLASS)
  // Size element as given dimensions, or expand to fit parent element if not given
  el.style.height = rectDimensions?.height != null ? `${rectDimensions.height}px` : '100%'
  el.style.width = rectDimensions?.width != null ? `${rectDimensions.width}px` : '100%'
  return el
}

const applyContainerRectToOptions = (containerElement: HTMLElement, inputOptions: InputOptions, options: Options|InputOptions): Options => {
  // We don't need to bind to dimension(s) and options already has dimensions defined
  if (inputOptions.width != null && inputOptions.height != null && options.width != null && options.height != null)
    return options as Options

  const boundingRect = containerElement.getBoundingClientRect()

  if (inputOptions.height == null)
    options.height = boundingRect.height
  if (inputOptions.width == null)
    options.width = boundingRect.width

  return options as Options
}

const renderComponents = (state: State): RenderedComponents => {
  // Create canvas drawers for each canvas layer
  const chartPlotBaseDrawer = createCanvasDrawer(state.canvasElements.chartPlotBase, state.options)
  const chartPlotInteractivityDrawer = createCanvasDrawer(state.canvasElements.chartInteractivity, state.options)
  const navigatorPlotDrawer = createCanvasDrawer(state.canvasElements.navigatorPlotBase, state.options)
  const navigatorInteractivityDrawer = createCanvasDrawer(state.canvasElements.navigatorInteractivity, state.options)

  // Create geometry
  const geometry = createGeometry(chartPlotBaseDrawer, state.options)

  // Draw the chart
  const chart = drawChart(
    { plotBase: chartPlotBaseDrawer, interactivity: chartPlotInteractivityDrawer },
    geometry,
    state.options,
  )

  // Draw the navigator
  const navigator = drawNavigator(
    { plotBase: navigatorPlotDrawer, interactivity: navigatorInteractivityDrawer },
    geometry,
    state.options,
    {
      onSelectXValueBound: state.eventHandlers.onSelectNewXValueBound,
      onResetXValueBound: null,
    },
  )

  return {
    eventHandlers: {
      onMouseMove: merge(navigator.interactivity.onMouseMove, chart.interactivity.onMouseMove),
      onMouseLeave: merge(navigator.interactivity.onMouseLeave, chart.interactivity.onMouseLeave),
      onMouseDown: navigator.interactivity.onMouseDown,
      onMouseUp: navigator.interactivity.onMouseUp,
    },
  }
}

const createInteractiveEventContainer = (): HTMLElement => {
  const interactiveEventElement = document.createElement('div')
  interactiveEventElement.classList.add('event-container')
  interactiveEventElement.style.width = '100%'
  interactiveEventElement.style.height = '100%'
  interactiveEventElement.style.position = 'absolute'
  interactiveEventElement.style.zIndex = '1'
  interactiveEventElement.style.cursor = 'crosshair'

  return interactiveEventElement
}

const setXAxisValueBoundToOptions = (options: Options, bound: Bound): void => {
  if (options.axesOptions == null)
    options.axesOptions = {}
  if (options.axesOptions[Axis2D.X] == null)
    options.axesOptions[Axis2D.X] = {}
  options.axesOptions[Axis2D.X].valueBound = bound
}

const renderInternal = (state: State): void => {
  state.renderedComponents = renderComponents(state)
  state.interactiveEventElement.onmousemove = state.renderedComponents.eventHandlers.onMouseMove
  state.interactiveEventElement.onmouseleave = state.renderedComponents.eventHandlers.onMouseLeave
  state.interactiveEventElement.onmouseup = state.renderedComponents.eventHandlers.onMouseUp
  state.interactiveEventElement.onmousedown = state.renderedComponents.eventHandlers.onMouseDown
}

const createEventHandlers = (state: State): EventHandlers => {
  const eventHandlers: EventHandlers = {
    onMouseDown: e => state.renderedComponents.eventHandlers.onMouseDown(e),
    onMouseUp: e => state.renderedComponents.eventHandlers.onMouseUp(e),
    onMouseLeave: e => state.renderedComponents.eventHandlers.onMouseLeave(e),
    onMouseMove: e => state.renderedComponents.eventHandlers.onMouseMove(e),
    onSelectNewXValueBound: newBound => {
      setXAxisValueBoundToOptions(state.options, newBound)
      renderInternal(state)
    },
    onContainerResize: () => {
      // Create new options given the new container size and current options
      applyContainerRectToOptions(state.containerElement, state.inputOptions, state.options)
      renderInternal(state)
    },
  }
  return eventHandlers
}

const bindToElementResize = (element: HTMLElement, onResize: () => void): ResizeObserver => {
  let currentRect = element.getBoundingClientRect()
  const resizeObserver = new ResizeObserver(() => {
    const newRect = element.getBoundingClientRect()
    if (!areClientRectsEqualSize(currentRect, newRect))
      onResize()
    currentRect = newRect
  })

  resizeObserver.observe(element)

  return resizeObserver
}

export const render = (parentContainerElement: HTMLElement, inputOptions: InputOptions): RenderedChart => {
  if (inputOptions.series == null || Object.keys(inputOptions.series).length === 0)
    return null

  const state: State = {
    inputOptions,
    canvasElements: null,
    containerElement: null,
    eventHandlers: null,
    renderedComponents: null,
    options: null,
    interactiveEventElement: null,
  }

  state.canvasElements = createCanvasElements()
  state.containerElement = createContainer(state.inputOptions)

  // Add canvas elements to container element
  state.containerElement.appendChild(state.canvasElements.chartPlotBase)
  state.containerElement.appendChild(state.canvasElements.chartInteractivity)
  state.containerElement.appendChild(state.canvasElements.navigatorInteractivity)
  state.containerElement.appendChild(state.canvasElements.navigatorPlotBase)
  // Add container element to the "outer" container element
  parentContainerElement.appendChild(state.containerElement)

  // Create event handlers
  state.eventHandlers = createEventHandlers(state)

  const areDimensionsFullyDefined = state.inputOptions.height != null && state.inputOptions.width != null

  // Create initial new options given the current container and input options
  state.options = areDimensionsFullyDefined
    ? cloneOptions(state.inputOptions) as Options
    : applyContainerRectToOptions(state.containerElement, state.inputOptions, cloneOptions(state.inputOptions))

  // Create interactive event element, prepending it such that it's on top to capture interactive events
  state.interactiveEventElement = createInteractiveEventContainer()
  state.containerElement.prepend(state.interactiveEventElement)

  // Render components
  renderInternal(state)

  // Create resize observer if either height or width has not been defined
  const resizeObserver = !areDimensionsFullyDefined ? bindToElementResize(state.containerElement, state.eventHandlers.onContainerResize) : null

  return {
    destroy: () => {
      if (resizeObserver != null)
        resizeObserver.disconnect()
    },
  }
}

export default render
