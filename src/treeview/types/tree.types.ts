export interface TreeNode {
  id: string | number;
  parentId?: string | number | null;
  text?: string;
  children?: TreeNode[];
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  disabled?: boolean;
  hasChildren?: boolean;
  data?: unknown;
  loading?: boolean;
}

export interface FieldMapping {
  id?: string;
  parentId?: string;
  text?: string;
  children?: string;
  hasChildren?: string;
  icon?: string;
}

export interface TreeViewProps {
  dataSource: unknown[];
  fieldMapping?: FieldMapping;
  selectable?: boolean;
  multiple?: boolean;
  checkable?: boolean;
  editable?: boolean;
  draggable?: boolean;
  expandOnClick?: boolean;
  defaultExpanded?: (string | number)[];
  expanded?: (string | number)[];
  selected?: (string | number)[];
  checked?: (string | number)[];
  loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
  renderNode?: (node: TreeNode) => React.ReactNode;
  onNodeSelect?: (node: TreeNode) => void;
  onNodeCheck?: (node: TreeNode, checkedMap: Map<string | number, CheckState>) => void;
  onNodeExpand?: (node: TreeNode) => void;
  onNodeCollapse?: (node: TreeNode) => void;
  onNodeDrop?: (source: TreeNode, target: TreeNode, position: 'before' | 'inside' | 'after') => void;
  onNodeEdit?: (node: TreeNode, value: string) => void;
  virtual?: boolean;
  itemHeight?: number;
  height?: number | string;
  sortOrder?: (a: TreeNode, b: TreeNode) => number;
}

export type CheckState = 'checked' | 'unchecked' | 'indeterminate';

export interface DropPosition {
  targetId: string | number;
  type: 'before' | 'inside' | 'after';
}
