/** Inline before React; keeps `theme` in sync with `localStorage` and avoids flash. */
export const THEME_STORAGE_KEY = "theme";

/** No stored preference → light (do not follow `prefers-color-scheme`). */
export const themeInitScript = `(()=>{try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var d=document.documentElement;if(t==="dark")d.classList.add("dark");else d.classList.remove("dark");}catch(e){}})();`;
