import type { TreeNode, CheckState } from '../types/tree.types';

export const updateNodeCheckState = (
  checkedNodes: Map<string | number, CheckState>,
  nodeMap: Map<string | number, TreeNode>,
  parentMap: Map<string | number, string | number>,
  nodeId: string | number,
  state: CheckState
) => {
  const nextChecked = new Map(checkedNodes);
  
  // 1. Update downwards (children)
  const updateChildren = (id: string | number, st: CheckState) => {
    nextChecked.set(id, st);
    const node = nodeMap.get(id);
    if (node?.children) {
      node.children.forEach(child => updateChildren(child.id, st));
    }
  };

  updateChildren(nodeId, state);

  // 2. Update upwards (parents)
  const updateParents = (id: string | number) => {
    const parentId = parentMap.get(id);
    if (parentId == null) return;

    const parentNode = nodeMap.get(parentId);
    if (!parentNode || !parentNode.children) return;

    let checkedCount = 0;
    let indeterminateCount = 0;

    parentNode.children.forEach(child => {
      const childState = nextChecked.get(child.id);
      if (childState === 'checked') checkedCount++;
      else if (childState === 'indeterminate') indeterminateCount++;
    });

    let newParentState: CheckState = 'unchecked';
    if (checkedCount === parentNode.children.length) {
      newParentState = 'checked';
    } else if (checkedCount > 0 || indeterminateCount > 0) {
      newParentState = 'indeterminate';
    }

    if (nextChecked.get(parentId) !== newParentState) {
      nextChecked.set(parentId, newParentState);
      updateParents(parentId); // recursively update up
    }
  };

  updateParents(nodeId);

  return nextChecked;
};
