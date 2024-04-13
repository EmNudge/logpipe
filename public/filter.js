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

  const SELECTOR_MATCH = /@@([\w,]+)/g;

  if (SELECTOR_MATCH.test(filter)) {
    const tags = [...filter.matchAll(SELECTOR_MATCH)].map((m) => m[1]);
    logs = logs.filter((logEl) => {
      console.log(tags)
      const shouldDisplay = tags
        .map((tagGroup) => {
          const elements = logEl.querySelectorAll(
            tagGroup
              .split(/\s*,\s*/)
              // remove empty strings from trailing commas
              .filter((s) => s.length)
              .map((tag) => `span.${tag}`)
              .join(",")
          );
          console.log(elements)
          return elements.length;
        })
        .every((len) => len > 0);

      if (!shouldDisplay) filterCount--;
      logEl.style.display = shouldDisplay ? "" : "none";
      return shouldDisplay;
    });
    filter = filter.replace(SELECTOR_MATCH, "").trim();
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
