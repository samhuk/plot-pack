import ResizeObserver from 'resize-observer-polyfill'
import Options from './types/Options'
import { createGeometry } from './geometry/geometry'
import CanvasLayerElements from './types/CanvasLayerElements'
import cloneOptions from './optionsHelper'
import { RenderedChart } from './types/RenderedChart'
import InputOptions from './types/InputOptions'
import { createCanvasDrawer } from '../../common/drawer/canvasDrawer'
import { drawNavigator } from './navigator'
import { drawChart } from './chart'
import { merge } from '../../common/helpers/function'
import Bound from './types/Bound'
import Chart from './types/Chart'
import Navigator from './types/Navigator'
import NavigatorEventHandlers from './types/NavigatorEventHandlers'
import CanvasLayerDrawers from './types/CanvasLayerDrawers'
import CanvasLayers from './types/CanvasLayers'

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
  canvasLayerElements: CanvasLayerElements,
  renderedComponents: RenderedComponents
  inputOptions: InputOptions
  options: Options
  interactiveEventElement: HTMLElement
  containerElement: HTMLElement
  selectedXValueBound: Bound
  canvasLayerDrawers: CanvasLayerDrawers
}

const CONTAINER_CLASS = 'pp-chart'

const CANVAS_LAYER_ELEMENT_ORDERING: CanvasLayers[] = [
  CanvasLayers.CHART_PLOT_BASE,
  CanvasLayers.ANNOTATIONS,
  CanvasLayers.CHART_INTERACTIVITY,
  CanvasLayers.NAVIGATOR_PLOT_BASE,
  CanvasLayers.NAVIGATOR_BOUND_SELECTOR,
  CanvasLayers.NAVIGATOR_ACTION_BUTTONS,
]

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

const createCanvasLayerElements = (): CanvasLayerElements => ({
  [CanvasLayers.CHART_PLOT_BASE]: createCanvasElement(),
  [CanvasLayers.CHART_INTERACTIVITY]: createCanvasElement(),
  [CanvasLayers.NAVIGATOR_PLOT_BASE]: createCanvasElement(),
  [CanvasLayers.NAVIGATOR_BOUND_SELECTOR]: createCanvasElement(),
  [CanvasLayers.NAVIGATOR_ACTION_BUTTONS]: createCanvasElement(),
  [CanvasLayers.ANNOTATIONS]: createCanvasElement(),
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

const createCanvasLayerDrawers = (state: State): CanvasLayerDrawers => ({
  [CanvasLayers.CHART_PLOT_BASE]: createCanvasDrawer(state.canvasLayerElements[CanvasLayers.CHART_PLOT_BASE], state.options),
  [CanvasLayers.ANNOTATIONS]: createCanvasDrawer(state.canvasLayerElements[CanvasLayers.ANNOTATIONS], state.options),
  [CanvasLayers.CHART_INTERACTIVITY]: createCanvasDrawer(state.canvasLayerElements[CanvasLayers.CHART_INTERACTIVITY], state.options),
  [CanvasLayers.NAVIGATOR_PLOT_BASE]: createCanvasDrawer(state.canvasLayerElements[CanvasLayers.NAVIGATOR_PLOT_BASE], state.options),
  [CanvasLayers.NAVIGATOR_BOUND_SELECTOR]: createCanvasDrawer(state.canvasLayerElements[CanvasLayers.NAVIGATOR_BOUND_SELECTOR], state.options),
  [CanvasLayers.NAVIGATOR_ACTION_BUTTONS]: createCanvasDrawer(state.canvasLayerElements[CanvasLayers.NAVIGATOR_ACTION_BUTTONS], state.options),
})

const renderComponents = (state: State, renderNewNavigator: boolean = false, clearAll: boolean = false): RenderedComponents => {
  // Create canvas drawers for each canvas layer, if not already created
  if (state.canvasLayerDrawers == null)
    state.canvasLayerDrawers = createCanvasLayerDrawers(state)

  // Clear all canvases, if clearAll is true
  if (clearAll)
    Object.values(state.canvasLayerDrawers).forEach(drawer => drawer.clearRenderingSpace())

  // Create geometry
  const geometry = createGeometry(state.canvasLayerDrawers[CanvasLayers.CHART_PLOT_BASE], state.options)

  // Draw the chart
  const chart = drawChart(
    {
      plotBase: state.canvasLayerDrawers[CanvasLayers.CHART_PLOT_BASE],
      annotations: state.canvasLayerDrawers[CanvasLayers.ANNOTATIONS],
      interactivity: state.canvasLayerDrawers[CanvasLayers.CHART_INTERACTIVITY],
    },
    geometry,
    state.options,
  )

  // Draw the navigator
  const navigator = renderNewNavigator
    ? drawNavigator(
      {
        plotBase: state.canvasLayerDrawers[CanvasLayers.NAVIGATOR_PLOT_BASE],
        boundSelector: state.canvasLayerDrawers[CanvasLayers.NAVIGATOR_BOUND_SELECTOR],
        actionButtons: state.canvasLayerDrawers[CanvasLayers.NAVIGATOR_ACTION_BUTTONS],
      },
      geometry,
      state.options,
      state.eventHandlers,
      state.selectedXValueBound,
      {
        resetCursor: () => state.interactiveEventElement.style.cursor = 'crosshair',
        setCursor: cursor => state.interactiveEventElement.style.cursor = cursor,
      },
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
  if (options.axesOptions.x == null)
    options.axesOptions.x = {}
  options.axesOptions.x.valueBound = bound
}

const renderInternal = (state: State, renderNewNavigator: boolean = false, clearAll: boolean = false): void => {
  state.renderedComponents = renderComponents(state, renderNewNavigator, clearAll)
  const interactiveEventHandlers: InteractiveEventHandlers = {
    onMouseMove: merge(
      state.renderedComponents.chart.interactivity.onMouseMove,
      state.renderedComponents.navigator.boundSelector.onMouseMove,
      state.renderedComponents.navigator.actionButtons.onMouseMove,
    ),
    onMouseLeave: merge(state.renderedComponents.navigator.boundSelector.onMouseLeave, state.renderedComponents.chart.interactivity.onMouseLeave),
    onMouseEnter: state.renderedComponents.navigator.boundSelector.onMouseEnter,
    onMouseDown: e => {
      const shouldNotCallProceeders = state.renderedComponents.navigator.actionButtons.onMouseDown(e)
      if (!shouldNotCallProceeders)
        state.renderedComponents.navigator.boundSelector.onMouseDown(e)
    },
    onMouseUp: state.renderedComponents.navigator.boundSelector.onMouseUp,
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
      renderInternal(state, true, true)
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
    canvasLayerElements: null,
    containerElement: null,
    eventHandlers: null,
    renderedComponents: null,
    options: null,
    interactiveEventElement: null,
    selectedXValueBound: inputOptions.axesOptions?.x?.valueBound,
    canvasLayerDrawers: null,
  }

  state.canvasLayerElements = createCanvasLayerElements()
  state.containerElement = createContainer(state.inputOptions)

  // Add canvas elements to container element, in correct order
  CANVAS_LAYER_ELEMENT_ORDERING.forEach(canvasLayer => state.containerElement.appendChild(state.canvasLayerElements[canvasLayer]))
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
