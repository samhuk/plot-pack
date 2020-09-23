/**
 * The possible datum snapping modes. This will instruct which datum will be snapped to (or "highlighted")
 * given the current cursor's position. It supports none, to the nearest x, to the nearest y, and to the nearest
 * (i.e. cartesian distance).
 */
export enum DatumSnapMode {
  /**
   * No snapping behavior
   */
  NONE = 'none',
  /**
   * The datum that has an x position closest to the cursor's x position is snapped to
   */
  SNAP_NEAREST_X = 'snap_nearest_x',
  /**
   * The datum that has an y position closest to the cursor's y position is snapped to
   */
  SNAP_NEAREST_Y = 'snap_nearest_y',
  /**
   * The datum that has a posiiton closest to the cursor's position is snapped to (i.e. using the cartesian distance)
   */
  SNAP_NEAREST_X_Y = 'snap_nearest_x_y'
}

export default DatumSnapMode
