import React, { useState, useRef, useEffect } from 'react';
import type { TreeNode } from '../../types/tree.types';
import { useTreeContext } from '../../context/TreeContext';
import { TreeIcon } from '../atoms/TreeIcon';
import { TreeCheckbox } from '../atoms/TreeCheckbox';
import { TreeLabel } from '../atoms/TreeLabel';

interface TreeNodeContentProps {
  node: TreeNode;
  isExpanded: boolean;
}

export const TreeNodeContent: React.FC<TreeNodeContentProps> = ({ node, isExpanded }) => {
  const ctx = useTreeContext();
  const [inputValue, setInputValue] = useState(node.text || '');
  const [prevEditing, setPrevEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasChildren = !!node.children?.length || !!node.hasChildren || !!ctx.loadChildren;
  const isEditing = ctx.editingNodeId === node.id;
  const checkState = ctx.checkedNodes.get(node.id) || 'unchecked';

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

  return (
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
  );
};
