import { useEffect } from 'react';
import { customThemeCSS } from './treeTheme';

export const useTreeTheme = () => {
  useEffect(() => {
    const styleId = 'treeview-custom-theme';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = customThemeCSS;
      document.head.appendChild(style);
    }
  }, []);
};
