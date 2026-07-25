import React, { useImperativeHandle, forwardRef, useRef, useCallback, useMemo, useState } from 'react';
import { TreeViewProps, TreeNode, TreeItemSlotContext } from './types/tree.types';
import { TreeProvider, TreeStaticContextType, TreeStateContextType } from './context/TreeContext';
import { useTreeTheme } from './theme/useTreeTheme';
import { useTreeData } from './hooks/useTreeData';
import { useTreeExpansion } from './hooks/useTreeExpansion';
import { useTreeSelection } from './hooks/useTreeSelection';
import { useTreeCheckbox } from './hooks/useTreeCheckbox';
import { useTreeEditing } from './hooks/useTreeEditing';
import { useTreeDragDrop } from './hooks/useTreeDragDrop';
import { useTreeKeyboard } from './hooks/useTreeKeyboard';
import { TreeNode as TreeNodeComponent } from './components/molecules/TreeNode';
import { TreeviewItemContent, TreeViewItemContent } from './components/slots/TreeviewItemSlot';
import { createNestedSlice } from './utils/treeBuilder';

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
    renderNode,
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

  // Unified Toggle Handlers — all wrapped in useCallback for stable references
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
    updateNode(nodeId, { text: value });
  }, [editing, updateNode]);

  const handleDropInternal = useCallback((sourceId: string | number, targetId: string | number, position: 'before' | 'inside' | 'after') => {
    dnd.handleDrop(sourceId, targetId, position);
    moveNode(sourceId, targetId, position);
  }, [dnd, moveNode]);

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
      // Single setState call via expandBulk instead of N separate calls
      const allIds = Array.from(nodeMap.values())
        .filter(n => n.children?.length || n.hasChildren)
        .map(n => n.id);
      expansion.expandBulk(allIds);
    },
    collapseAll: expansion.collapseAll,
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

  // ---------------------------------------------------------------------------
  // Static context value — only changes when stable callbacks / config change.
  // Because we avoid spreading `props` and only list specific fields,
  // this memo actually bails out on re-renders where config hasn't changed.
  // ---------------------------------------------------------------------------
  const staticContextValue = useMemo<TreeStaticContextType>(
    () => ({
      selectable,
      multiple,
      checkable,
      checkOnClick,
      loadOnDemand,
      editable,
      draggable,
      expandOnClick,
      virtual,
      itemHeight,
      height,
      renderNode,
      loadChildren,
      slotRenderer,
      toggleExpand: handleToggleExpand,
      toggleSelect: handleToggleSelect,
      toggleCheck: handleToggleCheck,
      setDragState: dnd.setDragState,
      setEditingNodeId: editing.setEditingNodeId,
      handleNodeEdit: handleNodeEditInternal,
      handleDrop: handleDropInternal,
    }),
    [
      selectable,
      multiple,
      checkable,
      checkOnClick,
      loadOnDemand,
      editable,
      draggable,
      expandOnClick,
      virtual,
      itemHeight,
      height,
      renderNode,
      loadChildren,
      slotRenderer,
      handleToggleExpand,
      handleToggleSelect,
      handleToggleCheck,
      dnd.setDragState,
      editing.setEditingNodeId,
      handleNodeEditInternal,
      handleDropInternal,
    ]
  );

  // ---------------------------------------------------------------------------
  // State context value — changes on every state update (expansion, selection…)
  // Only tree nodes that subscribe via useTreeStateContext() re-render.
  // ---------------------------------------------------------------------------
  const stateContextValue = useMemo<TreeStateContextType>(
    () => ({
      treeData,
      expandedNodes: expansion.expanded,
      selectedNodes: combinedSelected,
      checkedNodes: checkbox.checkedNodes,
      dragState: dnd.dragState,
      editingNodeId: editing.editingNodeId,
    }),
    [
      treeData,
      expansion.expanded,
      combinedSelected,
      checkbox.checkedNodes,
      dnd.dragState,
      editing.editingNodeId,
    ]
  );

  // ---------------------------------------------------------------------------
  // Virtualization — throttle scroll events with requestAnimationFrame
  // ---------------------------------------------------------------------------
  const scrollTopRef = useRef(0);
  const rafPending = useRef(false);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    scrollTopRef.current = e.currentTarget.scrollTop;
    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(() => {
        setScrollTop(scrollTopRef.current);
        rafPending.current = false;
      });
    }
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

  const containerStyle: React.CSSProperties = virtual
    ? { height, overflowY: 'auto', outline: 'none', position: 'relative' }
    : { outline: 'none' };

  return (
    <TreeProvider staticValue={staticContextValue} stateValue={stateContextValue}>
      <div
        ref={containerRef}
        className="tree-container"
        role="tree"
        tabIndex={0}
        aria-multiselectable={isMultiSelection}
        style={containerStyle}
        onScroll={virtual ? handleScroll : undefined}
        onKeyDown={handleKeyDown}
      >
        {virtual ? (
          <div style={{ paddingTop: topPadding, paddingBottom: bottomPadding }}>
            {nestedVirtualSlice.map((item) => (
              <TreeNodeComponent
                key={item.node.id}
                node={item.node}
                depth={item.depth ?? 0}
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
