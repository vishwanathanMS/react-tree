import { useMemo, useState, useCallback, useEffect } from 'react';
import type { TreeNode, FieldMapping, SortOrderType } from '../types/tree.types';
import { mapNodeFields } from '../utils/fieldMapper';
import { buildTree, createMaps, flattenTree, updateNodeInTree, moveNodeInTree, sortTreeNodes } from '../utils/treeBuilder';
import { Query } from '@syncfusion/react-data';

function isDataManager(ds: any): boolean {
  return ds && typeof ds === 'object' && (typeof ds.executeQuery === 'function' || typeof ds.executeLocal === 'function');
}

export const useTreeData = (
  dataSource: unknown[] | any,
  fieldMapping?: FieldMapping,
  expandedNodes?: Set<string | number>,
  sortOrder?: SortOrderType,
  query?: any,
  loadChildrenProp?: (node: TreeNode) => Promise<TreeNode[]>
) => {
  const [data, setData] = useState<TreeNode[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Helper to parse and structure raw item list
  const processRawData = useCallback((rawItems: any[]): TreeNode[] => {
    if (!Array.isArray(rawItems)) return [];
    const mapped = rawItems.map(item => mapNodeFields(item, fieldMapping));
    const isFlat = mapped.length > 0 && mapped.some(n => n.parentId != null && (!n.children || n.children.length === 0));

    let tree = isFlat ? buildTree(mapped) : mapped;
    if (sortOrder) {
      tree = sortTreeNodes(tree, sortOrder);
    }
    return tree;
  }, [fieldMapping, sortOrder]);

  // Load root data from array or DataManager
  useEffect(() => {
    let isSubscribed = true;

    if (isDataManager(dataSource)) {
      setIsLoadingData(true);
      const activeQuery = query || new Query();
      
      const executeRes = dataSource.executeQuery ? dataSource.executeQuery(activeQuery) : dataSource.executeLocal(activeQuery);

      if (executeRes && typeof executeRes.then === 'function') {
        executeRes.then((response: any) => {
          if (!isSubscribed) return;
          const items = Array.isArray(response) ? response : (response?.result || response?.records || []);
          setData(processRawData(items));
          setIsLoadingData(false);
        }).catch((err: any) => {
          console.error('Error fetching DataManager treeview data:', err);
          if (isSubscribed) setIsLoadingData(false);
        });
      } else {
        const items = Array.isArray(executeRes) ? executeRes : (executeRes?.result || executeRes?.records || []);
        setData(processRawData(items));
        setIsLoadingData(false);
      }
    } else if (Array.isArray(dataSource)) {
      setData(processRawData(dataSource));
      setIsLoadingData(false);
    } else {
      setData([]);
      setIsLoadingData(false);
    }

    return () => {
      isSubscribed = false;
    };
  }, [dataSource, query, processRawData]);

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
    const mappedChildren = children.map(item => (item.id !== undefined && item.text !== undefined ? item : mapNodeFields(item, fieldMapping)));
    setData(prev => updateNodeInTree(prev, parentId, { children: mappedChildren, hasChildren: true, loading: false }));
  }, [fieldMapping]);

  // Remote / Dynamic Child Fetching
  const fetchRemoteChildren = useCallback(async (node: TreeNode): Promise<TreeNode[]> => {
    if (loadChildrenProp) {
      return await loadChildrenProp(node);
    }

    if (isDataManager(dataSource)) {
      const parentField = fieldMapping?.parentId || 'parentId';
      const childQuery = new Query().where(parentField, 'equal', node.id);
      
      const executeRes = dataSource.executeQuery ? dataSource.executeQuery(childQuery) : dataSource.executeLocal(childQuery);
      let response = executeRes;
      if (executeRes && typeof executeRes.then === 'function') {
        response = await executeRes;
      }
      
      const items = Array.isArray(response) ? response : (response?.result || response?.records || []);
      return items.map((item: any) => mapNodeFields(item, fieldMapping));
    }

    return [];
  }, [dataSource, fieldMapping, loadChildrenProp]);

  return {
    treeData: data,
    nodeMap,
    parentMap,
    visibleNodes,
    isLoadingData,
    updateNode,
    moveNode,
    setNodeLoading,
    appendChildren,
    fetchRemoteChildren
  };
};
