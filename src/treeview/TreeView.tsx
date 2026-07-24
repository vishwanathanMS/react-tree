import React, { useImperativeHandle, forwardRef, useRef, useState, useCallback, useMemo } from 'react';
import { TreeViewProps, TreeNode } from './types/tree.types';
import { TreeProvider } from './context/TreeContext';
import { useTreeTheme } from './theme/useTreeTheme';
import { useTreeData } from './hooks/useTreeData';
import { useTreeExpansion } from './hooks/useTreeExpansion';
import { useTreeSelection } from './hooks/useTreeSelection';
import { useTreeCheckbox } from './hooks/useTreeCheckbox';
import { useTreeEditing } from './hooks/useTreeEditing';
import { useTreeDragDrop } from './hooks/useTreeDragDrop';
import { useTreeKeyboard } from './hooks/useTreeKeyboard';
import { TreeNode as TreeNodeComponent, TreeNodeChildItem } from './components/molecules/TreeNode';

export interface TreeViewRef {
  expand: (id: string | number) => void;
  collapse: (id: string | number) => void;
  expandAll: () => void;
  collapseAll: () => void;
  select: (id: string | number) => void;
  check: (id: string | number) => void;
  getNode: (id: string | number) => TreeNode | undefined;
}

function createNestedSlice(visibleNodes: { node: TreeNode; depth: number }[]): TreeNodeChildItem[] {
  const result: TreeNodeChildItem[] = [];
  const stack: { item: TreeNodeChildItem; depth: number }[] = [];

  for (const { node, depth } of visibleNodes) {
    const item: TreeNodeChildItem = { node, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      result.push(item);
    } else {
      const parent = stack[stack.length - 1].item;
      if (!parent.children) parent.children = [];
      parent.children.push(item);
    }

    stack.push({ item, depth });
  }

  return result;
}

export const TreeView = forwardRef<TreeViewRef, TreeViewProps>((props, ref) => {
  useTreeTheme();

  const {
    dataSource,
    fieldMapping,
    multiple = false,
    editable = false,
    draggable = false,
    defaultExpanded,
    expanded: controlledExpanded,
    selected: controlledSelected,
    checked: controlledChecked,
    loadChildren,
    onNodeSelect,
    onNodeCheck,
    onNodeExpand,
    onNodeCollapse,
    onNodeDrop,
    onNodeEdit,
    virtual = false,
    itemHeight = 28,
    height = 400,
    sortOrder,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Expansion state
  const expansion = useTreeExpansion(defaultExpanded, controlledExpanded, onNodeExpand, onNodeCollapse, (id) => nodeMap.get(id));
  
  // 2. Data
  const { treeData, nodeMap, parentMap, visibleNodes, updateNode, moveNode, setNodeLoading, appendChildren } = useTreeData(dataSource, fieldMapping, expansion.expanded, sortOrder);

  // 3. Selection
  const selection = useTreeSelection(multiple, controlledSelected, onNodeSelect, (id) => nodeMap.get(id));

  // 4. Checkbox
  const checkbox = useTreeCheckbox(nodeMap, parentMap, controlledChecked, onNodeCheck);

  // 5. Drag & Drop
  const dnd = useTreeDragDrop(draggable, onNodeDrop, (id) => nodeMap.get(id));

  // 6. Editing
  const editing = useTreeEditing(editable, onNodeEdit, (id) => nodeMap.get(id));

  // Uncontrolled support & Async Loading
  const handleToggleExpand = useCallback(async (nodeId: string | number) => {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    
    if (!expansion.expanded.has(nodeId) && (!node.children || node.children.length === 0) && node.hasChildren && loadChildren) {
      setNodeLoading(nodeId, true);
      try {
        const children = await loadChildren(node);
        appendChildren(nodeId, children);
      } catch (e) {
        console.error('Failed to load children', e);
      } finally {
        setNodeLoading(nodeId, false);
        expansion.toggle(nodeId);
      }
    } else {
      expansion.toggle(nodeId);
    }
  }, [expansion, nodeMap, loadChildren, setNodeLoading, appendChildren]);

  const handleNodeEditInternal = useCallback((nodeId: string | number, value: string) => {
    editing.commitEdit(nodeId, value);
    if (!onNodeEdit) {
      updateNode(nodeId, { text: value });
    }
  }, [editing, onNodeEdit, updateNode]);

  const handleDropInternal = useCallback((sourceId: string | number, targetId: string | number, position: 'before' | 'inside' | 'after') => {
    dnd.handleDrop(sourceId, targetId, position);
    if (!onNodeDrop) {
      moveNode(sourceId, targetId, position);
    }
  }, [dnd, onNodeDrop, moveNode]);

  // 7. Keyboard
  useTreeKeyboard(
    containerRef, 
    visibleNodes, 
    selection.toggleSelect, 
    handleToggleExpand, 
    checkbox.toggleCheck
  );

  // Public Methods
  useImperativeHandle(ref, () => ({
    expand: expansion.expand,
    collapse: expansion.collapse,
    expandAll: () => {
      const allIds = Array.from(nodeMap.values()).filter(n => n.children?.length).map(n => n.id);
      allIds.forEach(id => expansion.expand(id));
    },
    collapseAll: () => {
      Array.from(expansion.expanded).forEach(id => expansion.collapse(id));
    },
    select: (id) => selection.toggleSelect(id, false),
    check: checkbox.toggleCheck,
    getNode: (id) => nodeMap.get(id),
  }));

  // Context Value
  const contextValue = {
    ...props,
    treeData,
    expandedNodes: expansion.expanded,
    selectedNodes: selection.selected,
    checkedNodes: checkbox.checkedNodes,
    dragState: dnd.dragState,
    editingNodeId: editing.editingNodeId,
    toggleExpand: handleToggleExpand,
    toggleSelect: selection.toggleSelect,
    toggleCheck: checkbox.toggleCheck,
    setDragState: dnd.setDragState,
    setEditingNodeId: editing.setEditingNodeId,
    handleNodeEdit: handleNodeEditInternal,
    handleDrop: handleDropInternal,
  };

  // Virtualization
  const [scrollTop, setScrollTop] = useState(0);
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { renderedNodes, topPadding, bottomPadding } = useMemo(() => {
    if (!virtual) {
      return { renderedNodes: visibleNodes, topPadding: 0, bottomPadding: 0 };
    }

    const totalHeight = visibleNodes.length * itemHeight;
    const containerHeightValue = typeof height === 'number' ? height : 400;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
    const endIndex = Math.min(visibleNodes.length - 1, Math.floor((scrollTop + containerHeightValue) / itemHeight) + 5);

    const nodes = visibleNodes.slice(startIndex, endIndex + 1);
    const top = startIndex * itemHeight;
    const bottom = Math.max(0, totalHeight - (endIndex + 1) * itemHeight);

    return { renderedNodes: nodes, topPadding: top, bottomPadding: bottom };
  }, [visibleNodes, virtual, itemHeight, height, scrollTop]);

  const nestedVirtualSlice = useMemo(() => {
    if (!virtual) return [];
    return createNestedSlice(renderedNodes);
  }, [virtual, renderedNodes]);

  // Render container styles based on virtual
  const containerStyle: React.CSSProperties = virtual 
    ? { height, overflowY: 'auto', outline: 'none', position: 'relative' }
    : { outline: 'none' };

  return (
    <TreeProvider value={contextValue}>
      <div 
        ref={containerRef} 
        className="tree-container"
        role="tree"
        aria-multiselectable={multiple}
        style={containerStyle}
        onScroll={virtual ? handleScroll : undefined}
      >
        {virtual ? (
          <div style={{ paddingTop: topPadding, paddingBottom: bottomPadding }}>
            {nestedVirtualSlice.map((item) => (
              <TreeNodeComponent
                key={item.node.id}
                node={item.node}
                depth={0}
                nestedChildren={item.children}
              />
            ))}
          </div>
        ) : (
          treeData.map((node) => (
            <TreeNodeComponent key={node.id} node={node} depth={0} />
          ))
        )}
      </div>
    </TreeProvider>
  );
});

TreeView.displayName = 'TreeView';
