/**
 * The possible data highlight appearances. This is what is shown around a datum that has
 * been snapped to (i.e. highlighted).
 */
export enum DatumHighlightType {
  /**
   * The datum highlight appears as a circle (i.e. ring) around teh datum
   */
  CIRCLE = 'circle',
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

export default DatumHighlightType
