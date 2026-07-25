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
      // Use functional update to avoid stale closure when toggle is called
      // in rapid succession (e.g. expandAll batch). We derive isExpanded from
      // the functional-update `prev` value rather than closing over `expanded`.
      if (!isControlled) {
        setInternalExpanded(prev => {
          const isExpanded = prev.has(nodeId);
          const node = getNode?.(nodeId);
          if (isExpanded) {
            if (node && onNodeCollapse) onNodeCollapse(node);
            const next = new Set(prev);
            next.delete(nodeId);
            return next;
          } else {
            if (node && onNodeExpand) onNodeExpand(node);
            const next = new Set(prev);
            next.add(nodeId);
            return next;
          }
        });
      } else {
        // Controlled: only fire callbacks, the parent drives the state
        const isExpanded = expanded.has(nodeId);
        const node = getNode?.(nodeId);
        if (isExpanded) {
          if (node && onNodeCollapse) onNodeCollapse(node);
        } else {
          if (node && onNodeExpand) onNodeExpand(node);
        }
      }
    },
    [isControlled, expanded, onNodeExpand, onNodeCollapse, getNode]
  );

  const expand = useCallback(
    (nodeId: string | number) => {
      if (!isControlled) {
        setInternalExpanded(prev => {
          if (prev.has(nodeId)) return prev; // already expanded — no-op
          const node = getNode?.(nodeId);
          if (node && onNodeExpand) onNodeExpand(node);
          return new Set([...prev, nodeId]);
        });
      } else {
        if (!expanded.has(nodeId)) toggle(nodeId);
      }
    },
    [isControlled, expanded, toggle, getNode, onNodeExpand]
  );

  const collapse = useCallback(
    (nodeId: string | number) => {
      if (!isControlled) {
        setInternalExpanded(prev => {
          if (!prev.has(nodeId)) return prev; // already collapsed — no-op
          const node = getNode?.(nodeId);
          if (node && onNodeCollapse) onNodeCollapse(node);
          const next = new Set(prev);
          next.delete(nodeId);
          return next;
        });
      } else {
        if (expanded.has(nodeId)) toggle(nodeId);
      }
    },
    [isControlled, expanded, toggle, getNode, onNodeCollapse]
  );

  /**
   * Expands all provided IDs in a single setState call instead of N separate
   * calls (used by the imperative expandAll() method).
   */
  const expandBulk = useCallback(
    (ids: (string | number)[]) => {
      if (!isControlled) {
        setInternalExpanded(prev => {
          const next = new Set(prev);
          ids.forEach(id => next.add(id));
          return next;
        });
      }
    },
    [isControlled]
  );

  /**
   * Collapses all expanded nodes in a single setState call.
   */
  const collapseAll = useCallback(() => {
    if (!isControlled) {
      setInternalExpanded(new Set());
    }
  }, [isControlled]);

  return { expanded, toggle, expand, collapse, expandBulk, collapseAll };
};
