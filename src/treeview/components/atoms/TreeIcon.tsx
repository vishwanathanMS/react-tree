import React from 'react';

interface TreeIconProps {
  expanded: boolean;
  hasChildren: boolean;
  loading?: boolean;
  onClick: (e: React.MouseEvent) => void;
}

// Hoisted module-level style objects — never re-created on render
const loadingStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const placeholderStyle: React.CSSProperties = {
  width: 24,
  display: 'inline-block',
};

const expandedIconStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transform: 'rotate(90deg)',
  transition: 'var(--tree-transition, transform 0.2s)',
};

const collapsedIconStyle: React.CSSProperties = {
  width: 24,
  height: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transform: 'rotate(0deg)',
  transition: 'var(--tree-transition, transform 0.2s)',
};

export const TreeIcon: React.FC<TreeIconProps> = React.memo(({ expanded, hasChildren, loading, onClick }) => {
  if (loading) {
    return <span style={loadingStyle}>⏳</span>;
  }

  if (!hasChildren) return <span style={placeholderStyle} />;

  return (
    <span
      onClick={onClick}
      // Use pre-computed style object based on expanded state
      style={expanded ? expandedIconStyle : collapsedIconStyle}
    >
      ▶
    </span>
  );
});

TreeIcon.displayName = 'TreeIcon';
