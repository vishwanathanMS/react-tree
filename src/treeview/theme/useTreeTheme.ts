import { useEffect } from 'react';
import { defaultThemeCSS } from './material3Tokens';

export const useTreeTheme = () => {
  useEffect(() => {
    const styleId = 'treeview-material3-theme';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = defaultThemeCSS;
      document.head.appendChild(style);
    }
  }, []);
};
