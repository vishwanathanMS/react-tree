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
  icon?: string;
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

export type SortOrderType = 'Ascending' | 'Descending' | 'None' | ((a: TreeNode, b: TreeNode) => number);

export interface TreeViewProps {
  dataSource: unknown[] | any; // Array or Syncfusion DataManager
  query?: any; // Syncfusion Query instance
  fieldMapping?: FieldMapping;
  selectable?: boolean;
  multiple?: boolean;
  checkable?: boolean;
  checkOnClick?: boolean;
  loadOnDemand?: boolean;
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
  sortOrder?: SortOrderType;
  children?: React.ReactNode;
}

export type CheckState = 'checked' | 'unchecked' | 'indeterminate';

export interface DropPosition {
  targetId: string | number;
  type: 'before' | 'inside' | 'after';
}

export interface TreeItemSlotContext {
  node: TreeNode;
  isExpanded: boolean;
  isSelected: boolean;
  checkState: CheckState;
  loading: boolean;
  hasChildren: boolean;
  depth: number;
  toggleExpand: () => void;
  toggleSelect: (multi?: boolean) => void;
  toggleCheck: () => void;
  isEditing: boolean;
  inputValue: string;
  setInputValue: (val: string) => void;
  commitEdit: () => void;
}

