import {
  signal as signalPreact,
  effect as effectPreact,
  computed as computedPreact,
} from "https://esm.sh/@preact/signals";

/**
 * Document query selector alias
 * @type {(selector: string) => HTMLElement}
 */
export const $ = (s) => document.querySelector(s);

/**
 * Document querySelectorAll alias
 * @type {(selector: string) => HTMLElement[]}
 */
export const $$ = (s) => /**@type {HTMLElement[]}*/([...document.querySelectorAll(s)]);

/**
 * Preact signal alias
 * @type {<T>(init: T) => { value: T }}
 */
export const signal = signalPreact;

/**
 * Preact effect alias
 * @type {(func: () => void) => void}
 */
export const effect = effectPreact;

/**
 * Preact computed alias
 * @type {<T>(func: () => T) => T}
 */
export const computed = computedPreact;

const cloneMap = new Map();
/**
 * Clones a "template" element based off of a selector.
 * It will only clone the element if it contains the `template` class.
 *
 * @param {string} selector
 * @returns {HTMLElement}
 */
export const cloneTemplate = (selector) => {
  if (cloneMap.has(selector)) {
    return cloneMap.get(selector).cloneNode(true);
  }

  const tempEl = document
    .querySelector(`.template${selector}`)
    ?.cloneNode(true);
  if (!(tempEl instanceof HTMLElement)) {
    throw new Error(`No element found for selector: ${selector}`);
  }

  tempEl.classList.remove("template");
  cloneMap.set(selector, tempEl);
  return /** @type {HTMLElement} */ (tempEl.cloneNode(true));
};

/**
 * Uses IntersectionObserver to check if an element
 * is in view of a scroll container. 
 * 
 * @param {Element} logEl
 * @param {Element} root
 * @returns {Promise<boolean>}
 */
export function isInView(logEl, root) {
  return new Promise((res) => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          res(true);
        }
      },
      { root }
    );
    observer.observe(logEl);
    setTimeout(() => {
      res(false);
    }, 5);
  });
};

/**
 * Highlights some text based off of various heuristics.
 * Returns html as a string
 *
 * @param {string} text
 * @returns {string} html
 */
export function highlightText(text) {
  const map = new Map();
  let ident = 0;

  const modified = text
    .replace(/\n( *)/g, (_, space) => {
      const placeholder = `$${ident++}`;
      const html = space
        ? `<br><span style="white-space: pre">${space}</span>`
        : "<br>";
      map.set(placeholder, html);
      return placeholder;
    })
    .replace(/\S+/g, (m) => {
      const dateObj = new Date(m);
      if (Number.isNaN(dateObj.valueOf())) {
        return m;
      }
      if (dateObj.toISOString() === m) {
        const placeholder = `$${ident++}`;
        map.set(placeholder, `<span class="date">${m}</span>`);
        return placeholder;
      }

      return m;
    })
    .replace(/"[^"]+?"/g, (m) => {
      const placeholder = `$${ident++}`;
      map.set(placeholder, `<span class="string">${m}</span>`);
      return placeholder;
    })
    .replace(/\$?(-|\+)?\d+(.\d+)?/g, (m) => {
      if (m.startsWith("$")) return m;

      const placeholder = `$${ident++}`;
      map.set(placeholder, `<span class="number">${m}</span>`);
      return placeholder;
    })
    .replace(/\[\w+\]/g, (m) => {
      const placeholder = `$${ident++}`;
      map.set(placeholder, `<span class="tag">${m}</span>`);
      return placeholder;
    });

  return modified.replace(/\$\d+/g, (m) => {
    return map.get(m);
  });
}
