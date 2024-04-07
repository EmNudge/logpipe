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
  const getIdent = () => `$${ident++};`;
  /** @param {string} text */
  const getReplacement = (text) => {
    const placeholder = getIdent();
    map.set(placeholder, text);
    return placeholder;
  };

  // parse ANSI escapes
  let openingTags = 0;
  const ansiText = text
    // replace links (yes, these exist)
    .replace(/\x1B]8;;(.+?)\x1B\\(.+?)\x1B]8;;\x1B\\/g, (_, link, text) => {
      return getReplacement(`<a href="${link}">${text}</a>`);
    })
    .replace(/\x1B\[((?:\d+|;)+?)m/g, (_, /** @type {string} */ num) => {
      if (num === "0") {
        const closingTags = "</span>".repeat(openingTags);
        openingTags = 0;
        return getReplacement(closingTags);
      }

      openingTags++;

      if (num.startsWith("38;5")) {
        const ansiColor = Number(num.split(";").slice(-1)[0]);
        const colors = [
          "black",
          "red",
          "green",
          "yellow",
          "blue",
          "magenta",
          "cyan",
          "white",
          "gray",
          "red",
          "brightgreen",
          "yellow",
          "dodgerblue",
          "pink",
          "aqua",
          "white",
        ];
        if (colors[ansiColor]) {
          return getReplacement(`<span style="color: ${colors[ansiColor]}">`);
        }
        return getReplacement(
          `<span class="ansi-256-foreground-${ansiColor}">`
        );
      }

      const codes = num.split(";");
      const styles = codes
        .map((code) => {
          if (code === "1") return "bold";
          if (code === "2") return "dim";
          if (code === "3") return "italic";
          if (code === "4") return "underline";
          if (code === "5") return "blink";
          return code;
        })
        .map((name) => `ansi-${name}`);

      return getReplacement(`<span class="${styles.join(" ")}">`);
    });

  const modified = ansiText
    .replace(/\n( *)/g, (_, space) => {
      return getReplacement(
        space ? `<br><span style="white-space: pre">${space}</span>` : "<br>"
      );
    })
    .replace(/\S+/g, (m) => {
      const dateObj = new Date(m);
      if (Number.isNaN(dateObj.valueOf())) {
        return m;
      }
      if (dateObj.toISOString() === m) {
        return getReplacement(`<span class="date">${m}</span>`);
      }

      return m;
    })
    .replace(/"[^"]+?"/g, (m) => {
      return getReplacement(`<span class="string">${m}</span>`);
    })
    .replace(/ \$?(-|\+)?\d+(.\d+)? /g, (m) => {
      if (m.startsWith(" $")) return m;

      return getReplacement(`<span class="number">${m}</span>`);
    })
    .replace(/\[\w+\]/g, (m) => {
      return getReplacement(`<span class="tag">${m}</span>`);
    });

  return modified.replace(/\$\d+;/g, (m) => {
    return map.get(m);
  });
}
