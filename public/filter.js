import { $, $$ } from "./lib.js";

/** @typedef {import('../types.d.ts').CliInput} CliInput */
/** @typedef {import('../types.d.ts').TagGroup} TagGroup */

const filterInputEl = /** @type {HTMLInputElement} */ ($("sl-input.filter"));

let filterText = "";
let filterItemsCount = 0;

/**
 * Syntax: \@@ (,<classname>[="<text>"])+
 * e.g. `@@tag="[INFO]"`
 * e.g. `@@tag,number,string`
 * e.g. `@@tag="[INFO]",number`
 */
const getSelector = () =>
  new RegExp(
    [
      /@@/,
      /[\w-]+(?:="((?:\\"|[^"])+)")?/, // match <classname> with optional ="<string>"
      /(?:,[\w-]+(?:="((?:\\"|[^"])+)")?)*/, // optionally match multiple instances separated by comma
    ]
      .map((r) => r.source)
      .join(""),
    "g"
  );

/**
 * @param {string} filterText
 * @returns {TagGroup[]}
 */
const extractTagGroups = (filterText) => {
  return [...filterText.matchAll(getSelector())].map(([match]) => {
    return match
      .slice(2)
      .split(",")
      .map((tagText) => {
        const [tag, textValue] = tagText.split("=");
        return { tag, textValue: textValue?.slice(1, -1) };
      });
  });
};

/**
 * Match tags against input. Tags work on HTML DOM instead of text.
 *
 * @param {TagGroup[]} tagGroups
 * @param {HTMLElement} logEl
 */
const matchTags = (tagGroups, logEl) => {
  // all groups must match for it to match log
  for (const tagGroup of tagGroups) {
    // if any tag in group matches, this group is a match
    const matches = (() => {
      for (const { tag, textValue } of tagGroup) {
        const elements = logEl.querySelectorAll(`span.${tag}`);
        if (!elements.length) continue;

        if (!textValue) return true;
        
        const oneMatch = [...elements].some(el => el.textContent === textValue);
        if (oneMatch) return true;
      }
      return false;
    })();

    if (!matches) return false;
  }

  return true;
};

/**
 * Checks if log matches filter (based on global variable filterText)
 * @param {HTMLElement} logEl DOM element for log
 */
const elMatchesFilter = (logEl) => {
  let filter = filterText;

  const tags = extractTagGroups(filterText);
  if (tags.length) {
    if (!matchTags(tags, logEl)) return false;
    
    filter = filter.replace(getSelector(), "").trim();
    if (!filter) return true;
  }

  return logEl.textContent.toLowerCase().includes(filterText.toLowerCase());
};

/**
 * Applies filter to element based off of input content
 * @param {HTMLElement} logEl */
export const applyFilter = (logEl) => {
  const shouldDisplay = elMatchesFilter(logEl);
  logEl.style.display = shouldDisplay ? "" : "none";
  if (shouldDisplay) filterItemsCount++;
};

/**
 * @param {string} newText
 * @param {boolean} changeInput
 */
export const setFilter = (newText, changeInput = false, dispatchEvent = changeInput) => {
  filterText = newText;
  if (changeInput) {
    filterInputEl.value = newText;
    if (dispatchEvent) {
      filterInputEl.dispatchEvent(new KeyboardEvent('input'));
    }
  }

  let logs = $$(".container .log");
  let filterCount = logs.length;
  let filter = filterText;

  if (!filter.length) {
    for (const logEl of logs) {
      logEl.style.display = "";
    }
    return;
  }

  for (const logEl of logs) {
    const shouldDisplay = elMatchesFilter(logEl);

    if (!shouldDisplay) filterCount--;
    logEl.style.display = shouldDisplay ? "" : "none";
  }

  filterItemsCount = filterCount;

  // set filter log count text
  $(".log-count .filtered").textContent = filterText.length
    ? `filtered: (${filterItemsCount})`
    : "";
};

filterInputEl.addEventListener("input", () => setFilter(filterInputEl.value));

document.addEventListener("keydown", (e) => {
  if (e.key !== "/" || e.metaKey || document.activeElement === filterInputEl)
    return;

  filterInputEl.focus();
  e.preventDefault();
});
