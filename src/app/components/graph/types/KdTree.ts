import KdTreeNearestResult from './KdTreeNearestResult'

export type KdTree<T> = {
  nearest: (point: T, numPoints: number) => KdTreeNearestResult<T>
}

export default KdTree
