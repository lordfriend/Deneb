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
