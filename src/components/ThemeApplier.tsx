import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { applyThemeToDocument, clearThemeFromDocument, normalizeTheme } from '../lib/theme';

/** Applies the active business theme to CSS variables while logged in */
export function ThemeApplier() {
  const { data } = useApp();

  useEffect(() => {
    if (!data.session.loggedIn) {
      clearThemeFromDocument();
      return;
    }
    const theme = normalizeTheme(data.business.theme, data.business.brandColor);
    applyThemeToDocument(theme);
    return () => {
      // keep theme while navigating app; only clear on logout via above branch
    };
  }, [
    data.session.loggedIn,
    data.business.theme,
    data.business.brandColor,
    data.activeWorkspaceId,
  ]);

  return null;
}
