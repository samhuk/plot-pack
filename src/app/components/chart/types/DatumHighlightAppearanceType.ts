/**
 * The possible data highlight appearances. This is what is shown around a datum that has
 * been snapped to (i.e. highlighted).
 */
export enum DatumHighlightAppearanceType {
  /**
   * The datum highlight appears as a circle (i.e. ring) around teh datum
   */
  CIRCLE = 'circle',
  /**
   * The datum highlight appears as a dot at the marker's position. This will appear over the marker.
   */
  DOT = 'dot',
  /**
   * The datum highlight appears as a crosshair around the marker.
   */
  CROSSHAIR = 'crosshair',
  /**
   * The datum highlight appears as a plushair around the marker. Essentially the crosshair type
   * but rotated 45 degrees.
   */
  PLUSHAIR = 'plushair',
}

export default DatumHighlightAppearanceType
