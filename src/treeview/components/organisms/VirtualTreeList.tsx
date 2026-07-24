import React, { useMemo } from 'react';
import type { TreeNode } from '../../types/tree.types';
import { TreeNode as TreeNodeComponent, TreeNodeChildItem } from '../molecules/TreeNode';

export interface VirtualTreeListProps {
  renderedNodes: { node: TreeNode; depth: number }[];
  topPadding: number;
  bottomPadding: number;
}

export function createNestedSlice(visibleNodes: { node: TreeNode; depth: number }[]): TreeNodeChildItem[] {
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

export const VirtualTreeList: React.FC<VirtualTreeListProps> = ({
  renderedNodes,
  topPadding,
  bottomPadding,
}) => {
  const nestedVirtualSlice = useMemo(() => {
    return createNestedSlice(renderedNodes);
  }, [renderedNodes]);

  return (
    <div className="tree-virtual-padding" style={{ paddingTop: topPadding, paddingBottom: bottomPadding }}>
      {nestedVirtualSlice.map((item) => (
        <div key={item.node.id} className="tree-virtual-row">
          <TreeNodeComponent
            node={item.node}
            depth={0}
            nestedChildren={item.children}
          />
        </div>
      ))}
    </div>
  );
};
