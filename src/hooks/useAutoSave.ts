import { useCallback, useEffect, useRef, useState } from 'react';
import type { Node, Edge } from 'reactflow';
import type { MindMapNodeData, MindMapTree } from '../types';
import { flowToTree } from '../utils/mindmapConverter';

const AUTOSAVE_KEY = 'mindmap_autosave';
const AUTOSAVE_HISTORY_KEY = 'mindmap_autosave_history';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const MAX_HISTORY_SLOTS = 5; // Keep last 5 auto-saves

export interface SaveSlot {
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
  tree: MindMapTree | null;
  timestamp: number;
  label: string;
}

interface UseAutoSaveOptions {
  nodes: Node<MindMapNodeData>[];
  edges: Edge[];
  onSaveStatusChange?: (status: 'saved' | 'unsaved' | 'saving') => void;
  onConflictFound?: (saveSlot: SaveSlot) => void;
}

/**
 * Format timestamp as readable label
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Today at ${time}`;
  } else if (isYesterday) {
    return `Yesterday at ${time}`;
  } else {
    return `${date.toLocaleDateString()} ${time}`;
  }
}

/**
 * Hook for auto-saving mind map to localStorage with multiple save slots
 */
export function useAutoSave({ nodes, edges, onSaveStatusChange, onConflictFound }: UseAutoSaveOptions) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const [saveHistory, setSaveHistory] = useState<SaveSlot[]>([]);
  const initialLoadDoneRef = useRef(false);

  // Load save history on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const historyJson = localStorage.getItem(AUTOSAVE_HISTORY_KEY);
        if (historyJson) {
          const history = JSON.parse(historyJson) as SaveSlot[];
          setSaveHistory(history);
          return history;
        }
      } catch (error) {
        console.error('Failed to load save history:', error);
      }
      return [];
    };

    loadHistory();

    // Check for conflict - if there's an auto-save from previous session
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved && !initialLoadDoneRef.current) {
      try {
        const data = JSON.parse(saved);
        if (data.nodes && data.edges && data.timestamp) {
          const age = Date.now() - data.timestamp;
          const hoursAgo = Math.floor(age / (1000 * 60 * 60));
          const minutesAgo = Math.floor((age % (1000 * 60 * 60)) / (1000 * 60));

          let timeAgo = '';
          if (hoursAgo > 0) {
            timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
          } else if (minutesAgo > 0) {
            timeAgo = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
          } else {
            timeAgo = 'just now';
          }

          // If there's a saved version older than 1 minute, trigger conflict resolution
          if (age > 60000) {
            const saveSlot: SaveSlot = {
              nodes: data.nodes,
              edges: data.edges,
              tree: data.tree,
              timestamp: data.timestamp,
              label: `Auto-save from ${timeAgo}`,
            };
            onConflictFound?.(saveSlot);
          } else {
            console.log(`Found recent auto-saved mind map from ${timeAgo}`);
          }
        }
      } catch (error) {
        console.error('Failed to load auto-saved data:', error);
      }
    }

    initialLoadDoneRef.current = true;
  }, [onConflictFound]);

  // Add to save history
  const addToHistory = useCallback((slot: SaveSlot) => {
    setSaveHistory((prevHistory) => {
      const newHistory = [slot, ...prevHistory].slice(0, MAX_HISTORY_SLOTS);
      try {
        localStorage.setItem(AUTOSAVE_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save history:', error);
      }
      return newHistory;
    });
  }, []);

  // Save to localStorage
  const save = useCallback(() => {
    onSaveStatusChange?.('saving');

    try {
      const tree = flowToTree(nodes, edges);
      if (!tree) return;

      const data = {
        nodes,
        edges,
        tree,
        timestamp: Date.now(),
      };

      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
      lastSavedRef.current = JSON.stringify(nodes) + JSON.stringify(edges);

      // Add to history
      const slot: SaveSlot = {
        nodes,
        edges,
        tree,
        timestamp: data.timestamp,
        label: formatTimestamp(data.timestamp),
      };
      addToHistory(slot);

      onSaveStatusChange?.('saved');
    } catch (error) {
      console.error('Failed to auto-save:', error);
      onSaveStatusChange?.('unsaved');
    }
  }, [nodes, edges, onSaveStatusChange, addToHistory]);

  // Trigger save on changes
  useEffect(() => {
    const currentData = JSON.stringify(nodes) + JSON.stringify(edges);

    // Only save if data has changed
    if (currentData !== lastSavedRef.current) {
      onSaveStatusChange?.('unsaved');

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule save
      saveTimeoutRef.current = setTimeout(() => {
        save();
      }, AUTOSAVE_INTERVAL);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, onSaveStatusChange, save]);

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      save();
    };
  }, [save]);

  // Manual save trigger
  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    save();
  }, [save]);

  // Clear auto-saved data
  const clearAutoSave = useCallback(() => {
    localStorage.removeItem(AUTOSAVE_KEY);
    localStorage.removeItem(AUTOSAVE_HISTORY_KEY);
    lastSavedRef.current = '';
    setSaveHistory([]);
  }, []);

  // Restore from specific history slot
  const restoreFromHistory = useCallback((index: number) => {
    const slot = saveHistory[index];
    if (slot) {
      lastSavedRef.current = JSON.stringify(slot.nodes) + JSON.stringify(slot.edges);
      return slot;
    }
    return null;
  }, [saveHistory]);

  // Delete specific history slot
  const deleteHistorySlot = useCallback((index: number) => {
    setSaveHistory((prevHistory) => {
      const newHistory = prevHistory.filter((_, i) => i !== index);
      try {
        localStorage.setItem(AUTOSAVE_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save history:', error);
      }
      return newHistory;
    });
  }, []);

  return {
    saveNow,
    clearAutoSave,
    saveHistory,
    restoreFromHistory,
    deleteHistorySlot,
  };
}
