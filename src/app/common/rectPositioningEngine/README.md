# Rect Positioning Engine

## Introduction
This powerful module determines the rect (x, y, width, height) of each row and column within a provided recursive row-column tree, given various properties of each row and column.

## What is it used for?
This mimicks, in JS, the way that HTML and CSS can be used to position HTML elements in a browser window. This is useful for when one needs to position rectangular elements (or "zones") in a space, a space which doesn't have a built-in rect positioning engine like browsers do for HTML and CSS. Examples include svg and canvas.

## Use case
It is common for views that use these rendering engines to contain many separate sub-views, like any standard HTML web page may do. For example, a chart component may include the title bar at the top, the main graph in the middle, a legend on the right, and so on. This engine provides a way to know where these sub-views are by expressing them as an intuitive collection of rows and columns, just as one can do with HTML, CSS, and CSS Flex, but without any of those technologies.