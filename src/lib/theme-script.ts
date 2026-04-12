/** Inline before React; keeps `theme` in sync with `localStorage` and avoids flash. */
export const THEME_STORAGE_KEY = "theme";

export const themeInitScript = `(()=>{try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);var d=document.documentElement;if(t==="dark")d.classList.add("dark");else if(t==="light")d.classList.remove("dark");else if(window.matchMedia("(prefers-color-scheme: dark)").matches)d.classList.add("dark");}catch(e){}})();`;
