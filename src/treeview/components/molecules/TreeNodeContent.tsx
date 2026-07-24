import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { TreeNode, TreeItemSlotContext } from '../../types/tree.types';
import { useTreeContext } from '../../context/TreeContext';
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
  const ctx = useTreeContext();
  const [inputValue, setInputValue] = useState(node.text || '');
  const [prevEditing, setPrevEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasChildren = !!node.children?.length || !!node.hasChildren || !!ctx.loadChildren || !!ctx.loadOnDemand;
  const isEditing = ctx.editingNodeId === node.id;
  const checkState = ctx.checkedNodes.get(node.id) || 'unchecked';
  const isSelected = ctx.selectedNodes.has(node.id);

  if (isEditing !== prevEditing) {
    setPrevEditing(isEditing);
    if (isEditing) {
      setInputValue(node.text || '');
    }
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.toggleExpand(node.id);
  };

  const commitEdit = () => {
    if (isEditing) {
      ctx.handleNodeEdit(node.id, inputValue);
      ctx.setEditingNodeId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') {
      setInputValue(node.text || '');
      ctx.setEditingNodeId(null);
    }
  };

  const slotContextValue: TreeItemSlotContext = useMemo(
    () => ({
      node,
      isExpanded,
      isSelected,
      checkState,
      loading: !!node.loading,
      hasChildren,
      depth,
      toggleExpand: () => ctx.toggleExpand(node.id),
      toggleSelect: (multi) => ctx.toggleSelect(node.id, multi),
      toggleCheck: () => ctx.toggleCheck(node.id),
      isEditing,
      inputValue,
      setInputValue,
      commitEdit,
    }),
    [node, isExpanded, isSelected, checkState, hasChildren, depth, isEditing, inputValue, ctx]
  );

  return (
    <SlotContext.Provider value={slotContextValue}>
      {ctx.slotRenderer ? (
        ctx.slotRenderer(slotContextValue)
      ) : (
        <>
          <TreeIcon expanded={isExpanded} hasChildren={hasChildren} loading={node.loading} onClick={handleIconClick} />
          {ctx.checkable && <TreeCheckbox checkState={checkState} onChange={() => ctx.toggleCheck(node.id)} />}

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
            <TreeLabel node={node} renderNode={ctx.renderNode} />
          )}
        </>
      )}
    </SlotContext.Provider>
  );
};

