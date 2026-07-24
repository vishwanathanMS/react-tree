import { useState, useCallback, useMemo } from 'react';
import type { TreeNode } from '../types/tree.types';

export interface UseVirtualizationOptions {
  enabled: boolean;
  visibleNodes: { node: TreeNode; depth: number }[];
  itemHeight: number;
  height: number | string;
}

export function useVirtualization(options: UseVirtualizationOptions) {
  const { enabled, visibleNodes, itemHeight, height } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { renderedNodes, topPadding, bottomPadding } = useMemo(() => {
    if (!enabled) {
      return { renderedNodes: visibleNodes, topPadding: 0, bottomPadding: 0 };
    }

    const totalHeight = visibleNodes.length * itemHeight;
    const containerHeightValue = typeof height === 'number' ? height : parseInt(String(height), 10) || 400;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
    const endIndex = Math.min(visibleNodes.length - 1, Math.floor((scrollTop + containerHeightValue) / itemHeight) + 5);

    const nodes = visibleNodes.slice(startIndex, endIndex + 1);
    const top = startIndex * itemHeight;
    const bottom = Math.max(0, totalHeight - (endIndex + 1) * itemHeight);

    return { renderedNodes: nodes, topPadding: top, bottomPadding: bottom };
  }, [visibleNodes, enabled, itemHeight, height, scrollTop]);

  return {
    scrollTop,
    handleScroll,
    renderedNodes,
    topPadding,
    bottomPadding,
  };
}
