import type { TreeNode, SortOrderType } from '../types/tree.types';


export const buildTree = (nodes: TreeNode[]): TreeNode[] => {
  const nodeMap = new Map<string | number, TreeNode>();
  const roots: TreeNode[] = [];

  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  nodes.forEach(node => {
    const parentId = node.parentId;
    if (parentId != null && nodeMap.has(parentId)) {
      const parent = nodeMap.get(parentId)!;
      parent.children!.push(nodeMap.get(node.id)!);
    } else {
      roots.push(nodeMap.get(node.id)!);
    }
  });

  return roots;
};

export const flattenTree = (
  nodes: TreeNode[],
  expandedNodes: Set<string | number>,
  depthOffset = 0
): { node: TreeNode; depth: number }[] => {
  const flatNodes: { node: TreeNode; depth: number }[] = [];

  const traverse = (nodeList: TreeNode[], depth: number) => {
    nodeList.forEach(node => {
      flatNodes.push({ node, depth });
      if (expandedNodes.has(node.id) && node.children && node.children.length > 0) {
        traverse(node.children, depth + 1);
      }
    });
  };

  traverse(nodes, depthOffset);
  return flatNodes;
};

export interface TreeNodeChildItem {
  node: TreeNode;
  depth: number;
  children?: TreeNodeChildItem[];
}

/**
 * Converts a flat visible-node slice (with depth info) into a nested structure
 * used by the virtual renderer. This is the single canonical implementation.
 */
export const createNestedSlice = (
  visibleSlice: { node: TreeNode; depth: number }[]
): TreeNodeChildItem[] => {
  const result: TreeNodeChildItem[] = [];
  const stack: { item: TreeNodeChildItem; depth: number }[] = [];

  for (const { node, depth } of visibleSlice) {
    const item: TreeNodeChildItem = { node, depth, children: [] };

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
};


export const createMaps = (nodes: TreeNode[]) => {
  const nodeMap = new Map<string | number, TreeNode>();
  const parentMap = new Map<string | number, string | number>();

  const traverse = (nodeList: TreeNode[], parentId?: string | number) => {
    nodeList.forEach(node => {
      nodeMap.set(node.id, node);
      if (parentId != null) {
        parentMap.set(node.id, parentId);
      }
      if (node.children) {
        traverse(node.children, node.id);
      }
    });
  };

  traverse(nodes);
  return { nodeMap, parentMap };
};

/**
 * Returns a new tree array with the given node updated.
 * Short-circuits recursion once the target node is found to avoid
 * unnecessary O(n) traversal of unaffected branches.
 */
export const updateNodeInTree = (nodes: TreeNode[], id: string | number, updates: Partial<TreeNode>): TreeNode[] => {
  let found = false;
  const walk = (list: TreeNode[]): TreeNode[] => {
    if (found) return list; // short-circuit once found
    return list.map(node => {
      if (node.id === id) {
        found = true;
        return { ...node, ...updates };
      }
      if (!found && node.children) {
        const newChildren = walk(node.children);
        return found ? { ...node, children: newChildren } : node;
      }
      return node;
    });
  };
  return walk(nodes);
};

/**
 * Moves a node within the tree. Does NOT mutate source nodes — always returns
 * new objects for modified branches.
 */
export const moveNodeInTree = (
  nodes: TreeNode[],
  sourceId: string | number,
  targetId: string | number,
  position: 'before' | 'inside' | 'after'
): TreeNode[] => {
  if (sourceId === targetId) return nodes;

  let sourceNode: TreeNode | null = null;

  const removeNode = (list: TreeNode[]): TreeNode[] => {
    return list.reduce<TreeNode[]>((acc, n) => {
      if (n.id === sourceId) {
        sourceNode = { ...n }; // capture a copy
        return acc;
      }
      if (n.children) {
        acc.push({ ...n, children: removeNode(n.children) });
      } else {
        acc.push(n);
      }
      return acc;
    }, []);
  };

  const withoutSource = removeNode(nodes);
  if (!sourceNode) return nodes;

  const capturedSource = sourceNode as TreeNode;

  const insertNode = (list: TreeNode[]): TreeNode[] => {
    const res: TreeNode[] = [];
    for (const n of list) {
      if (n.id === targetId) {
        const targetParentId = n.parentId;
        if (position === 'before') {
          capturedSource.parentId = targetParentId;
          res.push(capturedSource, n);
        } else if (position === 'after') {
          capturedSource.parentId = targetParentId;
          res.push(n, capturedSource);
        } else {
          capturedSource.parentId = n.id;
          res.push({ ...n, children: [...(n.children || []), capturedSource], hasChildren: true });
        }
      } else {
        const newNode = { ...n };
        if (n.children) newNode.children = insertNode(n.children);
        res.push(newNode);
      }
    }
    return res;
  };

  return insertNode(withoutSource);
};

export const sortTreeNodes = (nodes: TreeNode[], sortOrder?: SortOrderType): TreeNode[] => {
  if (!sortOrder || sortOrder === 'None') return nodes;

  let compareFn: (a: TreeNode, b: TreeNode) => number;

  if (typeof sortOrder === 'function') {
    compareFn = sortOrder;
  } else if (sortOrder === 'Ascending') {
    compareFn = (a, b) => (a.text || String(a.id)).localeCompare(b.text || String(b.id));
  } else if (sortOrder === 'Descending') {
    compareFn = (a, b) => (b.text || String(b.id)).localeCompare(a.text || String(a.id));
  } else {
    return nodes;
  }

  return [...nodes].sort(compareFn).map(node => ({
    ...node,
    children: node.children ? sortTreeNodes(node.children, sortOrder) : undefined
  }));
};
