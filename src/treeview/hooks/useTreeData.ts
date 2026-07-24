import { useMemo, useState, useCallback } from 'react';
import type { TreeNode, FieldMapping } from '../types/tree.types';
import { mapNodeFields } from '../utils/fieldMapper';
import { buildTree, createMaps, flattenTree, updateNodeInTree, moveNodeInTree, sortTreeNodes } from '../utils/treeBuilder';

export const useTreeData = (
  dataSource: unknown[],
  fieldMapping?: FieldMapping,
  expandedNodes?: Set<string | number>,
  sortOrder?: (a: TreeNode, b: TreeNode) => number
) => {
  const initialTreeData = useMemo(() => {
    const mapped = dataSource.map(item => mapNodeFields(item, fieldMapping));
    const isFlat = mapped.length > 0 && mapped.some(n => n.parentId != null && (!n.children || n.children.length === 0));

    let treeData = isFlat ? buildTree(mapped) : mapped;
    if (sortOrder) {
      treeData = sortTreeNodes(treeData, sortOrder);
    }
    return treeData;
  }, [dataSource, fieldMapping, sortOrder]);

  const [data, setData] = useState<TreeNode[]>(initialTreeData);
  const [prevSource, setPrevSource] = useState({ dataSource, fieldMapping, sortOrder });

  if (prevSource.dataSource !== dataSource || prevSource.fieldMapping !== fieldMapping || prevSource.sortOrder !== sortOrder) {
    setPrevSource({ dataSource, fieldMapping, sortOrder });
    setData(initialTreeData);
  }

  const { nodeMap, parentMap } = useMemo(() => {
    return createMaps(data);
  }, [data]);

  const visibleNodes = useMemo(() => {
    return flattenTree(data, expandedNodes || new Set(), 0);
  }, [data, expandedNodes]);

  const updateNode = useCallback((id: string | number, updates: Partial<TreeNode>) => {
    setData(prev => {
      let newData = updateNodeInTree(prev, id, updates);
      if (sortOrder) newData = sortTreeNodes(newData, sortOrder);
      return newData;
    });
  }, [sortOrder]);

  const moveNode = useCallback((sourceId: string | number, targetId: string | number, position: 'before' | 'inside' | 'after') => {
    setData(prev => moveNodeInTree(prev, sourceId, targetId, position));
  }, []);

  const setNodeLoading = useCallback((id: string | number, loading: boolean) => {
    setData(prev => updateNodeInTree(prev, id, { loading }));
  }, []);

  const appendChildren = useCallback((parentId: string | number, children: TreeNode[]) => {
    setData(prev => updateNodeInTree(prev, parentId, { children: children, hasChildren: true, loading: false }));
  }, []);

  return { treeData: data, nodeMap, parentMap, visibleNodes, updateNode, moveNode, setNodeLoading, appendChildren };
};
