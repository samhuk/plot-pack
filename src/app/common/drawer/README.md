# Drawer

This module, mainly canvasDrawer, is a wrapper around the native CanvasRenderingContext2D and Path2D modules.

It's main purpose is to provide a more declarative (and therefore flexible) form of drawing on a canvas.

This module turns having to make multiple calls to a Path2D instance, which is information destructive and imperative, to instead creating an array of path components, and feeding the array to a function that iterates throught the array, drawing each path component.

canvasDrawer also has some simpler logic such as line, circle, arc, and so on, which provide a quick way to draw simple lines and 2D shapes to a canvas when more complex paths aren't required.

## Usage

### Path
```ts
// A square path
const path: Path = [
  { type: PathComponentType.MOVE_TO, x: 0, y: 0 },
  { type: PathComponentType.LINE_TO, x: 10, y: 0 },
  { type: PathComponentType.LINE_TO, x: 10, y: 10 },
  { type: PathComponentType.LINE_TO, x: 0, y: 10 },
  { type: PathComponentType.LINE_TO, x: 0, y: 0 }
]
drawer.path(path)
```

### Line
```ts
// A diagonal line
drawer.line([{ x: 0, y: 0 }, { x: 10, y: 10 }])
```