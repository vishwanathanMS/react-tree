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

export const updateNodeInTree = (nodes: TreeNode[], id: string | number, updates: Partial<TreeNode>): TreeNode[] => {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, id, updates) };
    }
    return node;
  });
};

export const moveNodeInTree = (nodes: TreeNode[], sourceId: string | number, targetId: string | number, position: 'before' | 'inside' | 'after'): TreeNode[] => {
  let sourceNode: TreeNode | null = null;
  const removeNode = (list: TreeNode[]): TreeNode[] => {
    return list.filter(n => {
      if (n.id === sourceId) {
        sourceNode = { ...n };
        return false;
      }
      if (n.children) {
        n.children = removeNode(n.children);
      }
      return true;
    });
  };

  const insertNode = (list: TreeNode[]): TreeNode[] => {
    const res: TreeNode[] = [];
    for (const n of list) {
      if (n.id === targetId && sourceNode) {
        if (position === 'before') {
          res.push(sourceNode, n);
        } else if (position === 'after') {
          res.push(n, sourceNode);
        } else {
          res.push({ ...n, children: [...(n.children || []), sourceNode] });
        }
      } else {
        const newNode = { ...n };
        if (n.children) newNode.children = insertNode(n.children);
        res.push(newNode);
      }
    }
    return res;
  };

  const withoutSource = removeNode(nodes);
  if (!sourceNode) return nodes;
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

