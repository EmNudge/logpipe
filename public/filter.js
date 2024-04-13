import { $, $$ } from "./lib.js";

/** @typedef {{ input: string, date: number, id: string }} CliInput */

const filterInputEl = /** @type {HTMLInputElement} */ ($("sl-input.filter"));

let filterText = "";
let filterItemsCount = 0;

/**
 * Applies filter to element based off of input content
 *
 * @param {string} input
 * @param {HTMLElement} logEl */
export const applyFilter = (input, logEl) => {
  const shouldDisplay = input.includes(filterText);
  logEl.style.display = shouldDisplay ? "" : "none";
  if (shouldDisplay) filterItemsCount++;
};

/** @param {string} newText */
export const setFilter = (newText) => {
  filterText = newText;

  let logs = $$(".container .log");
  let filterCount = logs.length;
  let filter = filterText.toLowerCase();

  const getSelector = () => /@@([\w,]+)(?:="((?:\\"|[^"])+)")?/g;

  if (getSelector().test(filter)) {
    const tagGroups = [...filter.matchAll(getSelector())]
      .map(([_, tagList, textValue]) => {
        const tags = tagList.split(/\s*,\s*/).filter((s) => s.length);
        const selector = tags.map(tag => `span.${tag}`).join(', ')
        return { selector, textValue }
      });

    logs = logs.filter((logEl) => {
      const shouldDisplay = tagGroups
        .map(({ selector, textValue }) => {
          let elements = [...logEl.querySelectorAll(selector)];
          if (textValue) {
            elements = elements.filter(el => el.textContent.toLowerCase().includes(textValue))
          }
          return elements.length;
        })
        .every((len) => len > 0);

      if (!shouldDisplay) filterCount--;
      logEl.style.display = shouldDisplay ? "" : "none";
      return shouldDisplay;
    });
    filter = filter.replace(getSelector(), "").trim();
  }

  if (filter) {
    for (const logEl of logs) {
      const shouldDisplay = logEl.textContent.toLowerCase().includes(filter);
      if (!shouldDisplay) filterCount--;
      logEl.style.display = shouldDisplay ? "" : "none";
    }
  }

  filterItemsCount = filterCount;

  // set filter log count text
  $(".log-count .filtered").textContent = filterText.length
    ? `filtered: (${filterItemsCount})`
    : "";
};

filterInputEl.addEventListener("input", () => {
  const filter = filterInputEl.value;
  for (const logEl of $$(".container .log")) {
    logEl.style.display = logEl.textContent.includes(filter) ? "" : "none";
  }
  setFilter(filter);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "/" || e.metaKey || document.activeElement === filterInputEl)
    return;

  filterInputEl.focus();
  e.preventDefault();
});
