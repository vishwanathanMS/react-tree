/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react';
import type { TreeNode, TreeViewProps, TreeItemSlotContext, CheckState } from '../types/tree.types';

// ---------------------------------------------------------------------------
// Static context — callbacks + config that never change after mount.
// Consuming components that only read config will NOT re-render on state changes.
// ---------------------------------------------------------------------------
export interface TreeStaticContextType {
  // Feature flags (from props)
  selectable: boolean;
  multiple: boolean;
  checkable: boolean;
  checkOnClick: boolean;
  loadOnDemand: boolean;
  editable: boolean;
  draggable: boolean;
  expandOnClick: boolean;
  virtual: boolean;
  itemHeight: number;
  height: number | string;
  renderNode?: (node: TreeNode) => React.ReactNode;
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;

  // Slot renderer (from children)
  slotRenderer?: (ctx: TreeItemSlotContext) => React.ReactNode;

  // Stable action callbacks (wrapped in useCallback in TreeView)
  toggleExpand: (nodeId: string | number) => void;
  toggleSelect: (nodeId: string | number, multi?: boolean) => void;
  toggleCheck: (nodeId: string | number) => void;
  setDragState: (state: Partial<TreeStateContextType['dragState']>) => void;
  setEditingNodeId: (nodeId: string | number | null) => void;
  handleNodeEdit: (nodeId: string | number, value: string) => void;
  handleDrop: (sourceId: string | number, targetId: string | number, position: 'before' | 'inside' | 'after') => void;
}

// ---------------------------------------------------------------------------
// State context — frequently changing reactive state.
// Each re-render here is scoped: only nodes that read from this context
// will re-render when any of these values change.
// ---------------------------------------------------------------------------
export interface TreeStateContextType {
  treeData: TreeNode[];
  expandedNodes: Set<string | number>;
  selectedNodes: Set<string | number>;
  checkedNodes: Map<string | number, CheckState>;
  dragState: {
    isDragging: boolean;
    draggedNodeId: string | number | null;
    dropTargetId: string | number | null;
    dropPosition: 'before' | 'inside' | 'after' | null;
  };
  editingNodeId: string | number | null;
}

// ---------------------------------------------------------------------------
// Legacy combined type — kept so external callers of useTreeContext() still work.
// We intentionally do NOT re-extend TreeViewProps here because TreeStaticContextType
// already re-declares those fields as non-optional booleans, causing TS2320
// (identical named properties with differing optionality cannot be merged).
// ---------------------------------------------------------------------------
export type TreeContextType = TreeStaticContextType & TreeStateContextType;

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------
const TreeStaticContext = createContext<TreeStaticContextType | null>(null);
const TreeStateContext = createContext<TreeStateContextType | null>(null);

export const useTreeStaticContext = (): TreeStaticContextType => {
  const ctx = useContext(TreeStaticContext);
  if (!ctx) throw new Error('useTreeStaticContext must be used within a TreeProvider');
  return ctx;
};

export const useTreeStateContext = (): TreeStateContextType => {
  const ctx = useContext(TreeStateContext);
  if (!ctx) throw new Error('useTreeStateContext must be used within a TreeProvider');
  return ctx;
};

/**
 * Convenience hook that merges both contexts — maintains backward compatibility
 * for any code that calls useTreeContext(). Note: this means the component will
 * re-render on any state change. Prefer the split hooks for new code.
 */
export const useTreeContext = (): TreeContextType => {
  const staticCtx = useTreeStaticContext();
  const stateCtx = useTreeStateContext();
  return { ...staticCtx, ...stateCtx } as TreeContextType;
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const TreeProvider: React.FC<{
  staticValue: TreeStaticContextType;
  stateValue: TreeStateContextType;
  children: React.ReactNode;
}> = ({ staticValue, stateValue, children }) => {
  return (
    <TreeStaticContext.Provider value={staticValue}>
      <TreeStateContext.Provider value={stateValue}>
        {children}
      </TreeStateContext.Provider>
    </TreeStaticContext.Provider>
  );
};
