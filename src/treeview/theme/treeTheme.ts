export const customTreeTheme = {
  treeBg: '#ffffff',
  treeText: '#1f2937',
  treeHover: '#f3f4f6',
  treeSelected: '#e0e7ff',
  treeSelectedText: '#3730a3',
  treeFocusRing: '#6366f1',
  treeRadius: '6px',
  treeIndent: '20px',
  transition: 'background-color 0.15s ease, color 0.15s ease',
};

export const customThemeCSS = `
  :root {
    --tree-bg: ${customTreeTheme.treeBg};
    --tree-text: ${customTreeTheme.treeText};
    --tree-hover: ${customTreeTheme.treeHover};
    --tree-selected: ${customTreeTheme.treeSelected};
    --tree-selected-text: ${customTreeTheme.treeSelectedText};
    --tree-focus-ring: ${customTreeTheme.treeFocusRing};
    --tree-radius: ${customTreeTheme.treeRadius};
    --tree-indent: ${customTreeTheme.treeIndent};
    --tree-transition: ${customTreeTheme.transition};
  }

  .tree-node {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .tree-node-row {
    border-radius: var(--tree-radius);
    padding-top: 6px;
    padding-bottom: 6px;
    padding-right: 8px;
    color: var(--tree-text);
    transition: var(--tree-transition);
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
    user-select: none;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .tree-node-row:hover {
    background: var(--tree-hover);
  }

  .tree-node-row[aria-selected="true"],
  .tree-node-row.tree-node-selected {
    background: var(--tree-selected);
    color: var(--tree-selected-text);
  }

  .tree-node-row:focus,
  .tree-node-row:focus-visible {
    box-shadow: 0 0 0 2px var(--tree-focus-ring) inset;
  }

  .tree-node-children {
    display: none;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
  }

  .tree-node-children.tree-expanded {
    display: flex;
  }

  .tree-checkbox {
    margin-right: 8px;
    accent-color: var(--tree-focus-ring);
  }

  .tree-input-edit {
    font: inherit;
    color: inherit;
    background: var(--tree-bg);
    border: 1px solid var(--tree-focus-ring);
    border-radius: 4px;
    padding: 2px 4px;
    outline: none;
  }

  .tree-virtual-padding {
    transition: padding 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes tree-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
