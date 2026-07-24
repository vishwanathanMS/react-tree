import { useState, useCallback, useMemo } from 'react';
import type { TreeNode } from '../types/tree.types';

export const useTreeExpansion = (
  defaultExpanded?: (string | number)[],
  controlledExpanded?: (string | number)[],
  onNodeExpand?: (node: TreeNode) => void,
  onNodeCollapse?: (node: TreeNode) => void,
  getNode?: (id: string | number) => TreeNode | undefined
) => {
  const [internalExpanded, setInternalExpanded] = useState<Set<string | number>>(
    new Set(defaultExpanded || [])
  );

  const isControlled = controlledExpanded !== undefined;
  const expanded = useMemo(() => {
    return isControlled ? new Set(controlledExpanded) : internalExpanded;
  }, [isControlled, controlledExpanded, internalExpanded]);

  const toggle = useCallback(
    (nodeId: string | number) => {
      const isExpanded = expanded.has(nodeId);
      const node = getNode?.(nodeId);

      if (isExpanded) {
        if (!isControlled) {
          const next = new Set(expanded);
          next.delete(nodeId);
          setInternalExpanded(next);
        }
        if (node && onNodeCollapse) onNodeCollapse(node);
      } else {
        if (!isControlled) {
          const next = new Set(expanded);
          next.add(nodeId);
          setInternalExpanded(next);
        }
        if (node && onNodeExpand) onNodeExpand(node);
      }
    },
    [expanded, isControlled, onNodeExpand, onNodeCollapse, getNode]
  );

  const expand = useCallback(
    (nodeId: string | number) => {
      if (!expanded.has(nodeId)) toggle(nodeId);
    },
    [expanded, toggle]
  );

  const collapse = useCallback(
    (nodeId: string | number) => {
      if (expanded.has(nodeId)) toggle(nodeId);
    },
    [expanded, toggle]
  );

  return { expanded, toggle, expand, collapse };
};
