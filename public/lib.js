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
 * Download resource via an <a> tag
 * @param {string} url raw URL or data URL
 * @param {string} name name for file ("file" by default)
 */
export function downloadResource(url, name = "file") {
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", name);
  document.body.append(a);
  a.click();
  a.remove();
}

/**
 * Loads a folder and its associated code.
 * @param {string} folder component folder name
 */
export async function loadHtmlComponent(folder) {
  const html = await fetch(`/${folder}/index.html`).then((res) => res.text());

  // temp element used to deserialize HTML
  const span = document.createElement("span");
  // replace relative imports with absolute imports
  span.innerHTML = html.replace(
    /"\.\/(.+?)"/g,
    (_, path) => `/${folder}/${path}`
  );

  // Extract script tag sources because external scripts are blocked by the browser when appending
  const modules = [...span.querySelectorAll("script")].map((el) => el.src);

  document.body.append(...span.children);

  // We need to wait for the HTML to be added to the document before requesting
  await Promise.all(modules.map((src) => import(src)));
}

/** @param {number} ms */
export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const highlightWorker = new Worker("./worker/index.js", { type: "module" });

let stripAnsiEscape = false;
export const toggleParsingAnsi = () => {
  stripAnsiEscape = !stripAnsiEscape;
}

/**
 * Highlights text!
 * Calls the worker and deserializes the response into DOM nodes.
 * @param {string} input
 * @returns {Promise<Node[]>}
 * */
export const highlightText = (input) => {
  /** @param {any} obj */
  const getElementForObj = (obj) => {
    if (typeof obj == "string") return obj;

    const { name, children, ...rest } = obj;
    const element = Object.assign(document.createElement(name), rest);
    for (const child of obj?.children ?? []) {
      element.append(getElementForObj(child));
    }
    return element;
  };

  return new Promise((res) => {
    const id = crypto.randomUUID();

    /** @param {MessageEvent<{ nodes: any[], id: string }>} e */
    const listener = ({ data }) => {
      if (data.id !== id) return;
      highlightWorker.removeEventListener('message', listener);

      const elements = data.nodes.map((obj) => getElementForObj(obj));
      res(elements);
    };

    highlightWorker.addEventListener("message", listener);
    highlightWorker.postMessage({ input, stripAnsiEscape, id });
  });
};
