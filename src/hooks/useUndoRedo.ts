import { useCallback, useState } from 'react';
import type { Node, Edge } from 'reactflow';
import type { MindMapNodeData } from '../types';

export interface HistoryState {
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
  label: string;
  timestamp: number;
}

interface UseUndoRedoOptions {
  maxHistory?: number;
}

/**
 * Get a descriptive label for the action based on node/edge changes
 */
function getActionLabel(
  prevNodes: Node<MindMapNodeData>[],
  currNodes: Node<MindMapNodeData>[],
  prevEdges: Edge[],
  currEdges: Edge[]
): string {
  const prevNodeCount = prevNodes.length;
  const currNodeCount = currNodes.length;
  const prevEdgeCount = prevEdges.length;
  const currEdgeCount = currEdges.length;

  // Node additions
  if (currNodeCount > prevNodeCount) {
    const added = currNodeCount - prevNodeCount;
    if (added === 1) {
      // Check if it's a child or sibling
      const newNodes = currNodes.filter(n => !prevNodes.find(pn => pn.id === n.id));
      if (newNodes.length > 0) {
        const newNode = newNodes[0];
        const parentEdge = currEdges.find(e => e.target === newNode.id);
        if (parentEdge) {
          return `Added child node`;
        }
        return `Added sibling node`;
      }
    }
    return `Added ${added} nodes`;
  }

  // Node deletions
  if (currNodeCount < prevNodeCount) {
    const deleted = prevNodeCount - currNodeCount;
    if (deleted === 1) {
      return `Deleted node`;
    }
    return `Deleted ${deleted} nodes`;
  }

  // Edge additions (cross-links)
  if (currEdgeCount > prevEdgeCount) {
    const added = currEdgeCount - prevEdgeCount;
    if (added === 1) {
      return `Added cross-link`;
    }
    return `Added ${added} links`;
  }

  // Edge deletions
  if (currEdgeCount < prevEdgeCount) {
    return `Removed link`;
  }

  // Check for text edits
  const editedNode = currNodes.find(node => {
    const prevNode = prevNodes.find(pn => pn.id === node.id);
    return prevNode && prevNode.data.label !== node.data.label;
  });
  if (editedNode) {
    return `Edited text: "${editedNode.data.label.substring(0, 20)}${editedNode.data.label.length > 20 ? '...' : ''}"`;
  }

  // Check for metadata changes
  const metadataNode = currNodes.find(node => {
    const prevNode = prevNodes.find(pn => pn.id === node.id);
    return prevNode && JSON.stringify(prevNode.data.metadata) !== JSON.stringify(node.data.metadata);
  });
  if (metadataNode) {
    return `Updated metadata`;
  }

  // Check for icon changes
  const iconNode = currNodes.find(node => {
    const prevNode = prevNodes.find(pn => pn.id === node.id);
    return prevNode && prevNode.data.icon !== node.data.icon;
  });
  if (iconNode) {
    return `Changed icon`;
  }

  // Check for cloud changes
  const cloudNode = currNodes.find(node => {
    const prevNode = prevNodes.find(pn => pn.id === node.id);
    return prevNode && JSON.stringify(prevNode.data.cloud) !== JSON.stringify(node.data.cloud);
  });
  if (cloudNode) {
    return `Changed cloud`;
  }

  return `Action`;
}

/**
 * Hook for undo/redo functionality with labeled history
 */
export function useUndoRedo({ maxHistory = 50 }: UseUndoRedoOptions = {}) {
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [lastState, setLastState] = useState<{ nodes: Node<MindMapNodeData>[]; edges: Edge[] } | null>(null);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  // Add current state to history
  const addToHistory = useCallback((nodes: Node<MindMapNodeData>[], edges: Edge[]) => {
    setPast((prevPast) => {
      let label = 'Action';
      const timestamp = Date.now();

      // Try to determine action label if we have previous state
      if (lastState) {
        label = getActionLabel(lastState.nodes, nodes, lastState.edges, edges);
      }

      const newHistoryItem: HistoryState = {
        nodes,
        edges,
        label,
        timestamp,
      };

      const newPast = [...prevPast, newHistoryItem];
      // Keep only the last maxHistory states
      return newPast.slice(-maxHistory);
    });

    setLastState({ nodes, edges });
    setFuture([]); // Clear future when new action is performed
  }, [maxHistory, lastState]);

  // Undo last action
  const undo = useCallback((): HistoryState | null => {
    let result: HistoryState | null = null;
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;

      const previousState = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, -1);
      result = previousState;

      // Update last state
      setLastState({ nodes: previousState.nodes, edges: previousState.edges });

      // Set current state to future
      setFuture((prevFuture) => [
        previousState,
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

      // Update last state
      setLastState({ nodes: nextState.nodes, edges: nextState.edges });

      // Add redone state to past
      setPast((prevPast) => [
        ...prevPast,
        nextState,
      ]);

      return newFuture;
    });
    return result;
  }, []);

  // Jump to specific point in history
  const jumpToHistory = useCallback((index: number, fromPast: boolean): HistoryState | null => {
    if (fromPast) {
      // Jump to a point in past (undo multiple steps)
      if (index < 0 || index >= past.length) return null;

      const targetState = past[index];
      const statesToKeep = past.slice(0, index);
      const statesToMoveToFuture = past.slice(index + 1);

      setPast(statesToKeep);
      setFuture([...statesToMoveToFuture.reverse(), ...future]);
      setLastState({ nodes: targetState.nodes, edges: targetState.edges });

      return targetState;
    } else {
      // Jump to a point in future (redo multiple steps)
      if (index < 0 || index >= future.length) return null;

      const targetState = future[index];
      const statesToKeep = future.slice(index + 1);
      const statesToMoveToPast = future.slice(0, index);

      setFuture(statesToKeep);
      setPast([...past, ...statesToMoveToPast]);
      setLastState({ nodes: targetState.nodes, edges: targetState.edges });

      return targetState;
    }
  }, [past, future]);

  // Get full history as a single array (past + current + future)
  const getFullHistory = useCallback((): Array<HistoryState & { isCurrent: boolean }> => {
    const fullHistory: Array<HistoryState & { isCurrent: boolean }> = [
      ...past.map(item => ({ ...item, isCurrent: false })),
    ];

    // Add current state if available
    if (lastState) {
      fullHistory.push({
        nodes: lastState.nodes,
        edges: lastState.edges,
        label: 'Current state',
        timestamp: Date.now(),
        isCurrent: true,
      });
    }

    // Add future states (in reverse since future[0] is the next redo)
    [...future].reverse().forEach(item => {
      fullHistory.push({ ...item, isCurrent: false });
    });

    return fullHistory;
  }, [past, future, lastState]);

  // Clear history
  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
    setLastState(null);
  }, []);

  return {
    past,
    future,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    jumpToHistory,
    getFullHistory,
    clearHistory,
  };
}
