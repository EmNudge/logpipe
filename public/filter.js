import { $, $$ } from "./lib.js";

/** @typedef {{ input: string, date: number, id: string }} CliInput */

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
      /\w+(?:="((?:\\"|[^"])+)")?/, // match <classname> with optional ="<string>"
      /(?:,\w+(?:="((?:\\"|[^"])+)")?)*/, // optionally match multiple instances separated by comma
    ]
      .map((r) => r.source)
      .join(""),
    "g"
  );

/** @param {string} filterText */
const extractTags = (filterText) => {
  return [...filterText.matchAll(getSelector())].map(
    ([_, tagList, textValue]) => {
      const tags = tagList.split(/\s*,\s*/).filter((s) => s.length);
      const selector = tags.map((tag) => `span.${tag}`).join(", ");
      return { selector, textValue };
    }
  );
};

/**
 * Match tags against input. Tags work on HTML DOM instead of text.
 *
 * @param {{ selector: string, textValue: string }[]} tags
 * @param {HTMLElement} logEl
 */
const matchTags = (tags, logEl) => {
  return tags
    .map(({ selector, textValue }) => {
      let elements = [...logEl.querySelectorAll(selector)];
      if (textValue) {
        elements = elements.filter((el) =>
          el.textContent.toLowerCase().includes(textValue)
        );
      }
      return elements.length;
    })
    .every((len) => len > 0);
};

/**
 * Applies filter to element based off of input content
 *
 * @param {string} input
 * @param {HTMLElement} logEl */
export const applyFilter = (input, logEl) => {
  let filter = filterText;
  const tags = extractTags(filterText);
  if (tags) {
    if (!matchTags(tags, logEl)) {
      logEl.style.display = "none";
      return;
    }

    filter = filter.replace(getSelector(), "").trim();
  }

  const shouldDisplay = input.includes(filterText);
  logEl.style.display = shouldDisplay ? "" : "none";
  if (shouldDisplay) filterItemsCount++;
};

/**
 * @param {string} newText
 * @param {boolean} changeInput
 */
export const setFilter = (newText, changeInput = false) => {
  filterText = newText;
  if (changeInput) filterInputEl.value = newText;

  let logs = $$(".container .log");
  let filterCount = logs.length;
  let filter = filterText.toLowerCase();

  if (!filter.length) {
    for (const logEl of logs) {
      logEl.style.display = "";
    }
    return;
  }

  if (getSelector().test(filter)) {
    const tagGroups = extractTags(filter);

    logs = logs.filter((logEl) => {
      const shouldDisplay = tagGroups
        .map(({ selector, textValue }) => {
          let elements = [...logEl.querySelectorAll(selector)];
          if (textValue) {
            elements = elements.filter((el) =>
              el.textContent.toLowerCase().includes(textValue)
            );
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
