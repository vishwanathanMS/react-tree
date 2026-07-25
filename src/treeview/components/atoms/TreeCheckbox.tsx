import React from 'react';
import { CheckState } from '../../types/tree.types';

interface TreeCheckboxProps {
  checkState: CheckState;
  onChange: () => void;
}

export const TreeCheckbox: React.FC<TreeCheckboxProps> = React.memo(({ checkState, onChange }) => {
  /**
   * Use a callback ref instead of useRef + useEffect to set the indeterminate
   * property. This avoids an extra effect execution and correctly handles the
   * case where the element is first mounted already in indeterminate state.
   */
  const setIndeterminate = (el: HTMLInputElement | null) => {
    if (el) {
      el.indeterminate = checkState === 'indeterminate';
    }
  };

  return (
    <input
      type="checkbox"
      ref={setIndeterminate}
      className="tree-checkbox"
      checked={checkState === 'checked'}
      onChange={(e) => {
        e.stopPropagation();
        onChange();
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
});

TreeCheckbox.displayName = 'TreeCheckbox';
