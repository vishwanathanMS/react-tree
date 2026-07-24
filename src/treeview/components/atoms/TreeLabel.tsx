import React from 'react';
import type { TreeNode } from '../../types/tree.types';

interface TreeLabelProps {
  node: TreeNode;
  renderNode?: (node: TreeNode) => React.ReactNode;
}

export const TreeLabel: React.FC<TreeLabelProps> = ({ node, renderNode }) => {
  if (renderNode) {
    return <>{renderNode(node)}</>;
  }

  return (
    <span className="tree-label" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {node.text ?? String(node.id)}
    </span>
  );
};
