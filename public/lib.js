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
export const $$ = (s) => [...document.querySelectorAll(s)];

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
 * @param {string} selector @returns {HTMLElement} 
 */
export const cloneTemplate = (selector) => {
  if (cloneMap.has(selector)) {
    return cloneMap.get(selector).cloneNode(true);
  }

  const tempEl = document.querySelector(`.template${selector}`).cloneNode(true);
  tempEl.classList.remove("template");
  cloneMap.set(selector, tempEl);
  return tempEl.cloneNode(true);
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