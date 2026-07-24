import { FieldMapping, TreeNode } from '../types/tree.types';

export const mapNodeFields = (node: unknown, mapping?: FieldMapping): TreeNode => {
  if (!mapping) return node as TreeNode;

  const nodeRecord = node as Record<string, unknown>;

  const mappedNode: TreeNode = {
    ...(node as object),
    id: (mapping.id ? nodeRecord[mapping.id] : nodeRecord.id) as string | number,
    parentId: (mapping.parentId ? nodeRecord[mapping.parentId] : nodeRecord.parentId) as string | number | undefined,
    text: (mapping.text ? nodeRecord[mapping.text] : nodeRecord.text) as string | undefined,
    hasChildren: (mapping.hasChildren ? nodeRecord[mapping.hasChildren] : nodeRecord.hasChildren) as boolean | undefined,
  };

  if (mapping.children && nodeRecord[mapping.children]) {
    const childrenArray = nodeRecord[mapping.children] as unknown[];
    mappedNode.children = childrenArray.map((child: unknown) => mapNodeFields(child, mapping));
  }

  return mappedNode;
};
