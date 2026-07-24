import { useState, useCallback, useMemo } from 'react';
import type { TreeNode } from '../types/tree.types';

export const useTreeSelection = (
  multiple = false,
  controlledSelected?: (string | number)[],
  onNodeSelect?: (node: TreeNode) => void,
  getNode?: (id: string | number) => TreeNode | undefined
) => {
  const [internalSelected, setInternalSelected] = useState<Set<string | number>>(new Set());
  const isControlled = controlledSelected !== undefined;
  
  const selected = useMemo(
    () => (isControlled ? new Set(controlledSelected) : internalSelected),
    [isControlled, controlledSelected, internalSelected]
  );

  const toggleSelect = useCallback(
    (nodeId: string | number, multiSelect?: boolean) => {
      const node = getNode?.(nodeId);
      if (!node) return;

      const newSelected = new Set(selected);

      if (selected.has(nodeId)) {
        if (!isControlled) newSelected.delete(nodeId);
      } else {
        if (!isControlled) {
          if (!multiple || !multiSelect) newSelected.clear();
          newSelected.add(nodeId);
        }
      }

      if (!isControlled) setInternalSelected(newSelected);
      if (onNodeSelect) onNodeSelect(node);
    },
    [selected, multiple, isControlled, onNodeSelect, getNode]
  );

  return { selected, toggleSelect };
};
