import React, { useImperativeHandle, forwardRef, useRef, useCallback, useMemo } from 'react';
import { TreeViewProps, TreeNode, TreeItemSlotContext } from './types/tree.types';
import { TreeProvider, TreeContextType } from './context/TreeContext';
import { useTreeTheme } from './theme/useTreeTheme';
import { useTreeData } from './hooks/useTreeData';
import { useTreeExpansion } from './hooks/useTreeExpansion';
import { useTreeSelection } from './hooks/useTreeSelection';
import { useTreeCheckbox } from './hooks/useTreeCheckbox';
import { useTreeEditing } from './hooks/useTreeEditing';
import { useTreeDragDrop } from './hooks/useTreeDragDrop';
import { useTreeKeyboard } from './hooks/useTreeKeyboard';
import { useVirtualization } from './hooks/useVirtualization';
import { TreeNode as TreeNodeComponent } from './components/molecules/TreeNode';
import { VirtualTreeList } from './components/organisms/VirtualTreeList';
import { TreeviewItemContent, TreeViewItemContent } from './components/slots/TreeviewItemSlot';
export interface TreeViewRef {
  expand: (id: string | number) => void;
  collapse: (id: string | number) => void;
  expandAll: () => void;
  collapseAll: () => void;
  select: (id: string | number) => void;
  check: (id: string | number) => void;
  getNode: (id: string | number) => TreeNode | undefined;
}

export const TreeView = forwardRef<TreeViewRef, TreeViewProps>((props, ref) => {
  useTreeTheme();

  const {
    dataSource,
    query,
    fieldMapping,
    selectable = false,
    multiple = false,
    checkable = false,
    checkOnClick = false,
    loadOnDemand = false,
    editable = false,
    draggable = false,
    expandOnClick = false,
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
    children,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  // Parse children for compound slot renderer (<TreeviewItemContent>)
  const slotRenderer = useMemo(() => {
    if (!children) return undefined;
    let foundSlotFn: ((ctx: TreeItemSlotContext) => React.ReactNode) | undefined;

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const type = child.type as any;
        if (
          type === TreeviewItemContent ||
          type === TreeViewItemContent ||
          type?.displayName === 'TreeviewItemContent' ||
          type?.name === 'TreeviewItemContent' ||
          type?.name === 'TreeViewItemContent'
        ) {
          const slotProps = child.props as any;
          if (typeof slotProps.children === 'function') {
            foundSlotFn = slotProps.children;
          } else if (slotProps.children) {
            foundSlotFn = () => slotProps.children;
          }
        }
      }
    });

    return foundSlotFn;
  }, [children]);

  // 1. Expansion state
  const expansion = useTreeExpansion(defaultExpanded, controlledExpanded, onNodeExpand, onNodeCollapse, (id) => nodeMap.get(id));
  
  // 2. Data
  const {
    treeData,
    nodeMap,
    parentMap,
    visibleNodes,
    isLoadingData,
    updateNode,
    moveNode,
    setNodeLoading,
    appendChildren,
    fetchRemoteChildren,
  } = useTreeData(dataSource, fieldMapping, expansion.expanded, sortOrder, query, loadChildren);

  // 3. Selection & Checkbox Unified State
  const isMultiSelection = multiple || checkable;
  const selection = useTreeSelection(isMultiSelection, controlledSelected, onNodeSelect, (id) => nodeMap.get(id));
  const checkbox = useTreeCheckbox(nodeMap, parentMap, controlledChecked, onNodeCheck);

  // Unified Toggle Handlers
  const handleToggleCheck = useCallback(
    (nodeId: string | number) => {
      checkbox.toggleCheck(nodeId);
      if (checkable || selectable) {
        selection.toggleSelect(nodeId, true);
      }
    },
    [checkbox, selection, checkable, selectable]
  );

  const handleToggleSelect = useCallback(
    (nodeId: string | number, multiSelect?: boolean) => {
      selection.toggleSelect(nodeId, multiSelect);
      if (checkable) {
        checkbox.toggleCheck(nodeId);
      }
    },
    [selection, checkbox, checkable]
  );

  // 4. Drag & Drop
  const dnd = useTreeDragDrop(draggable, onNodeDrop, (id) => nodeMap.get(id));

  // 5. Editing
  const editing = useTreeEditing(editable, onNodeEdit, (id) => nodeMap.get(id));

  // Dynamic Child Loading & Expansion
  const handleToggleExpand = useCallback(async (nodeId: string | number) => {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    const needsLoad = (!node.children || node.children.length === 0) && (node.hasChildren || loadChildren || loadOnDemand);
    
    if (!expansion.expanded.has(nodeId) && needsLoad) {
      setNodeLoading(nodeId, true);
      try {
        const childrenList = await fetchRemoteChildren(node);
        appendChildren(nodeId, childrenList);
      } catch (e) {
        console.error('Failed to load tree node children', e);
      } finally {
        setNodeLoading(nodeId, false);
        expansion.toggle(nodeId);
      }
    } else {
      expansion.toggle(nodeId);
    }
  }, [expansion, nodeMap, loadChildren, loadOnDemand, setNodeLoading, fetchRemoteChildren, appendChildren]);

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

  // Keyboard navigation
  const { handleKeyDown } = useTreeKeyboard({
    containerRef,
    visibleNodes,
    expandedNodes: expansion.expanded,
    parentMap,
    virtual,
    itemHeight,
    height,
    toggleSelect: handleToggleSelect,
    toggleExpand: handleToggleExpand,
    toggleCheck: handleToggleCheck,
    setEditingNodeId: editing.setEditingNodeId,
    editable,
  });

  // Imperative Methods
  useImperativeHandle(ref, () => ({
    expand: expansion.expand,
    collapse: expansion.collapse,
    expandAll: () => {
      const allIds = Array.from(nodeMap.values()).filter(n => n.children?.length || n.hasChildren).map(n => n.id);
      allIds.forEach(id => expansion.expand(id));
    },
    collapseAll: () => {
      Array.from(expansion.expanded).forEach(id => expansion.collapse(id));
    },
    select: (id: string | number) => handleToggleSelect(id, false),
    check: handleToggleCheck,
    getNode: (id: string | number) => nodeMap.get(id),
  }));

  // Combine checked and selected nodes for unified state view
  const combinedSelected = useMemo(() => {
    if (!checkable) return selection.selected;
    const set = new Set(selection.selected);
    checkbox.checkedNodes.forEach((state, id) => {
      if (state === 'checked') set.add(id);
    });
    return set;
  }, [checkable, selection.selected, checkbox.checkedNodes]);

  // Context Value
  const contextValue: TreeContextType = {
    ...props,
    treeData,
    expandedNodes: expansion.expanded,
    selectedNodes: combinedSelected,
    checkedNodes: checkbox.checkedNodes,
    dragState: dnd.dragState,
    editingNodeId: editing.editingNodeId,
    slotRenderer,
    toggleExpand: handleToggleExpand,
    toggleSelect: handleToggleSelect,
    toggleCheck: handleToggleCheck,
    setDragState: dnd.setDragState,
    setEditingNodeId: editing.setEditingNodeId,
    handleNodeEdit: handleNodeEditInternal,
    handleDrop: handleDropInternal,
  };

  // Virtualization
  const virtualization = useVirtualization({
    enabled: virtual,
    visibleNodes,
    itemHeight,
    height,
  });

  const containerStyle: React.CSSProperties = virtual 
    ? { height, overflowY: 'auto', outline: 'none', position: 'relative' }
    : { outline: 'none' };

  return (
    <TreeProvider value={contextValue}>
      <div 
        ref={containerRef} 
        className="tree-container"
        role="tree"
        tabIndex={0}
        aria-multiselectable={isMultiSelection}
        style={containerStyle}
        onScroll={virtual ? virtualization.handleScroll : undefined}
        onKeyDown={handleKeyDown}
      >
        {isLoadingData ? (
          <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tree-text)' }}>
            <span
              style={{
                display: 'inline-block',
                width: 16,
                height: 16,
                border: '2px solid rgba(0,0,0,0.2)',
                borderTopColor: 'currentColor',
                borderRadius: '50%',
                animation: 'tree-spin 0.8s linear infinite',
              }}
            />
            Loading data...
          </div>
        ) : virtual ? (
          <VirtualTreeList
            renderedNodes={virtualization.renderedNodes}
            topPadding={virtualization.topPadding}
            bottomPadding={virtualization.bottomPadding}
          />
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
