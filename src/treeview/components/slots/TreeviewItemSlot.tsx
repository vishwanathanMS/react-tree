import React, { createContext, useContext } from 'react';
import type { TreeItemSlotContext } from '../../types/tree.types';

export const SlotContext = createContext<TreeItemSlotContext | null>(null);

export const useItemSlotContext = () => {
  const ctx = useContext(SlotContext);
  if (!ctx) {
    throw new Error('TreeItem slot sub-components must be rendered within TreeviewItemContent');
  }
  return ctx;
};

export interface TreeviewItemContentProps {
  children?: ((ctx: TreeItemSlotContext) => React.ReactNode) | React.ReactNode;
}

export const TreeviewItemContent: React.FC<TreeviewItemContentProps> = ({ children }) => {
  const ctx = useContext(SlotContext);
  if (!ctx) return null;

  if (typeof children === 'function') {
    return <>{children(ctx)}</>;
  }

  return <>{children}</>;
};

// Aliases for spelling resilience
export const TreeViewItemContent = TreeviewItemContent;

// 1. Toggle / Expander Chevron Component
export interface TreeItemToggleProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode | ((expanded: boolean) => React.ReactNode);
  customIcon?: (expanded: boolean) => React.ReactNode;
}

export const TreeItemToggle: React.FC<TreeItemToggleProps> = ({ className, style, children, customIcon }) => {
  const { hasChildren, isExpanded, toggleExpand } = useItemSlotContext();

  if (!hasChildren) {
    return <span style={{ display: 'inline-block', width: 20, height: 20, marginRight: 4, ...style }} />;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpand();
  };

  const iconToRender = children !== undefined ? children : customIcon;

  if (iconToRender) {
    const rendered = typeof iconToRender === 'function' ? iconToRender(isExpanded) : iconToRender;
    return (
      <span onClick={handleClick} className={className} style={{ cursor: 'pointer', ...style }}>
        {rendered}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`tree-toggle-button ${className || ''}`}
      aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
      style={{
        background: 'none',
        border: 'none',
        padding: '0 4px',
        marginRight: 4,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'currentColor',
        transition: 'transform 0.2s ease',
        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
        ...style,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
};

export const TreeItemToogle = TreeItemToggle; // Alias for typo robustness

// 2. Loading Spinner Component
export interface TreeItemLoadingSpinnerProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  customSpinner?: React.ReactNode;
}

export const TreeItemLoadingSpinner: React.FC<TreeItemLoadingSpinnerProps> = ({ className, style, children, customSpinner }) => {
  const { loading } = useItemSlotContext();

  if (!loading) return null;

  const spinnerContent = children !== undefined ? children : customSpinner;

  if (spinnerContent) {
    return <span className={className} style={style}>{spinnerContent}</span>;
  }

  return (
    <span
      className={`tree-spinner ${className || ''}`}
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        marginRight: 6,
        border: '2px solid rgba(0,0,0,0.2)',
        borderTopColor: 'currentColor',
        borderRadius: '50%',
        animation: 'tree-spin 0.8s linear infinite',
        ...style,
      }}
    />
  );
};

export const TreeItemSpinner = TreeItemLoadingSpinner; // Alias

// 3. Checkbox Component
export interface TreeItemCheckProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode | ((checked: boolean, indeterminate: boolean) => React.ReactNode);
}

export const TreeItemCheck: React.FC<TreeItemCheckProps> = ({ className, style, children }) => {
  const { checkState, toggleCheck } = useItemSlotContext();

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCheck();
  };

  const isChecked = checkState === 'checked';
  const isIndeterminate = checkState === 'indeterminate';

  if (children) {
    const rendered = typeof children === 'function' ? children(isChecked, isIndeterminate) : children;
    return (
      <span onClick={handleCheck} className={className} style={{ cursor: 'pointer', marginRight: 8, ...style }}>
        {rendered}
      </span>
    );
  }

  return (
    <input
      type="checkbox"
      className={`tree-checkbox ${className || ''}`}
      checked={isChecked}
      ref={(el) => {
        if (el) el.indeterminate = isIndeterminate;
      }}
      onChange={() => {}}
      onClick={handleCheck}
      style={{ cursor: 'pointer', marginRight: 8, ...style }}
    />
  );
};

export const TreeItemCkeck = TreeItemCheck; // Alias for typo robustness

// 4. Icon Component
export interface TreeItemIconProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode | ((node: any, isExpanded: boolean) => React.ReactNode);
  icon?: React.ReactNode | ((node: any, isExpanded: boolean) => React.ReactNode);
}

export const TreeItemIcon: React.FC<TreeItemIconProps> = ({ className, style, children, icon }) => {
  const { node, isExpanded, hasChildren } = useItemSlotContext();

  const customContent = children !== undefined ? children : icon;

  if (customContent) {
    const rendered = typeof customContent === 'function' ? customContent(node, isExpanded) : customContent;
    return <span className={className} style={{ marginRight: 6, display: 'inline-flex', alignItems: 'center', ...style }}>{rendered}</span>;
  }

  if (node.icon) {
    return <span className={className} style={{ marginRight: 6, ...style }}>{node.icon}</span>;
  }

  const defaultIcon = hasChildren ? (isExpanded ? '📂' : '📁') : '📄';

  return <span className={`tree-item-icon ${className || ''}`} style={{ marginRight: 6, userSelect: 'none', ...style }}>{defaultIcon}</span>;
};

export const TreeItemicon = TreeItemIcon; // Alias for typo robustness

// 5. Text / Label / Edit Input Component
export interface TreeItemTextProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode | ((node: any) => React.ReactNode);
  renderText?: (text?: string, node?: any) => React.ReactNode;
}

export const TreeItemText: React.FC<TreeItemTextProps> = ({ className, style, children, renderText }) => {
  const { node, isEditing, inputValue, setInputValue, commitEdit } = useItemSlotContext();

  if (isEditing) {
    return (
      <input
        type="text"
        className="tree-input-edit"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitEdit();
        }}
        onClick={(e) => e.stopPropagation()}
        style={style}
        autoFocus
      />
    );
  }

  let content: React.ReactNode;
  if (typeof children === 'function') {
    content = children(node);
  } else if (children !== undefined) {
    content = children;
  } else if (renderText) {
    content = renderText(node.text, node);
  } else {
    content = node.text || String(node.id);
  }

  return (
    <span className={`tree-item-text ${className || ''}`} style={{ flex: 1, ...style }}>
      {content}
    </span>
  );
};
