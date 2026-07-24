import { useState, useCallback } from 'react';
import type { TreeNode } from '../types/tree.types';

export const useTreeDragDrop = (
  draggable?: boolean,
  onNodeDrop?: (source: TreeNode, target: TreeNode, position: 'before' | 'inside' | 'after') => void,
  getNode?: (id: string | number) => TreeNode | undefined
) => {
  const [dragState, setDragStateInternal] = useState({
    isDragging: false,
    draggedNodeId: null as string | number | null,
    dropTargetId: null as string | number | null,
    dropPosition: null as 'before' | 'inside' | 'after' | null,
  });

  const setDragState = useCallback((partialState: Partial<typeof dragState>) => {
    setDragStateInternal(prev => ({ ...prev, ...partialState }));
  }, []);

  const handleDrop = useCallback(
    (sourceId: string | number, targetId: string | number, position: 'before' | 'inside' | 'after') => {
      const sourceNode = getNode?.(sourceId);
      const targetNode = getNode?.(targetId);

      if (sourceNode && targetNode && onNodeDrop && sourceId !== targetId) {
        onNodeDrop(sourceNode, targetNode, position);
      }
      setDragState({ isDragging: false, draggedNodeId: null, dropTargetId: null, dropPosition: null });
    },
    [getNode, onNodeDrop, setDragState]
  );

  return { dragState, setDragState, handleDrop };
};
