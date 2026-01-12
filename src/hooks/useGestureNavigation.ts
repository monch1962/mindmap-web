/**
 * Gesture navigation hook
 * Supports pinch-to-zoom, two-finger rotate, and pan gestures
 */

import { useEffect, useRef, useState } from 'react';
import { useReactFlow } from 'reactflow';

export interface GestureState {
  scale: number;
  rotation: number;
  panX: number;
  panY: number;
}

interface UseGestureNavigationOptions {
  onGestureChange?: (state: GestureState) => void;
  onPinch?: (delta: number) => void;
  onRotate?: (angle: number) => void;
  onPan?: (x: number, y: number) => void;
  enabled?: boolean;
}

interface PointerPosition {
  x: number;
  y: number;
  identifier: number;
}

export function useGestureNavigation({
  onGestureChange,
  onPinch,
  onRotate,
  onPan,
  enabled = true,
}: UseGestureNavigationOptions) {
  const [gestureState, setGestureState] = useState<GestureState>({
    scale: 1,
    rotation: 0,
    panX: 0,
    panY: 0,
  });

  const { getViewport, setViewport, zoomTo } = useReactFlow();
  const pointersRef = useRef<Map<number, PointerPosition>>(new Map());
  const initialPinchDistanceRef = useRef<number>(0);
  const initialAngleRef = useRef<number>(0);
  const lastPanPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Calculate distance between two pointers
  const getDistance = (p1: PointerPosition, p2: PointerPosition): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  // Calculate angle between two pointers
  const getAngle = (p1: PointerPosition, p2: PointerPosition): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  };

  // Handle pointer down
  const handlePointerDown = (e: PointerEvent) => {
    if (!enabled) return;

    pointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      identifier: e.pointerId,
    });

    const pointers = pointersRef.current;

    // Two-finger gestures
    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      initialPinchDistanceRef.current = getDistance(p1, p2);
      initialAngleRef.current = getAngle(p1, p2);
    }

    // Single-finger pan
    if (pointers.size === 1) {
      lastPanPositionRef.current = { x: e.clientX, y: e.clientY };
    }

    (e.target as Element).setPointerCapture(e.pointerId);
  };

  // Handle pointer move
  const handlePointerMove = (e: PointerEvent) => {
    if (!enabled) return;

    const pointers = pointersRef.current;

    // Update pointer position
    if (pointers.has(e.pointerId)) {
      pointers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
        identifier: e.pointerId,
      });
    }

    // Two-finger pinch zoom
    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      const currentDistance = getDistance(p1, p2);
      const currentAngle = getAngle(p1, p2);

      // Calculate pinch scale
      if (initialPinchDistanceRef.current > 0) {
        const scaleDelta = currentDistance / initialPinchDistanceRef.current;
        const newScale = Math.max(0.1, Math.min(5, gestureState.scale * scaleDelta));

        zoomTo(newScale);

        if (onPinch) {
          onPinch(scaleDelta);
        }

        setGestureState(prev => ({ ...prev, scale: newScale }));
      }

      // Calculate rotation
      if (initialAngleRef.current !== null) {
        const rotationDelta = currentAngle - initialAngleRef.current;
        const newRotation = gestureState.rotation + rotationDelta;

        if (onRotate) {
          onRotate(newRotation);
        }

        setGestureState(prev => ({ ...prev, rotation: newRotation }));
      }
    }

    // Single-finger pan
    if (pointers.size === 1 && lastPanPositionRef.current) {
      const deltaX = e.clientX - lastPanPositionRef.current.x;
      const deltaY = e.clientY - lastPanPositionRef.current.y;

      const viewport = getViewport();
      setViewport({
        x: viewport.x - deltaX / viewport.zoom,
        y: viewport.y - deltaY / viewport.zoom,
        zoom: viewport.zoom,
      });

      if (onPan) {
        onPan(deltaX, deltaY);
      }

      setGestureState(prev => ({
        ...prev,
        panX: prev.panX + deltaX,
        panY: prev.panY + deltaY,
      }));

      lastPanPositionRef.current = { x: e.clientX, y: e.clientY };
    }

    if (onGestureChange) {
      onGestureChange(gestureState);
    }
  };

  // Handle pointer up
  const handlePointerUp = (e: PointerEvent) => {
    if (!enabled) return;

    pointersRef.current.delete(e.pointerId);
    lastPanPositionRef.current = null;
    initialPinchDistanceRef.current = 0;
    initialAngleRef.current = 0;
  };

  // Setup event listeners
  useEffect(() => {
    const container = document.querySelector('.react-flow');
    if (!container) return;

    container.addEventListener('pointerdown', handlePointerDown as EventListener);
    container.addEventListener('pointermove', handlePointerMove as EventListener);
    container.addEventListener('pointerup', handlePointerUp as EventListener);
    container.addEventListener('pointercancel', handlePointerUp as EventListener);
    container.addEventListener('pointerout', handlePointerUp as EventListener);
    container.addEventListener('pointerleave', handlePointerUp as EventListener);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown as EventListener);
      container.removeEventListener('pointermove', handlePointerMove as EventListener);
      container.removeEventListener('pointerup', handlePointerUp as EventListener);
      container.removeEventListener('pointercancel', handlePointerUp as EventListener);
      container.removeEventListener('pointerout', handlePointerUp as EventListener);
      container.removeEventListener('pointerleave', handlePointerUp as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, gestureState, getViewport, setViewport, zoomTo]);

  return {
    gestureState,
    resetGestures: () => {
      setGestureState({ scale: 1, rotation: 0, panX: 0, panY: 0 });
    },
  };
}

/**
 * Hook for touch-friendly controls
 */
export function useTouchControls(enabled: boolean = true) {
  const [touchState, setTouchState] = useState({
    isTouch: false,
    isPinching: false,
    isPanning: false,
  });

  useEffect(() => {
    if (!enabled) return;

    // Detect touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTouchState(prev => ({ ...prev, isTouch: isTouchDevice }));

    if (isTouchDevice) {
      // Add touch-friendly class to body
      document.body.classList.add('touch-device');

      // Prevent default touch behaviors in flow container
      const flowContainer = document.querySelector('.react-flow');
      if (flowContainer) {
        flowContainer.addEventListener('touchmove', (e) => {
          // Allow default for pinch-to-zoom
          if ((e as TouchEvent).touches.length === 2) {
            e.preventDefault();
          }
        }, { passive: false });
      }
    }

    return () => {
      document.body.classList.remove('touch-device');
    };
  }, [enabled]);

  return touchState;
}

/**
 * Calculate optimal zoom for content
 */
export function calculateFitZoom(
  containerWidth: number,
  containerHeight: number,
  contentWidth: number,
  contentHeight: number,
  padding: number = 50
): number {
  const availableWidth = containerWidth - padding * 2;
  const availableHeight = containerHeight - padding * 2;

  const scaleX = availableWidth / contentWidth;
  const scaleY = availableHeight / contentHeight;

  return Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
}

/**
 * Animate zoom to target (deprecated - use ReactFlow's zoomTo instead)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function animateZoomTo(_targetZoom: number, _duration: number = 300): void {
  console.warn('animateZoomTo is deprecated. Use ReactFlow\'s zoomTo function instead.');
  // This function is kept for backward compatibility but no longer works
  // because getViewport needs to be called within a ReactFlow context
}
