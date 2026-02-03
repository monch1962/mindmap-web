import { describe, it, expect } from 'vitest'
import {
  getDistance,
  getAngle,
  calculatePinchScale,
  calculateRotation,
  calculatePan,
  getTwoPointers,
  shouldProcessGesture,
  updatePointerPosition,
  addPointer,
  removePointer,
  type PointerPosition,
} from './gestureUtils'

describe('gestureUtils', () => {
  describe('getDistance', () => {
    it('should calculate distance between two points', () => {
      const p1: PointerPosition = { x: 0, y: 0, identifier: 1 }
      const p2: PointerPosition = { x: 3, y: 4, identifier: 2 }

      const distance = getDistance(p1, p2)

      expect(distance).toBe(5) // 3-4-5 triangle
    })

    it('should handle negative coordinates', () => {
      const p1: PointerPosition = { x: -2, y: -3, identifier: 1 }
      const p2: PointerPosition = { x: 1, y: 1, identifier: 2 }

      const distance = getDistance(p1, p2)

      // sqrt((1 - (-2))^2 + (1 - (-3))^2) = sqrt(3^2 + 4^2) = sqrt(9 + 16) = sqrt(25) = 5
      expect(distance).toBe(5)
    })

    it('should return 0 for same point', () => {
      const p1: PointerPosition = { x: 5, y: 5, identifier: 1 }
      const p2: PointerPosition = { x: 5, y: 5, identifier: 2 }

      const distance = getDistance(p1, p2)

      expect(distance).toBe(0)
    })
  })

  describe('getAngle', () => {
    it('should calculate angle between two points', () => {
      const p1: PointerPosition = { x: 0, y: 0, identifier: 1 }
      const p2: PointerPosition = { x: 1, y: 0, identifier: 2 }

      const angle = getAngle(p1, p2)

      expect(angle).toBe(0) // Rightward direction
    })

    it('should calculate 90 degree angle', () => {
      const p1: PointerPosition = { x: 0, y: 0, identifier: 1 }
      const p2: PointerPosition = { x: 0, y: 1, identifier: 2 }

      const angle = getAngle(p1, p2)

      expect(angle).toBe(90) // Upward direction
    })

    it('should calculate 45 degree angle', () => {
      const p1: PointerPosition = { x: 0, y: 0, identifier: 1 }
      const p2: PointerPosition = { x: 1, y: 1, identifier: 2 }

      const angle = getAngle(p1, p2)

      expect(angle).toBe(45)
    })

    it('should handle negative angles', () => {
      const p1: PointerPosition = { x: 0, y: 0, identifier: 1 }
      const p2: PointerPosition = { x: 1, y: -1, identifier: 2 }

      const angle = getAngle(p1, p2)

      expect(angle).toBe(-45)
    })
  })

  describe('calculatePinchScale', () => {
    it('should calculate scale delta for pinch zoom in', () => {
      const data = {
        initialDistance: 100,
        currentDistance: 200,
        currentScale: 1,
      }

      const result = calculatePinchScale(data)

      expect(result.scaleDelta).toBe(2) // 200/100 = 2
      expect(result.newScale).toBe(2) // 1 * 2 = 2
    })

    it('should calculate scale delta for pinch zoom out', () => {
      const data = {
        initialDistance: 200,
        currentDistance: 100,
        currentScale: 2,
      }

      const result = calculatePinchScale(data)

      expect(result.scaleDelta).toBe(0.5) // 100/200 = 0.5
      expect(result.newScale).toBe(1) // 2 * 0.5 = 1
    })

    it('should clamp scale to minimum 0.1', () => {
      const data = {
        initialDistance: 100,
        currentDistance: 10, // Very small
        currentScale: 0.5,
      }

      const result = calculatePinchScale(data)

      expect(result.scaleDelta).toBe(0.1) // 10/100 = 0.1
      expect(result.newScale).toBe(0.1) // Clamped to minimum 0.1 (0.5 * 0.1 = 0.05, clamped to 0.1)
    })

    it('should clamp scale to maximum 5', () => {
      const data = {
        initialDistance: 10,
        currentDistance: 1000, // Very large
        currentScale: 4,
      }

      const result = calculatePinchScale(data)

      expect(result.scaleDelta).toBe(100) // 1000/10 = 100
      expect(result.newScale).toBe(5) // Clamped to maximum 5 (4 * 100 = 400, clamped to 5)
    })

    it('should handle zero initial distance', () => {
      const data = {
        initialDistance: 0,
        currentDistance: 100,
        currentScale: 1,
      }

      const result = calculatePinchScale(data)

      expect(result.scaleDelta).toBe(1) // Returns 1 when initialDistance <= 0
      expect(result.newScale).toBe(1) // currentScale unchanged
    })

    it('should handle negative initial distance', () => {
      const data = {
        initialDistance: -10,
        currentDistance: 100,
        currentScale: 1,
      }

      const result = calculatePinchScale(data)

      expect(result.scaleDelta).toBe(1) // Returns 1 when initialDistance <= 0
      expect(result.newScale).toBe(1) // currentScale unchanged
    })
  })

  describe('calculateRotation', () => {
    it('should calculate simple rotation', () => {
      const data = {
        initialAngle: 0,
        currentAngle: 45,
        currentRotation: 0,
      }

      const result = calculateRotation(data)

      expect(result.rotationDelta).toBe(45)
      expect(result.newRotation).toBe(45)
    })

    it('should handle negative rotation', () => {
      const data = {
        initialAngle: 45,
        currentAngle: 0,
        currentRotation: 10,
      }

      const result = calculateRotation(data)

      expect(result.rotationDelta).toBe(-45)
      expect(result.newRotation).toBe(-35) // 10 + (-45) = -35
    })

    it('should handle wrap-around from 359 to 1', () => {
      const data = {
        initialAngle: 359,
        currentAngle: 1,
        currentRotation: 0,
      }

      const result = calculateRotation(data)

      // 1 - 359 = -358, but normalized to shortest rotation: -358 + 360 = 2
      expect(result.rotationDelta).toBe(2)
      expect(result.newRotation).toBe(2)
    })

    it('should handle wrap-around from 1 to 359', () => {
      const data = {
        initialAngle: 1,
        currentAngle: 359,
        currentRotation: 0,
      }

      const result = calculateRotation(data)

      // 359 - 1 = 358, but normalized to shortest rotation: 358 - 360 = -2
      expect(result.rotationDelta).toBe(-2)
      expect(result.newRotation).toBe(-2)
    })

    it('should handle large positive rotation', () => {
      const data = {
        initialAngle: 0,
        currentAngle: 270,
        currentRotation: 0,
      }

      const result = calculateRotation(data)

      // 270 - 0 = 270, but normalized: 270 > 180, so 270 - 360 = -90
      expect(result.rotationDelta).toBe(-90)
      expect(result.newRotation).toBe(-90)
    })

    it('should handle large negative rotation', () => {
      const data = {
        initialAngle: 270,
        currentAngle: 0,
        currentRotation: 0,
      }

      const result = calculateRotation(data)

      // 0 - 270 = -270, but normalized: -270 < -180, so -270 + 360 = 90
      expect(result.rotationDelta).toBe(90)
      expect(result.newRotation).toBe(90)
    })
  })

  describe('calculatePan', () => {
    it('should calculate pan delta', () => {
      const data = {
        lastX: 100,
        lastY: 100,
        currentX: 150,
        currentY: 120,
        currentPanX: 0,
        currentPanY: 0,
      }

      const result = calculatePan(data)

      expect(result.deltaX).toBe(50) // 150 - 100
      expect(result.deltaY).toBe(20) // 120 - 100
      expect(result.newPanX).toBe(50) // 0 + 50
      expect(result.newPanY).toBe(20) // 0 + 20
    })

    it('should handle negative pan', () => {
      const data = {
        lastX: 150,
        lastY: 120,
        currentX: 100,
        currentY: 100,
        currentPanX: 10,
        currentPanY: 5,
      }

      const result = calculatePan(data)

      expect(result.deltaX).toBe(-50) // 100 - 150
      expect(result.deltaY).toBe(-20) // 100 - 120
      expect(result.newPanX).toBe(-40) // 10 + (-50)
      expect(result.newPanY).toBe(-15) // 5 + (-20)
    })

    it('should handle zero movement', () => {
      const data = {
        lastX: 100,
        lastY: 100,
        currentX: 100,
        currentY: 100,
        currentPanX: 5,
        currentPanY: 5,
      }

      const result = calculatePan(data)

      expect(result.deltaX).toBe(0)
      expect(result.deltaY).toBe(0)
      expect(result.newPanX).toBe(5)
      expect(result.newPanY).toBe(5)
    })
  })

  describe('getTwoPointers', () => {
    it('should return two pointers when map has exactly two', () => {
      const pointers = new Map<number, PointerPosition>([
        [1, { x: 0, y: 0, identifier: 1 }],
        [2, { x: 10, y: 10, identifier: 2 }],
      ])

      const result = getTwoPointers(pointers)

      expect(result).toEqual([
        { x: 0, y: 0, identifier: 1 },
        { x: 10, y: 10, identifier: 2 },
      ])
    })

    it('should return null when map has less than two pointers', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = getTwoPointers(pointers)

      expect(result).toBeNull()
    })

    it('should return null when map has more than two pointers', () => {
      const pointers = new Map<number, PointerPosition>([
        [1, { x: 0, y: 0, identifier: 1 }],
        [2, { x: 10, y: 10, identifier: 2 }],
        [3, { x: 20, y: 20, identifier: 3 }],
      ])

      const result = getTwoPointers(pointers)

      expect(result).toBeNull()
    })

    it('should return null for empty map', () => {
      const pointers = new Map<number, PointerPosition>()

      const result = getTwoPointers(pointers)

      expect(result).toBeNull()
    })
  })

  describe('shouldProcessGesture', () => {
    it('should return true when enabled and has pointers', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = shouldProcessGesture(true, pointers)

      expect(result).toBe(true)
    })

    it('should return false when disabled', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = shouldProcessGesture(false, pointers)

      expect(result).toBe(false)
    })

    it('should return false when no pointers', () => {
      const pointers = new Map<number, PointerPosition>()

      const result = shouldProcessGesture(true, pointers)

      expect(result).toBe(false)
    })

    it('should return false when disabled and no pointers', () => {
      const pointers = new Map<number, PointerPosition>()

      const result = shouldProcessGesture(false, pointers)

      expect(result).toBe(false)
    })
  })

  describe('updatePointerPosition', () => {
    it('should update existing pointer position', () => {
      const pointers = new Map<number, PointerPosition>([
        [1, { x: 0, y: 0, identifier: 1 }],
        [2, { x: 10, y: 10, identifier: 2 }],
      ])

      const result = updatePointerPosition(pointers, 1, 5, 5)

      expect(result.size).toBe(2)
      expect(result.get(1)).toEqual({ x: 5, y: 5, identifier: 1 })
      expect(result.get(2)).toEqual({ x: 10, y: 10, identifier: 2 })
    })

    it('should not add new pointer if not exists', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = updatePointerPosition(pointers, 2, 5, 5)

      expect(result.size).toBe(1)
      expect(result.get(1)).toEqual({ x: 0, y: 0, identifier: 1 })
      expect(result.get(2)).toBeUndefined()
    })

    it('should return new map instance (immutable)', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = updatePointerPosition(pointers, 1, 5, 5)

      expect(result).not.toBe(pointers) // Should be new instance
      expect(pointers.get(1)).toEqual({ x: 0, y: 0, identifier: 1 }) // Original unchanged
    })
  })

  describe('addPointer', () => {
    it('should add new pointer to map', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = addPointer(pointers, 2, 10, 10)

      expect(result.size).toBe(2)
      expect(result.get(1)).toEqual({ x: 0, y: 0, identifier: 1 })
      expect(result.get(2)).toEqual({ x: 10, y: 10, identifier: 2 })
    })

    it('should overwrite existing pointer', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = addPointer(pointers, 1, 5, 5)

      expect(result.size).toBe(1)
      expect(result.get(1)).toEqual({ x: 5, y: 5, identifier: 1 })
    })

    it('should return new map instance (immutable)', () => {
      const pointers = new Map<number, PointerPosition>()

      const result = addPointer(pointers, 1, 0, 0)

      expect(result).not.toBe(pointers) // Should be new instance
    })
  })

  describe('removePointer', () => {
    it('should remove existing pointer', () => {
      const pointers = new Map<number, PointerPosition>([
        [1, { x: 0, y: 0, identifier: 1 }],
        [2, { x: 10, y: 10, identifier: 2 }],
      ])

      const result = removePointer(pointers, 1)

      expect(result.size).toBe(1)
      expect(result.get(1)).toBeUndefined()
      expect(result.get(2)).toEqual({ x: 10, y: 10, identifier: 2 })
    })

    it('should do nothing if pointer not exists', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = removePointer(pointers, 2)

      expect(result.size).toBe(1)
      expect(result.get(1)).toEqual({ x: 0, y: 0, identifier: 1 })
    })

    it('should return new map instance (immutable)', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = removePointer(pointers, 1)

      expect(result).not.toBe(pointers) // Should be new instance
      expect(pointers.get(1)).toBeDefined() // Original unchanged
    })
  })
})
