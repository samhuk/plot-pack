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
import Chart from './types/Chart'
import Navigator from './types/Navigator'
import NavigatorEventHandlers from './types/NavigatorEventHandlers'
import { CanvasDrawer } from '../../common/drawer/types'

/* eslint-disable no-param-reassign */

type InteractiveEventHandlers = {
  onMouseMove: (e: MouseEvent) => void
  onMouseEnter: (e: MouseEvent) => void
  onMouseLeave: (e: MouseEvent) => void
  onMouseDown: (e: MouseEvent) => void
  onMouseUp: (e: MouseEvent) => void
}

type EventHandlers = NavigatorEventHandlers & {
  onContainerResize: () => void
}

type RenderedComponents = {
  navigator: Navigator
  chart: Chart
}

type State = {
  eventHandlers: EventHandlers
  canvasElements: CanvasElements,
  renderedComponents: RenderedComponents
  inputOptions: InputOptions
  options: Options
  interactiveEventElement: HTMLElement
  containerElement: HTMLElement
  selectedXValueBound: Bound
  drawers: {
    chartPlotBase: CanvasDrawer
    chartPlotInteractivity: CanvasDrawer
    navigatorPlot: CanvasDrawer
    navigatorInteractivity: CanvasDrawer
  }
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

const renderComponents = (state: State, renderNewNavigator: boolean = false): RenderedComponents => {
  // Create canvas drawers for each canvas layer, if not already created
  if (state.drawers == null) {
    state.drawers = {
      chartPlotBase: createCanvasDrawer(state.canvasElements.chartPlotBase, state.options),
      chartPlotInteractivity: createCanvasDrawer(state.canvasElements.chartInteractivity, state.options),
      navigatorPlot: createCanvasDrawer(state.canvasElements.navigatorPlotBase, state.options),
      navigatorInteractivity: createCanvasDrawer(state.canvasElements.navigatorInteractivity, state.options),
    }
  }

  // Create geometry
  const geometry = createGeometry(state.drawers.chartPlotBase, state.options)

  // Draw the chart
  const chart = drawChart(
    { plotBase: state.drawers.chartPlotBase, interactivity: state.drawers.chartPlotInteractivity },
    geometry,
    state.options,
  )

  // Draw the navigator
  const navigator = renderNewNavigator
    ? drawNavigator(
      { plotBase: state.drawers.navigatorPlot, interactivity: state.drawers.navigatorInteractivity },
      geometry,
      state.options,
      state.eventHandlers,
      state.selectedXValueBound,
    )
    : state.renderedComponents.navigator

  return { chart, navigator }
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

const renderInternal = (state: State, renderNewNavigator: boolean = false): void => {
  state.renderedComponents = renderComponents(state, renderNewNavigator)
  const interactiveEventHandlers: InteractiveEventHandlers = {
    onMouseMove: merge(state.renderedComponents.navigator.interactivity.onMouseMove, state.renderedComponents.chart.interactivity.onMouseMove),
    onMouseLeave: merge(state.renderedComponents.navigator.interactivity.onMouseLeave, state.renderedComponents.chart.interactivity.onMouseLeave),
    onMouseEnter: state.renderedComponents.navigator.interactivity.onMouseEnter,
    onMouseDown: state.renderedComponents.navigator.interactivity.onMouseDown,
    onMouseUp: state.renderedComponents.navigator.interactivity.onMouseUp,
  }
  state.interactiveEventElement.onmousemove = interactiveEventHandlers.onMouseMove
  state.interactiveEventElement.onmouseenter = interactiveEventHandlers.onMouseEnter
  state.interactiveEventElement.onmouseleave = interactiveEventHandlers.onMouseLeave
  state.interactiveEventElement.onmouseup = interactiveEventHandlers.onMouseUp
  state.interactiveEventElement.onmousedown = interactiveEventHandlers.onMouseDown
}

const createEventHandlers = (state: State): EventHandlers => {
  const eventHandlers: EventHandlers = {
    onSelectXValueBound: newBound => {
      setXAxisValueBoundToOptions(state.options, newBound)
      state.selectedXValueBound = newBound
      // Don't need to render a new navigator if a new x value bound has been selected
      renderInternal(state)
    },
    onResetXValueBound: () => undefined,
    onContainerResize: () => {
      // Create new options given the new container size and current options
      applyContainerRectToOptions(state.containerElement, state.inputOptions, state.options)
      renderInternal(state, true)
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
    selectedXValueBound: null,
    drawers: null,
  }

  state.canvasElements = createCanvasElements()
  state.containerElement = createContainer(state.inputOptions)

  // Add canvas elements to container element
  state.containerElement.appendChild(state.canvasElements.chartPlotBase)
  state.containerElement.appendChild(state.canvasElements.chartInteractivity)
  state.containerElement.appendChild(state.canvasElements.navigatorPlotBase)
  state.containerElement.appendChild(state.canvasElements.navigatorInteractivity)
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
  renderInternal(state, true)

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
