import React, { useRef, useMemo, useCallback } from 'react';
import type { TreeNode as ITreeNode } from '../../types/tree.types';
import { useTreeStaticContext, useTreeStateContext } from '../../context/TreeContext';
import { TreeNodeContent } from './TreeNodeContent';

let globalDraggedNodeId: string | number | null = null;

export interface TreeNodeChildItem {
  node: ITreeNode;
  depth?: number;
  children?: TreeNodeChildItem[];
}

export interface TreeNodeProps {
  node: ITreeNode;
  depth?: number;
  nestedChildren?: TreeNodeChildItem[];
  isVirtualRow?: boolean;
}

export const TreeNode: React.FC<TreeNodeProps> = React.memo(({ node, depth = 0, nestedChildren, isVirtualRow = false }) => {
  // Split context reads: static (never changes) vs state (changes on interaction)
  const staticCtx = useTreeStaticContext();
  const stateCtx = useTreeStateContext();

  const isExpanded = stateCtx.expandedNodes.has(node.id);
  const isSelected = stateCtx.selectedNodes.has(node.id);
  const isEditing = stateCtx.editingNodeId === node.id;
  const isDisabled = !!node.disabled;

  const nodeRef = useRef<HTMLDivElement>(null);

  // All handlers wrapped in useCallback so React.memo can bail out correctly.
  // Dependencies are stable callbacks from staticCtx (which itself is memoized).
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    if (staticCtx.checkOnClick && staticCtx.checkable) {
      staticCtx.toggleCheck(node.id);
    }
    if (staticCtx.expandOnClick && !e.ctrlKey && !e.shiftKey) {
      if (node.children?.length || node.hasChildren || staticCtx.loadChildren || staticCtx.loadOnDemand) {
        staticCtx.toggleExpand(node.id);
      }
    }
    if (staticCtx.selectable) {
      staticCtx.toggleSelect(node.id, e.ctrlKey || e.metaKey);
    }
  }, [isEditing, staticCtx, node.id, node.children, node.hasChildren]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (staticCtx.editable && !isEditing) {
      e.stopPropagation();
      staticCtx.setEditingNodeId(node.id);
    }
  }, [staticCtx, isEditing, node.id]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!staticCtx.draggable || isEditing) return;
    globalDraggedNodeId = node.id;
    e.dataTransfer.setData('text/plain', String(node.id));
    e.dataTransfer.effectAllowed = 'move';
    staticCtx.setDragState({ isDragging: true, draggedNodeId: node.id });
    e.stopPropagation();
  }, [staticCtx, isEditing, node.id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!staticCtx.draggable) return;
    const draggedId = stateCtx.dragState.draggedNodeId ?? globalDraggedNodeId;
    if (draggedId == null || String(draggedId) === String(node.id)) return;

    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';

    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    let position: 'before' | 'inside' | 'after' = 'inside';

    if (y < rect.height * 0.25) position = 'before';
    else if (y > rect.height * 0.75) position = 'after';

    staticCtx.setDragState({ dropTargetId: node.id, dropPosition: position });
  }, [staticCtx, stateCtx.dragState.draggedNodeId, node.id]);

  const handleDragLeave = useCallback(() => {
    if (!staticCtx.draggable) return;
    if (stateCtx.dragState.dropTargetId === node.id) {
      staticCtx.setDragState({ dropTargetId: null, dropPosition: null });
    }
  }, [staticCtx, stateCtx.dragState.dropTargetId, node.id]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!staticCtx.draggable) return;
    const draggedId = stateCtx.dragState.draggedNodeId ?? globalDraggedNodeId;
    if (!draggedId) return;

    e.preventDefault();
    e.stopPropagation();

    const position = stateCtx.dragState.dropPosition || 'inside';
    if (String(draggedId) !== String(node.id)) {
      staticCtx.handleDrop(draggedId, node.id, position);
    }
    globalDraggedNodeId = null;
  }, [staticCtx, stateCtx.dragState, node.id]);

  const handleDragEnd = useCallback(() => {
    globalDraggedNodeId = null;
    if (!staticCtx.draggable) return;
    staticCtx.setDragState({ isDragging: false, draggedNodeId: null, dropTargetId: null, dropPosition: null });
  }, [staticCtx]);

  // Drop indicator styles
  const isDropTarget = stateCtx.dragState.dropTargetId === node.id;
  const dropPos = stateCtx.dragState.dropPosition;

  const rowStyle: React.CSSProperties = useMemo(() => {
    const base: React.CSSProperties = { paddingLeft: `${depth * 20 + 8}px` };
    if (isDropTarget && dropPos) {
      if (dropPos === 'before') base.borderTop = '2px solid var(--tree-focus-ring)';
      if (dropPos === 'after') base.borderBottom = '2px solid var(--tree-focus-ring)';
      if (dropPos === 'inside') base.backgroundColor = 'var(--tree-hover)';
    }
    return base;
  }, [depth, isDropTarget, dropPos]);

  const childrenList: TreeNodeChildItem[] | undefined = useMemo(() => {
    if (nestedChildren !== undefined) return nestedChildren;
    if (!node.children || node.children.length === 0) return undefined;
    return node.children.map((c) => ({ node: c, depth: depth + 1 }));
  }, [nestedChildren, node.children, depth]);

  const hasChildrenToDisplay = !isVirtualRow && !!childrenList && childrenList.length > 0;
  const hasChildrenForAria = (node.children && node.children.length > 0) || node.hasChildren;

  return (
    <div className="tree-node" data-node-id={node.id}>
      <div
        ref={nodeRef}
        className={`tree-node-row ${isSelected ? 'tree-node-selected' : ''}`}
        role="treeitem"
        aria-expanded={hasChildrenForAria ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-level={depth + 1}
        aria-label={node.text || String(node.id)}
        aria-disabled={isDisabled || undefined}
        data-node-id={node.id}
        tabIndex={isEditing ? -1 : 0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        draggable={staticCtx.draggable && !isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        style={rowStyle}
        data-testid={`tree-node-${node.id}`}
      >
        <TreeNodeContent node={node} isExpanded={isExpanded} depth={depth} />
      </div>

      {hasChildrenToDisplay && (
        <div className={`tree-node-children ${isExpanded ? 'tree-expanded' : ''}`} role="group">
          {childrenList!.map((childItem) => (
            <TreeNode
              key={childItem.node.id}
              node={childItem.node}
              depth={childItem.depth ?? depth + 1}
              nestedChildren={childItem.children}
            />
          ))}
        </div>
      )}
    </div>
  );
});

TreeNode.displayName = 'TreeNode';
