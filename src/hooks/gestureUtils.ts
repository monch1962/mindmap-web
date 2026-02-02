/**
 * Pure utility functions for gesture calculations
 */

export interface PointerPosition {
  x: number
  y: number
  identifier: number
}

export interface GestureState {
  scale: number
  rotation: number
  panX: number
  panY: number
}

export interface PinchGestureData {
  initialDistance: number
  currentDistance: number
  initialAngle: number
  currentAngle: number
  currentScale: number
  currentRotation: number
}

export interface PanGestureData {
  lastX: number
  lastY: number
  currentX: number
  currentY: number
  currentPanX: number
  currentPanY: number
}

/**
 * Calculate Euclidean distance between two points
 */
export function getDistance(p1: PointerPosition, p2: PointerPosition): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

/**
 * Calculate angle between two points in degrees
 */
export function getAngle(p1: PointerPosition, p2: PointerPosition): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)
}

/**
 * Calculate pinch scale delta
 */
export function calculatePinchScale(
  data: Pick<PinchGestureData, 'initialDistance' | 'currentDistance' | 'currentScale'>
): {
  scaleDelta: number
  newScale: number
} {
  if (data.initialDistance <= 0) {
    return { scaleDelta: 1, newScale: data.currentScale }
  }

  const scaleDelta = data.currentDistance / data.initialDistance
  const newScale = Math.max(0.1, Math.min(5, data.currentScale * scaleDelta))

  return { scaleDelta, newScale }
}

/**
 * Calculate rotation delta with proper angle wrap-around handling
 */
export function calculateRotation(
  data: Pick<PinchGestureData, 'initialAngle' | 'currentAngle' | 'currentRotation'>
): {
  rotationDelta: number
  newRotation: number
} {
  // Calculate the shortest rotation direction (handles wrap-around)
  let rotationDelta = data.currentAngle - data.initialAngle

  // Normalize to the range [-180, 180] for shortest rotation
  if (rotationDelta > 180) {
    rotationDelta -= 360
  } else if (rotationDelta < -180) {
    rotationDelta += 360
  }

  const newRotation = data.currentRotation + rotationDelta

  return { rotationDelta, newRotation }
}

/**
 * Calculate pan delta
 */
export function calculatePan(data: PanGestureData): {
  deltaX: number
  deltaY: number
  newPanX: number
  newPanY: number
} {
  const deltaX = data.currentX - data.lastX
  const deltaY = data.currentY - data.lastY
  const newPanX = data.currentPanX + deltaX
  const newPanY = data.currentPanY + deltaY

  return { deltaX, deltaY, newPanX, newPanY }
}

/**
 * Get two pointers from a Map of pointers
 */
export function getTwoPointers(
  pointers: Map<number, PointerPosition>
): [PointerPosition, PointerPosition] | null {
  if (pointers.size !== 2) {
    return null
  }

  const values = Array.from(pointers.values())
  return [values[0], values[1]]
}

/**
 * Check if a gesture should be processed based on enabled state
 */
export function shouldProcessGesture(
  enabled: boolean,
  pointers: Map<number, PointerPosition>
): boolean {
  return enabled && pointers.size > 0
}

/**
 * Update pointer position in the map
 */
export function updatePointerPosition(
  pointers: Map<number, PointerPosition>,
  pointerId: number,
  x: number,
  y: number
): Map<number, PointerPosition> {
  const newPointers = new Map(pointers)
  if (newPointers.has(pointerId)) {
    newPointers.set(pointerId, { x, y, identifier: pointerId })
  }
  return newPointers
}

/**
 * Add pointer to the map
 */
export function addPointer(
  pointers: Map<number, PointerPosition>,
  pointerId: number,
  x: number,
  y: number
): Map<number, PointerPosition> {
  const newPointers = new Map(pointers)
  newPointers.set(pointerId, { x, y, identifier: pointerId })
  return newPointers
}

/**
 * Remove pointer from the map
 */
export function removePointer(
  pointers: Map<number, PointerPosition>,
  pointerId: number
): Map<number, PointerPosition> {
  const newPointers = new Map(pointers)
  newPointers.delete(pointerId)
  return newPointers
}
