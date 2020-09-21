# Plot Base

This module draws the plot axes, i.e. the "base" overlay of a chart. This includes things like:
* Axes lines
* Axes marker lines
* Axes marker labels
* grid lines

This module contains two parts:
* Components - The drawing logic for each part of the plot base.
* Geometry - The geometric logic that calculates the geometric properties of the axes, i.e. their grid spacing, min and max values, and so on.