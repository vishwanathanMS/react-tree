import { useEffect, useCallback } from 'react';
import type { TreeNode } from '../types/tree.types';

export const useTreeKeyboard = (
  containerRef: React.RefObject<HTMLElement | null>,
  visibleNodes: { node: TreeNode; depth: number }[],
  toggleSelect: (id: string | number) => void,
  toggleExpand: (id: string | number) => void,
  toggleCheck: (id: string | number) => void
) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      if (!activeElement || !activeElement.classList.contains('tree-node')) return;

      const nodeIdStr = activeElement.getAttribute('data-node-id');
      if (!nodeIdStr) return;

      const currentIndex = visibleNodes.findIndex(item => String(item.node.id) === nodeIdStr);
      if (currentIndex === -1) return;

      const { node } = visibleNodes[currentIndex];

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < visibleNodes.length - 1) {
            const nextNode = visibleNodes[currentIndex + 1].node;
            const nextEl = containerRef.current?.querySelector(`[data-node-id="${nextNode.id}"]`) as HTMLElement;
            nextEl?.focus();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            const prevNode = visibleNodes[currentIndex - 1].node;
            const prevEl = containerRef.current?.querySelector(`[data-node-id="${prevNode.id}"]`) as HTMLElement;
            prevEl?.focus();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (node.children?.length && !node.expanded) {
            toggleExpand(node.id);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (node.children?.length && node.expanded) {
            toggleExpand(node.id);
          } else if (node.parentId != null) {
            const parentEl = containerRef.current?.querySelector(`[data-node-id="${node.parentId}"]`) as HTMLElement;
            parentEl?.focus();
          }
          break;
        case 'Enter':
          e.preventDefault();
          toggleSelect(node.id);
          break;
        case ' ':
          e.preventDefault();
          toggleCheck(node.id);
          break;
      }
    },
    [visibleNodes, containerRef, toggleSelect, toggleExpand, toggleCheck]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('keydown', handleKeyDown);
      return () => el.removeEventListener('keydown', handleKeyDown);
    }
  }, [containerRef, handleKeyDown]);
};
