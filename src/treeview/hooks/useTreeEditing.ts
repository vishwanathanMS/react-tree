import { useState, useCallback } from 'react';
import type { TreeNode } from '../types/tree.types';

export const useTreeEditing = (
  editable?: boolean,
  onNodeEdit?: (node: TreeNode, value: string) => void,
  getNode?: (id: string | number) => TreeNode | undefined
) => {
  const [editingNodeId, setEditingNodeId] = useState<string | number | null>(null);

  const startEdit = useCallback((nodeId: string | number) => {
    if (editable) setEditingNodeId(nodeId);
  }, [editable]);

  const commitEdit = useCallback(
    (nodeId: string | number, value: string) => {
      const node = getNode?.(nodeId);
      if (node && onNodeEdit) {
        onNodeEdit(node, value);
      }
      setEditingNodeId(null);
    },
    [getNode, onNodeEdit]
  );

  const cancelEdit = useCallback(() => {
    setEditingNodeId(null);
  }, []);

  return { editingNodeId, startEdit, commitEdit, cancelEdit, setEditingNodeId };
};
