import React, { useRef, useEffect } from 'react';
import { CheckState } from '../../types/tree.types';

interface TreeCheckboxProps {
  checkState: CheckState;
  onChange: () => void;
}

export const TreeCheckbox: React.FC<TreeCheckboxProps> = ({ checkState, onChange }) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = checkState === 'indeterminate';
    }
  }, [checkState]);

  return (
    <input
      type="checkbox"
      ref={checkboxRef}
      className="tree-checkbox"
      checked={checkState === 'checked'}
      onChange={(e) => {
        e.stopPropagation();
        onChange();
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
};
