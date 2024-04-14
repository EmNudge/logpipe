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
 * Download resource via an <a> tag
 * @param {string} url raw URL or data URL
 * @param {string} name name for file ("file" by default)
 */
export function downloadResource(url, name = 'file') {
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', name);
  document.body.append(a);
  a.click();
  a.remove();
}

/**
 * Loads a folder and its associated code
 * @param {string} folder component folder name
 */
export async function loadHtmlComponent(folder) {
  const html = await fetch(`./${folder}/index.html`).then(res => res.text());
    
  // temp element used to deserialize HTML
  const span = document.createElement('span');
  span.innerHTML = html;

  // Extract script tag sources because external scripts are blocked by the browser when appending
  const modules = [...span.querySelectorAll('script')].map(el => el.src);

  document.body.append(...span.children);

  // We need to wait for the HTML to be added to the document before requesting
  await Promise.all(modules.map(src => import(src)));
}