import { useCallback, useState } from 'react';
import type { Node, Edge } from 'reactflow';
import type { MindMapNodeData } from '../types';

interface HistoryState {
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
}

interface UseUndoRedoOptions {
  maxHistory?: number;
}

/**
 * Hook for undo/redo functionality
 */
export function useUndoRedo({ maxHistory = 50 }: UseUndoRedoOptions = {}) {
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Add current state to history
  const addToHistory = useCallback((nodes: Node<MindMapNodeData>[], edges: Edge[]) => {
    setPast((prevPast) => {
      const newPast = [...prevPast, { nodes, edges }];
      // Keep only the last maxHistory states
      return newPast.slice(-maxHistory);
    });
    setFuture([]); // Clear future when new action is performed
  }, [maxHistory]);

  // Undo last action
  const undo = useCallback((): HistoryState | null => {
    let result: HistoryState | null = null;
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;

      const previousState = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, -1);
      result = previousState;

      // Set current state to future
      setFuture((prevFuture) => [
        { nodes: previousState.nodes, edges: previousState.edges },
        ...prevFuture,
      ]);

      return newPast;
    });
    return result;
  }, []);

  // Redo next action
  const redo = useCallback((): HistoryState | null => {
    let result: HistoryState | null = null;
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;

      const nextState = prevFuture[0];
      const newFuture = prevFuture.slice(1);
      result = nextState;

      // Add redone state to past
      setPast((prevPast) => [
        ...prevPast,
        { nodes: nextState.nodes, edges: nextState.edges },
      ]);

      return newFuture;
    });
    return result;
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    past,
    future,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    clearHistory,
  };
}
