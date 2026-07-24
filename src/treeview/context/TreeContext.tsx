/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react';
import type { TreeNode, TreeViewProps } from '../types/tree.types';

interface TreeContextType extends TreeViewProps {
  treeData: TreeNode[];
  expandedNodes: Set<string | number>;
  selectedNodes: Set<string | number>;
  checkedNodes: Map<string | number, 'checked' | 'unchecked' | 'indeterminate'>;
  dragState: {
    isDragging: boolean;
    draggedNodeId: string | number | null;
    dropTargetId: string | number | null;
    dropPosition: 'before' | 'inside' | 'after' | null;
  };
  editingNodeId: string | number | null;
  toggleExpand: (nodeId: string | number) => void;
  toggleSelect: (nodeId: string | number, multi?: boolean) => void;
  toggleCheck: (nodeId: string | number) => void;
  setDragState: (state: Partial<TreeContextType['dragState']>) => void;
  setEditingNodeId: (nodeId: string | number | null) => void;
  handleNodeEdit: (nodeId: string | number, value: string) => void;
  handleDrop: (sourceId: string | number, targetId: string | number, position: 'before' | 'inside' | 'after') => void;
}

const TreeContext = createContext<TreeContextType | null>(null);

export const useTreeContext = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTreeContext must be used within a TreeProvider');
  }
  return context;
};

export const TreeProvider: React.FC<{
  value: TreeContextType;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
};
