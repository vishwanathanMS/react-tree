import React from 'react';

interface TreeIndentProps {
  depth: number;
}

export const TreeIndent: React.FC<TreeIndentProps> = ({ depth }) => {
  return (
    <span
      className="tree-indent"
      style={{
        display: 'inline-block',
        width: depth * parseInt(getComputedStyle(document.documentElement).getPropertyValue('--tree-indent') || '24'),
      }}
    />
  );
};
