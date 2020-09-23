/**
 * Represents the individual canvas layers of the component.
 */
export enum CanvasLayers {
  /**
   * The Plot Base of the main chart, i.e. where the main series data is plotted
   */
  CHART_PLOT_BASE = 'chart_plot_base',
  /**
   * The interactivity of the chart, i.e. the datum highlight, cursor position lines,
   * tooltip, etc.
   */
  CHART_INTERACTIVITY = 'chart_interactivity',
  /**
   * The Plot Base of the navigator.
   */
  NAVIGATOR_PLOT_BASE = 'navigator_plot_base',
  /**
   * The bounds selector of the navigator, i.e. the box that appears that shows the
   * selected x-value range.
   */
  NAVIGATOR_BOUND_SELECTOR = 'navigator_bound_selector',
  /**
   * The action buttons of the navigator.
   */
  NAVIGATOR_ACTION_BUTTONS = 'navigator_action_buttons',
}

export default CanvasLayers
