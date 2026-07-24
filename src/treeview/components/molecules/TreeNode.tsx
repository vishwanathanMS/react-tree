import React, { useRef, useMemo } from 'react';
import type { TreeNode as ITreeNode } from '../../types/tree.types';
import { useTreeContext } from '../../context/TreeContext';
import { TreeNodeContent } from './TreeNodeContent';

export interface TreeNodeChildItem {
  node: ITreeNode;
  children?: TreeNodeChildItem[];
}

export interface TreeNodeProps {
  node: ITreeNode;
  depth?: number;
  nestedChildren?: TreeNodeChildItem[];
}

export const TreeNode: React.FC<TreeNodeProps> = ({ node, depth = 0, nestedChildren }) => {
  const ctx = useTreeContext();
  const isExpanded = ctx.expandedNodes.has(node.id);
  const isSelected = ctx.selectedNodes.has(node.id);
  const isEditing = ctx.editingNodeId === node.id;

  const nodeRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    if (ctx.checkOnClick && ctx.checkable) {
      ctx.toggleCheck(node.id);
    }
    if (ctx.expandOnClick && !e.ctrlKey && !e.shiftKey) {
      if (node.children?.length || node.hasChildren || ctx.loadChildren || ctx.loadOnDemand) {
        ctx.toggleExpand(node.id);
      }
    }
    if (ctx.selectable) {
      ctx.toggleSelect(node.id, e.ctrlKey || e.metaKey);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (ctx.editable && !isEditing) {
      e.stopPropagation();
      ctx.setEditingNodeId(node.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!ctx.draggable || isEditing) return;
    e.dataTransfer.setData('text/plain', String(node.id));
    ctx.setDragState({ isDragging: true, draggedNodeId: node.id });
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!ctx.draggable || !ctx.dragState.isDragging || ctx.dragState.draggedNodeId === node.id) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    let position: 'before' | 'inside' | 'after' = 'inside';

    if (y < rect.height * 0.25) position = 'before';
    else if (y > rect.height * 0.75) position = 'after';

    ctx.setDragState({ dropTargetId: node.id, dropPosition: position });
  };

  const handleDragLeave = () => {
    if (!ctx.draggable) return;
    if (ctx.dragState.dropTargetId === node.id) {
      ctx.setDragState({ dropTargetId: null, dropPosition: null });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!ctx.draggable || !ctx.dragState.draggedNodeId) return;
    e.preventDefault();
    e.stopPropagation();

    if (ctx.dragState.draggedNodeId !== node.id && ctx.dragState.dropPosition) {
      ctx.handleDrop(ctx.dragState.draggedNodeId, node.id, ctx.dragState.dropPosition);
    }
  };

  const handleDragEnd = () => {
    if (!ctx.draggable) return;
    ctx.setDragState({ isDragging: false, draggedNodeId: null, dropTargetId: null, dropPosition: null });
  };

  // Drop indicator styles
  const isDropTarget = ctx.dragState.dropTargetId === node.id;
  const dropPos = ctx.dragState.dropPosition;

  let dragOverStyle: React.CSSProperties = {};
  if (isDropTarget && dropPos) {
    if (dropPos === 'before') dragOverStyle = { borderTop: '2px solid var(--tree-focus-ring)' };
    if (dropPos === 'after') dragOverStyle = { borderBottom: '2px solid var(--tree-focus-ring)' };
    if (dropPos === 'inside') dragOverStyle = { backgroundColor: 'var(--tree-hover)' };
  }

  const childrenList: TreeNodeChildItem[] | undefined = useMemo(() => {
    if (nestedChildren !== undefined) return nestedChildren;
    if (!node.children || node.children.length === 0) return undefined;
    return node.children.map((c) => ({ node: c }));
  }, [nestedChildren, node.children]);

  const hasChildrenToDisplay = !!childrenList && childrenList.length > 0;
  const hasChildrenForAria = (node.children && node.children.length > 0) || node.hasChildren;

  return (
    <div className="tree-node" data-node-id={node.id}>
      <div
        ref={nodeRef}
        className={`tree-node-row ${isSelected ? 'tree-node-selected' : ''}`}
        role="treeitem"
        aria-expanded={hasChildrenForAria ? isExpanded : undefined}
        aria-selected={isSelected}
        data-node-id={node.id}
        tabIndex={isEditing ? -1 : 0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        draggable={ctx.draggable && !isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        style={dragOverStyle}
        data-testid={`tree-node-${node.id}`}
      >
        <TreeNodeContent node={node} isExpanded={isExpanded} depth={depth} />
      </div>

      {hasChildrenToDisplay && (
        <div className={`tree-node-children-wrapper ${isExpanded ? 'tree-expanded' : ''}`}>
          <div className="tree-node-children-inner">
            <div className="tree-node-children" role="group">
              {childrenList!.map((childItem) => (
                <TreeNode
                  key={childItem.node.id}
                  node={childItem.node}
                  depth={depth + 1}
                  nestedChildren={childItem.children}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

