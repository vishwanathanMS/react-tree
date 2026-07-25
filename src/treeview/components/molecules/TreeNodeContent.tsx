import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { TreeNode, TreeItemSlotContext } from '../../types/tree.types';
import { useTreeStaticContext, useTreeStateContext } from '../../context/TreeContext';
import { TreeIcon } from '../atoms/TreeIcon';
import { TreeCheckbox } from '../atoms/TreeCheckbox';
import { TreeLabel } from '../atoms/TreeLabel';
import { SlotContext } from '../slots/TreeviewItemSlot';

interface TreeNodeContentProps {
  node: TreeNode;
  isExpanded: boolean;
  depth?: number;
}

export const TreeNodeContent: React.FC<TreeNodeContentProps> = ({ node, isExpanded, depth = 0 }) => {
  const staticCtx = useTreeStaticContext();
  const stateCtx = useTreeStateContext();

  const [inputValue, setInputValue] = useState(node.text || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const isEditing = stateCtx.editingNodeId === node.id;
  const checkState = stateCtx.checkedNodes.get(node.id) || 'unchecked';
  const isSelected = stateCtx.selectedNodes.has(node.id);

  /**
   * When the node enters edit mode, sync the input value to the node's current
   * text. Using useEffect here (not conditional setState during render) is the
   * correct pattern that works safely in React Concurrent Mode.
   */
  useEffect(() => {
    if (isEditing) {
      setInputValue(node.text || '');
    }
  }, [isEditing, node.text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  /**
   * hasChildren: only show an expand chevron when the node genuinely might
   * have children. loadChildren/loadOnDemand only applies when node.hasChildren
   * is truthy or children haven't been loaded yet.
   */
  const hasChildren = useMemo(() => {
    if (node.children && node.children.length > 0) return true;
    if (node.hasChildren) return true;
    // For on-demand loading: only show chevron if the server indicated children exist
    // (not just because loadChildren/loadOnDemand props are present globally)
    if ((staticCtx.loadChildren || staticCtx.loadOnDemand) && node.hasChildren !== false && !node.children) return true;
    return false;
  }, [node.children, node.hasChildren, staticCtx.loadChildren, staticCtx.loadOnDemand]);

  const handleIconClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    staticCtx.toggleExpand(node.id);
  }, [staticCtx, node.id]);

  const commitEdit = useCallback(() => {
    if (isEditing) {
      staticCtx.handleNodeEdit(node.id, inputValue);
      staticCtx.setEditingNodeId(null);
    }
  }, [isEditing, staticCtx, node.id, inputValue]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') {
      setInputValue(node.text || '');
      staticCtx.setEditingNodeId(null);
    }
  }, [commitEdit, node.text, staticCtx]);

  // Stable callback refs extracted from context to prevent slotContextValue from
  // re-creating every render because `ctx` (whole context object) changed.
  const toggleExpand = staticCtx.toggleExpand;
  const toggleSelect = staticCtx.toggleSelect;
  const toggleCheck = staticCtx.toggleCheck;

  const slotContextValue: TreeItemSlotContext = useMemo(
    () => ({
      node,
      isExpanded,
      isSelected,
      checkState,
      loading: !!node.loading,
      hasChildren,
      depth,
      toggleExpand: () => toggleExpand(node.id),
      toggleSelect: (multi) => toggleSelect(node.id, multi),
      toggleCheck: () => toggleCheck(node.id),
      isEditing,
      inputValue,
      setInputValue,
      commitEdit,
    }),
    // Individual stable refs as deps — NOT the whole ctx object
    [node, isExpanded, isSelected, checkState, hasChildren, depth, isEditing, inputValue,
     toggleExpand, toggleSelect, toggleCheck, commitEdit]
  );

  return (
    <SlotContext.Provider value={slotContextValue}>
      {staticCtx.slotRenderer ? (
        staticCtx.slotRenderer(slotContextValue)
      ) : (
        <>
          <TreeIcon expanded={isExpanded} hasChildren={hasChildren} loading={node.loading} onClick={handleIconClick} />
          {staticCtx.checkable && <TreeCheckbox checkState={checkState} onChange={() => staticCtx.toggleCheck(node.id)} />}

          {isEditing ? (
            <input
              ref={inputRef}
              className="tree-input-edit"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <TreeLabel node={node} renderNode={staticCtx.renderNode} />
          )}
        </>
      )}
    </SlotContext.Provider>
  );
};
