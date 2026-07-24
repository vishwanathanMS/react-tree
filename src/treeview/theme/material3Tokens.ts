export const material3Tokens = {
  treeBg: 'var(--md-sys-color-surface, #ffffff)',
  treeText: 'var(--md-sys-color-on-surface, #1d1b20)',
  treeHover: 'var(--md-sys-color-surface-variant, rgba(29, 27, 32, 0.08))',
  treeSelected: 'var(--md-sys-color-secondary-container, #e8def8)',
  treeSelectedText: 'var(--md-sys-color-on-secondary-container, #1d192b)',
  treeFocusRing: 'var(--md-sys-color-primary, #6750a4)',
  treeRadius: '8px',
  treeIndent: '20px',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const defaultThemeCSS = `
  :root {
    --tree-bg: ${material3Tokens.treeBg};
    --tree-text: ${material3Tokens.treeText};
    --tree-hover: ${material3Tokens.treeHover};
    --tree-selected: ${material3Tokens.treeSelected};
    --tree-selected-text: ${material3Tokens.treeSelectedText};
    --tree-focus-ring: ${material3Tokens.treeFocusRing};
    --tree-radius: ${material3Tokens.treeRadius};
    --tree-indent: ${material3Tokens.treeIndent};
    --tree-transition: ${material3Tokens.transition};
  }

  .tree-node {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .tree-node-row {
    border-radius: var(--tree-radius);
    padding: 6px 8px;
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

  .tree-node-row[aria-selected="true"] {
    background: var(--tree-selected);
    color: var(--tree-selected-text);
  }

  .tree-node-row:focus-visible {
    box-shadow: 0 0 0 2px var(--tree-focus-ring) inset;
  }

  .tree-node-children {
    padding-left: var(--tree-indent);
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
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
`;
