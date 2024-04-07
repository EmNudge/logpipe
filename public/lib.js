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
export const $$ = (s) =>
  /**@type {HTMLElement[]}*/ ([...document.querySelectorAll(s)]);

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
 * @param {Record<string, any> | undefined} properties
 * @returns {HTMLElement}
 */
export const cloneTemplate = (selector, properties = {}) => {
  if (cloneMap.has(selector)) {
    const node = cloneMap.get(selector).cloneNode(true);
    Object.assign(node, properties);
    return node;
  }

  const tempEl = document
    .querySelector(`${selector}.template`)
    ?.cloneNode(true);
  if (!(tempEl instanceof HTMLElement)) {
    throw new Error(`No element found for selector: ${selector}`);
  }

  tempEl.classList.remove("template");
  cloneMap.set(selector, tempEl);
  const node = /** @type {HTMLElement} */ (tempEl.cloneNode(true));
  return Object.assign(node, properties);
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
}

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

  // parse ANSI escapes
  let openingTags = 0;
  const ansiText = text.replace(
    /\x1B\[((?:\d+|;)+)m/g,
    (_, /** @type {string} */ num) => {
      const placeholder = `$${ident++}`;
      if (num === "0") {
        map.set(placeholder, "</span>".repeat(openingTags));
        openingTags = 0;
        return placeholder;
      }

      openingTags++;
      
      if (num.startsWith("38;5")) {
        const ansiColor = Number(num.split(";").slice(-1)[0]) - 16;
        const [r, g, b] = [
          ((ansiColor / 36) % 6) * 51,
          ((ansiColor / 6) % 6) * 51,
          (ansiColor % 6) * 51,
        ].map(n => (n + 255) % 255);

        map.set(placeholder, `<span style="color: rgb(${r}, ${g}, ${b})">`);
        return placeholder;
      }

      const codes = num.split(";");
      const styles = codes
        .map((code) => {
          if (code === "0") return "reset";
          if (code === "1") return "bold";
          if (code === "2") return "dim";
          if (code === "3") return "italic";
          if (code === "4") return "underline";
          if (code === "5") return "blink";
          return code;
        })
        .map((name) => `ansi-${name}`);

      map.set(placeholder, `<span class="${styles.join(" ")}">`);
      return placeholder;
    }
  );

  const modified = ansiText
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
    .replace(/ \$?(-|\+)?\d+(.\d+)? /g, (m) => {
      if (m.startsWith(" $")) return m;

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
