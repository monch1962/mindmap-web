import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGestureNavigation, useTouchControls, calculateFitZoom } from './useGestureNavigation'

// Mock ReactFlow
vi.mock('reactflow', () => ({
  useReactFlow: () => ({
    getViewport: () => ({ x: 0, y: 0, zoom: 1 }),
    setViewport: vi.fn(),
    zoomTo: vi.fn(),
  }),
}))

describe('useGestureNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default gesture state', () => {
      const { result } = renderHook(() => useGestureNavigation({}))

      expect(result.current.gestureState).toEqual({
        scale: 1,
        rotation: 0,
        panX: 0,
        panY: 0,
      })
    })

    it('should provide resetGestures function', () => {
      const { result } = renderHook(() => useGestureNavigation({}))

      expect(result.current.resetGestures).toBeDefined()

      act(() => {
        result.current.resetGestures()
      })
      expect(result.current.gestureState).toEqual({
        scale: 1,
        rotation: 0,
        panX: 0,
        panY: 0,
      })
    })
  })

  describe('callback support', () => {
    it('should accept all optional callbacks', () => {
      const onGestureChange = vi.fn()
      const onPinch = vi.fn()
      const onRotate = vi.fn()
      const onPan = vi.fn()

      expect(() => {
        renderHook(() =>
          useGestureNavigation({
            onGestureChange,
            onPinch,
            onRotate,
            onPan,
          })
        )
      }).not.toThrow()
    })

    it('should accept enabled parameter', () => {
      const { result } = renderHook(() => useGestureNavigation({ enabled: false }))

      expect(result.current.gestureState).toBeDefined()
    })
  })

  describe('gesture state', () => {
    it('should maintain gesture state structure', () => {
      const { result } = renderHook(() => useGestureNavigation({}))

      expect(result.current.gestureState).toHaveProperty('scale')
      expect(result.current.gestureState).toHaveProperty('rotation')
      expect(result.current.gestureState).toHaveProperty('panX')
      expect(result.current.gestureState).toHaveProperty('panY')
    })
  })
})

describe('useTouchControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with touch state', () => {
      const { result } = renderHook(() => useTouchControls(true))

      expect(result.current.isTouch).toBeDefined()
      expect(result.current.isPinching).toBeDefined()
      expect(result.current.isPanning).toBeDefined()
    })

    it('should accept enabled parameter', () => {
      const { result } = renderHook(() => useTouchControls(false))

      expect(result.current.isTouch).toBeDefined()
    })
  })

  describe('touch state', () => {
    it('should track touch detection', () => {
      const { result } = renderHook(() => useTouchControls(true))

      expect(typeof result.current.isTouch).toBe('boolean')
    })

    it('should track pinch state', () => {
      const { result } = renderHook(() => useTouchControls(true))

      expect(typeof result.current.isPinching).toBe('boolean')
    })

    it('should track pan state', () => {
      const { result } = renderHook(() => useTouchControls(true))

      expect(typeof result.current.isPanning).toBe('boolean')
    })
  })
})

describe('calculateFitZoom', () => {
  it('should calculate zoom to fit content', () => {
    const zoom = calculateFitZoom(1000, 800, 500, 400, 50)

    expect(zoom).toBeGreaterThan(0)
    expect(zoom).toBeLessThanOrEqual(1)
  })

  it('should not zoom in beyond 100%', () => {
    const zoom = calculateFitZoom(1000, 800, 100, 100, 50)

    expect(zoom).toBeLessThanOrEqual(1)
  })

  it('should respect padding', () => {
    const zoom1 = calculateFitZoom(1000, 800, 500, 400, 0)
    const zoom2 = calculateFitZoom(1000, 800, 500, 400, 100)

    expect(zoom2).toBeLessThanOrEqual(zoom1)
  })

  it('should handle large content', () => {
    const zoom = calculateFitZoom(1000, 800, 5000, 4000, 50)

    expect(zoom).toBeGreaterThan(0)
    expect(zoom).toBeLessThan(1)
  })

  it('should handle small content', () => {
    const zoom = calculateFitZoom(1000, 800, 100, 100, 50)

    expect(zoom).toBe(1) // Should not zoom in beyond 100%
  })

  it('should handle square container and content', () => {
    const zoom = calculateFitZoom(1000, 1000, 500, 500, 50)

    expect(zoom).toBeGreaterThan(0)
    expect(zoom).toBeLessThanOrEqual(1)
  })

  it('should use minimum of scaleX and scaleY', () => {
    const zoom = calculateFitZoom(1000, 800, 900, 400, 50)

    const expectedScaleX = (1000 - 100) / 900
    const expectedScaleY = (800 - 100) / 400
    const expectedZoom = Math.min(expectedScaleX, expectedScaleY, 1)

    expect(zoom).toBeCloseTo(expectedZoom, 5)
  })

  describe('edge cases', () => {
    it('should handle very large padding', () => {
      const zoom = calculateFitZoom(1000, 800, 500, 400, 500)

      expect(zoom).toBeGreaterThan(0)
    })

    it('should handle container smaller than content', () => {
      const zoom = calculateFitZoom(500, 400, 1000, 800, 50)

      expect(zoom).toBeGreaterThan(0)
      expect(zoom).toBeLessThan(1)
    })

    it('should handle zero dimensions', () => {
      const zoom = calculateFitZoom(1000, 800, 0, 0, 50)

      expect(zoom).toBeGreaterThan(0)
    })
  })
})

describe('integration', () => {
  it('should work with all gesture types', () => {
    const { result } = renderHook(() =>
      useGestureNavigation({
        onGestureChange: vi.fn(),
        onPinch: vi.fn(),
        onRotate: vi.fn(),
        onPan: vi.fn(),
      })
    )

    expect(result.current.gestureState).toBeDefined()
    expect(result.current.resetGestures).toBeDefined()
  })

  it('should handle rapid state changes without errors', () => {
    const { result } = renderHook(() => useGestureNavigation({}))

    // Trigger rapid state changes
    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.resetGestures()
      }
    })

    expect(result.current.gestureState.scale).toBe(1)
  })
})
