export const isChrome = !!window && !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
export const isFirefox = typeof InstallTrigger !== 'undefined';
export const isIE = /*@cc_on!@*/false || !!document.documentMode;
export const isEdge = !isIE && !!window && !!window.StyleMedia;
