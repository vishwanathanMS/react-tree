import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import type { TreeNode } from '../types/tree.types';

export interface UseTreeKeyboardOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  visibleNodes: { node: TreeNode; depth: number }[];
  expandedNodes: Set<string | number>;
  parentMap?: Map<string | number, string | number>;
  virtual?: boolean;
  itemHeight?: number;
  height?: number | string;
  toggleSelect: (id: string | number, multi?: boolean) => void;
  toggleExpand: (id: string | number) => void;
  toggleCheck: (id: string | number) => void;
  setEditingNodeId?: (id: string | number | null) => void;
  editable?: boolean;
}

const escapeId = (id: string | number) => {
  const str = String(id);
  return typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(str) : str.replace(/(["\\])/g, '\\$1');
};

export const useTreeKeyboard = (options: UseTreeKeyboardOptions) => {
  const {
    containerRef,
    visibleNodes,
    expandedNodes,
    parentMap,
    virtual = false,
    itemHeight = 28,
    height = 400,
    toggleSelect,
    toggleExpand,
    toggleCheck,
    setEditingNodeId,
    editable = false,
  } = options;

  const pendingFocusIdRef = useRef<string | number | null>(null);

  /**
   * O(1) node → index lookup map, rebuilt only when visibleNodes reference changes.
   * Avoids a linear findIndex scan on every keydown event.
   */
  const nodeIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < visibleNodes.length; i++) {
      map.set(String(visibleNodes[i].node.id), i);
    }
    return map;
  }, [visibleNodes]);

  // Attempt to focus pending node after virtual scroll re-render
  useEffect(() => {
    if (pendingFocusIdRef.current != null && containerRef.current) {
      const targetId = pendingFocusIdRef.current;
      const escaped = escapeId(targetId);
      const rowEl = containerRef.current.querySelector(`.tree-node-row[data-node-id="${escaped}"]`) as HTMLElement;
      if (rowEl) {
        rowEl.focus();
        pendingFocusIdRef.current = null;
      }
    }
  }, [visibleNodes, containerRef]);

  const focusNodeIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= visibleNodes.length) return;
      const targetNode = visibleNodes[index].node;
      pendingFocusIdRef.current = targetNode.id;

      if (virtual && containerRef.current) {
        const container = containerRef.current;
        const targetTop = index * itemHeight;
        const targetBottom = targetTop + itemHeight;
        const containerScrollTop = container.scrollTop;
        const numericHeight = typeof height === 'number' ? height : parseInt(String(height), 10) || 400;

        if (targetTop < containerScrollTop) {
          container.scrollTop = targetTop;
        } else if (targetBottom > containerScrollTop + numericHeight) {
          container.scrollTop = targetBottom - (numericHeight - itemHeight);
        }
      }

      const tryFocus = () => {
        if (!containerRef.current || pendingFocusIdRef.current !== targetNode.id) return;
        const escaped = escapeId(targetNode.id);
        const rowEl = containerRef.current.querySelector(`.tree-node-row[data-node-id="${escaped}"]`) as HTMLElement;
        if (rowEl) {
          rowEl.focus();
          pendingFocusIdRef.current = null;
        } else {
          const wrapperEl = containerRef.current.querySelector(`[data-node-id="${escaped}"]`) as HTMLElement;
          if (wrapperEl) {
            wrapperEl.focus();
            pendingFocusIdRef.current = null;
          }
        }
      };

      // Retry focusing across frames in case of async virtual scroll state re-rendering
      requestAnimationFrame(() => {
        tryFocus();
        if (pendingFocusIdRef.current === targetNode.id) {
          setTimeout(tryFocus, 20);
        }
      });
    },
    [visibleNodes, virtual, itemHeight, height, containerRef]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      // Do not intercept keyboard shortcuts if user is currently typing in an inline edit input
      const targetEl = e.target as HTMLElement;
      if (targetEl && targetEl.tagName === 'INPUT') return;

      const nodeTarget = targetEl.closest('[data-node-id]') as HTMLElement | null;
      const activeEl = nodeTarget || (document.activeElement as HTMLElement | null)?.closest('[data-node-id]') as HTMLElement | null;

      const nodeIdStr = activeEl?.getAttribute('data-node-id');
      let currentIndex = -1;

      if (nodeIdStr != null) {
        // O(1) lookup via pre-built map instead of O(n) findIndex
        currentIndex = nodeIndexMap.get(nodeIdStr) ?? -1;
      }

      // Fallback: If container itself has focus and no node is active yet, default to first visible node
      if (currentIndex === -1 && visibleNodes.length > 0) {
        if (e.key === 'ArrowUp' || e.key === 'End') {
          currentIndex = visibleNodes.length - 1;
        } else {
          currentIndex = 0;
        }
      }

      if (currentIndex === -1) return;

      const currentItem = visibleNodes[currentIndex];
      const node = currentItem.node;
      const isNodeExpanded = expandedNodes.has(node.id);
      const hasChildren = !!node.children?.length || !!node.hasChildren;

      const numericHeight = typeof height === 'number' ? height : parseInt(String(height), 10) || 400;
      const pageSize = Math.max(1, Math.floor(numericHeight / itemHeight));

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusNodeIndex(currentIndex + 1);
          break;

        case 'ArrowUp':
          e.preventDefault();
          focusNodeIndex(currentIndex - 1);
          break;

        case 'PageDown':
          e.preventDefault();
          focusNodeIndex(Math.min(visibleNodes.length - 1, currentIndex + pageSize));
          break;

        case 'PageUp':
          e.preventDefault();
          focusNodeIndex(Math.max(0, currentIndex - pageSize));
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (hasChildren && !isNodeExpanded) {
            toggleExpand(node.id);
          } else if (hasChildren && isNodeExpanded && currentIndex < visibleNodes.length - 1) {
            focusNodeIndex(currentIndex + 1);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (hasChildren && isNodeExpanded) {
            toggleExpand(node.id);
          } else {
            const parentId = parentMap?.get(node.id) ?? node.parentId;
            if (parentId != null) {
              const parentIndex = nodeIndexMap.get(String(parentId)) ?? -1;
              if (parentIndex !== -1) {
                focusNodeIndex(parentIndex);
              }
            }
          }
          break;

        case 'Home':
          e.preventDefault();
          focusNodeIndex(0);
          break;

        case 'End':
          e.preventDefault();
          focusNodeIndex(visibleNodes.length - 1);
          break;

        case 'Enter':
          e.preventDefault();
          toggleSelect(node.id, e.ctrlKey || e.metaKey);
          break;

        case ' ':
          e.preventDefault();
          toggleCheck(node.id);
          break;

        case 'F2':
          if (editable && setEditingNodeId) {
            e.preventDefault();
            setEditingNodeId(node.id);
          }
          break;
      }
    },
    [
      visibleNodes,
      nodeIndexMap,
      expandedNodes,
      parentMap,
      editable,
      height,
      itemHeight,
      focusNodeIndex,
      toggleSelect,
      toggleExpand,
      toggleCheck,
      setEditingNodeId,
    ]
  );

  return { handleKeyDown, focusNodeIndex };
};
