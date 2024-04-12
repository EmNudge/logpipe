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
}

/** @param {string} newText */
export const setFilter = (newText) => {
  filterText = newText;

  {
    // update filtered items
    let filterCount = 0;
    const filter = filterText.toLowerCase();
    for (const logEl of $$(".container .log")) {
      const shouldDisplay = logEl.textContent.toLowerCase().includes(filter);
      if (shouldDisplay) filterCount++;
      logEl.style.display = shouldDisplay ? "" : "none";
    }
    filterItemsCount = filterCount;
  }

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

document.addEventListener('keydown', e => {
  if (e.key !== '/' || e.metaKey || document.activeElement === filterInputEl) return;

  filterInputEl.focus();
  e.preventDefault();
});
