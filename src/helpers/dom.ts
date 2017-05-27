// select closet parent element
export function closest(el, selector) {
  const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

  while (el) {
    if (matchesSelector.call(el, selector)) {
      return el;
    } else {
      el = el.parentElement;
    }
  }
  return null;
}

export function getRemPixel(remValue: number): number {
    return remValue * parseFloat(window.getComputedStyle(document.body).getPropertyValue('font-size').match(/(\d+(?:\.\d+)?)px/)[1]);
}

/**
 * get the vw in pixel
 * @param value
 */
export function getVwInPixel(value: number): number {
    let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    return value / 100 * w;
}

export function getVhInPixel(value: number): number {
    let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    return value / 100 * h;
}
