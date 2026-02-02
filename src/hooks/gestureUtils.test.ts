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
      const p1: PointerPosition = { x: -2, y: -1, identifier: 1 }
      const p2: PointerPosition = { x: 1, y: 2, identifier: 2 }

      const distance = getDistance(p1, p2)

      // sqrt((1 - (-2))^2 + (2 - (-1))^2) = sqrt(3^2 + 3^2) = sqrt(18) ≈ 4.2426
      expect(distance).toBeCloseTo(4.2426, 4)
    })

    it('should return 0 for same point', () => {
      const p1: PointerPosition = { x: 5, y: 5, identifier: 1 }
      const p2: PointerPosition = { x: 5, y: 5, identifier: 2 }

      const distance = getDistance(p1, p2)

      expect(distance).toBe(0)
    })
  })

  describe('getAngle', () => {
    it('should calculate angle for horizontal line', () => {
      const p1: PointerPosition = { x: 0, y: 0, identifier: 1 }
      const p2: PointerPosition = { x: 10, y: 0, identifier: 2 }

      const angle = getAngle(p1, p2)

      expect(angle).toBe(0) // Horizontal right
    })

    it('should calculate angle for vertical line', () => {
      const p1: PointerPosition = { x: 0, y: 0, identifier: 1 }
      const p2: PointerPosition = { x: 0, y: 10, identifier: 2 }

      const angle = getAngle(p1, p2)

      expect(angle).toBe(90) // Vertical down
    })

    it('should calculate angle for diagonal line', () => {
      const p1: PointerPosition = { x: 0, y: 0, identifier: 1 }
      const p2: PointerPosition = { x: 10, y: 10, identifier: 2 }

      const angle = getAngle(p1, p2)

      expect(angle).toBe(45) // 45-degree diagonal
    })

    it('should handle negative angles', () => {
      const p1: PointerPosition = { x: 0, y: 0, identifier: 1 }
      const p2: PointerPosition = { x: 10, y: -10, identifier: 2 }

      const angle = getAngle(p1, p2)

      expect(angle).toBe(-45) // -45-degree diagonal
    })
  })

  describe('calculatePinchScale', () => {
    it('should calculate scale increase', () => {
      const result = calculatePinchScale({
        initialDistance: 100,
        currentDistance: 150,
        currentScale: 1,
      })

      expect(result.scaleDelta).toBe(1.5) // 150/100
      expect(result.newScale).toBe(1.5) // 1 * 1.5
    })

    it('should calculate scale decrease', () => {
      const result = calculatePinchScale({
        initialDistance: 150,
        currentDistance: 100,
        currentScale: 2,
      })

      expect(result.scaleDelta).toBeCloseTo(0.6667, 4) // 100/150
      expect(result.newScale).toBeCloseTo(1.3333, 4) // 2 * 0.6667
    })

    it('should respect minimum scale', () => {
      const result = calculatePinchScale({
        initialDistance: 100,
        currentDistance: 5, // Very small distance
        currentScale: 1,
      })

      expect(result.newScale).toBe(0.1) // Minimum scale
    })

    it('should respect maximum scale', () => {
      const result = calculatePinchScale({
        initialDistance: 10,
        currentDistance: 100, // Very large distance
        currentScale: 4,
      })

      expect(result.newScale).toBe(5) // Maximum scale (4 * 2.5 = 10, but capped at 5)
    })

    it('should handle zero initial distance', () => {
      const result = calculatePinchScale({
        initialDistance: 0,
        currentDistance: 100,
        currentScale: 1,
      })

      expect(result.scaleDelta).toBe(1)
      expect(result.newScale).toBe(1)
    })
  })

  describe('calculateRotation', () => {
    it('should calculate positive rotation', () => {
      const result = calculateRotation({
        initialAngle: 0,
        currentAngle: 45,
        currentRotation: 10,
      })

      expect(result.rotationDelta).toBe(45)
      expect(result.newRotation).toBe(55) // 10 + 45
    })

    it('should calculate negative rotation', () => {
      const result = calculateRotation({
        initialAngle: 45,
        currentAngle: 0,
        currentRotation: 10,
      })

      expect(result.rotationDelta).toBe(-45)
      expect(result.newRotation).toBe(-35) // 10 - 45
    })

    it('should handle angle wrap-around', () => {
      const result = calculateRotation({
        initialAngle: 350,
        currentAngle: 10,
        currentRotation: 0,
      })

      // 10 - 350 = -340, but we want 20 degrees (360 - 340)
      expect(result.rotationDelta).toBe(20)
      expect(result.newRotation).toBe(20)
    })
  })

  describe('calculatePan', () => {
    it('should calculate pan movement', () => {
      const result = calculatePan({
        lastX: 100,
        lastY: 100,
        currentX: 150,
        currentY: 120,
        currentPanX: 10,
        currentPanY: 20,
      })

      expect(result.deltaX).toBe(50)
      expect(result.deltaY).toBe(20)
      expect(result.newPanX).toBe(60) // 10 + 50
      expect(result.newPanY).toBe(40) // 20 + 20
    })

    it('should handle negative movement', () => {
      const result = calculatePan({
        lastX: 150,
        lastY: 120,
        currentX: 100,
        currentY: 100,
        currentPanX: 60,
        currentPanY: 40,
      })

      expect(result.deltaX).toBe(-50)
      expect(result.deltaY).toBe(-20)
      expect(result.newPanX).toBe(10) // 60 - 50
      expect(result.newPanY).toBe(20) // 40 - 20
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
  })

  describe('updatePointerPosition', () => {
    it('should update existing pointer position', () => {
      const pointers = new Map<number, PointerPosition>([
        [1, { x: 0, y: 0, identifier: 1 }],
        [2, { x: 10, y: 10, identifier: 2 }],
      ])

      const result = updatePointerPosition(pointers, 1, 5, 5)

      expect(result.get(1)).toEqual({ x: 5, y: 5, identifier: 1 })
      expect(result.get(2)).toEqual({ x: 10, y: 10, identifier: 2 })
      expect(result.size).toBe(2)
    })

    it('should not add new pointer', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = updatePointerPosition(pointers, 2, 5, 5)

      expect(result.get(1)).toEqual({ x: 0, y: 0, identifier: 1 })
      expect(result.has(2)).toBe(false)
      expect(result.size).toBe(1)
    })

    it('should return new map instance', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = updatePointerPosition(pointers, 1, 5, 5)

      expect(result).not.toBe(pointers) // Should be a new instance
    })
  })

  describe('addPointer', () => {
    it('should add new pointer', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = addPointer(pointers, 2, 10, 10)

      expect(result.get(1)).toEqual({ x: 0, y: 0, identifier: 1 })
      expect(result.get(2)).toEqual({ x: 10, y: 10, identifier: 2 })
      expect(result.size).toBe(2)
    })

    it('should overwrite existing pointer', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = addPointer(pointers, 1, 10, 10)

      expect(result.get(1)).toEqual({ x: 10, y: 10, identifier: 1 })
      expect(result.size).toBe(1)
    })

    it('should return new map instance', () => {
      const pointers = new Map<number, PointerPosition>()

      const result = addPointer(pointers, 1, 0, 0)

      expect(result).not.toBe(pointers) // Should be a new instance
    })
  })

  describe('removePointer', () => {
    it('should remove existing pointer', () => {
      const pointers = new Map<number, PointerPosition>([
        [1, { x: 0, y: 0, identifier: 1 }],
        [2, { x: 10, y: 10, identifier: 2 }],
      ])

      const result = removePointer(pointers, 1)

      expect(result.has(1)).toBe(false)
      expect(result.get(2)).toEqual({ x: 10, y: 10, identifier: 2 })
      expect(result.size).toBe(1)
    })

    it('should handle non-existent pointer', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = removePointer(pointers, 2)

      expect(result.get(1)).toEqual({ x: 0, y: 0, identifier: 1 })
      expect(result.size).toBe(1)
    })

    it('should return new map instance', () => {
      const pointers = new Map<number, PointerPosition>([[1, { x: 0, y: 0, identifier: 1 }]])

      const result = removePointer(pointers, 1)

      expect(result).not.toBe(pointers) // Should be a new instance
    })
  })
})
