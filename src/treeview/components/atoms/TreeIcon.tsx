import React from 'react';

interface TreeIconProps {
  expanded: boolean;
  hasChildren: boolean;
  loading?: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const TreeIcon: React.FC<TreeIconProps> = ({ expanded, hasChildren, loading, onClick }) => {
  if (loading) {
    return (
      <span style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        ⏳
      </span>
    );
  }

  if (!hasChildren) return <span style={{ width: 24, display: 'inline-block' }} />;

  return (
    <span
      onClick={onClick}
      style={{
        width: 24,
        height: 24,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'var(--tree-transition, transform 0.2s)',
      }}
    >
      ▶
    </span>
  );
};
