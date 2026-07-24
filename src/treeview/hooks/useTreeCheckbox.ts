import { useState, useCallback, useMemo } from 'react';
import type { TreeNode, CheckState } from '../types/tree.types';
import { updateNodeCheckState } from '../utils/selectionUtils';

export const useTreeCheckbox = (
  nodeMap: Map<string | number, TreeNode>,
  parentMap: Map<string | number, string | number>,
  controlledChecked?: (string | number)[],
  onNodeCheck?: (node: TreeNode, checkedMap: Map<string | number, CheckState>) => void
) => {
  const [internalChecked, setInternalChecked] = useState<Map<string | number, CheckState>>(new Map());

  const isControlled = controlledChecked !== undefined;
  
  const checkedNodes = useMemo(() => {
    if (isControlled) {
      const map = new Map<string | number, CheckState>();
      controlledChecked.forEach(id => map.set(id, 'checked'));
      // Note: Full tri-state recalculation from controlled array omitted for brevity,
      // but in full implementation we would compute indeterminate states here
      return map;
    }
    return internalChecked;
  }, [controlledChecked, internalChecked, isControlled]);

  const toggleCheck = useCallback(
    (nodeId: string | number) => {
      const currentState = checkedNodes.get(nodeId);
      const nextState: CheckState = currentState === 'checked' ? 'unchecked' : 'checked';
      
      const newCheckedMap = updateNodeCheckState(checkedNodes, nodeMap, parentMap, nodeId, nextState);
      
      if (!isControlled) {
        setInternalChecked(newCheckedMap);
      }
      
      const node = nodeMap.get(nodeId);
      if (node && onNodeCheck) {
        onNodeCheck(node, newCheckedMap);
      }
    },
    [checkedNodes, nodeMap, parentMap, isControlled, onNodeCheck]
  );

  return { checkedNodes, toggleCheck };
};
