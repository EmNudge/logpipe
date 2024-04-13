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

/** @typedef {{ tag: string; textValue?: string; }[]} TagGroup */

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
  return tagGroups
    .map((tagGroup) => {
      const selector = tagGroup.map(({ tag }) => `span.${tag}`).join(", ");

      let elements = /** @type {HTMLSpanElement[]} */ ([
        ...logEl.querySelectorAll(selector),
      ]);

      for (const { tag, textValue } of tagGroup) {
        if (!textValue) continue;
        elements = elements.filter((el) => {
          if (!el.classList.contains(tag)) return true;
          console.log(el.textContent, textValue)
          return el.textContent === textValue;
        });
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
  const tags = extractTagGroups(filterText);
  if (tags.length) {
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
  let filter = filterText;

  if (!filter.length) {
    for (const logEl of logs) {
      logEl.style.display = "";
    }
    return;
  }

  if (getSelector().test(filter)) {
    const tagGroups = extractTagGroups(filter);

    logs = logs.filter((logEl) => {
      const shouldDisplay = matchTags(tagGroups, logEl);

      if (!shouldDisplay) filterCount--;
      logEl.style.display = shouldDisplay ? "" : "none";
      return shouldDisplay;
    });
    filter = filter.replace(getSelector(), "").trim();
  }

  if (filter) {
    filter = filter.toLowerCase();
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

filterInputEl.addEventListener("input", () => setFilter(filterInputEl.value));

document.addEventListener("keydown", (e) => {
  if (e.key !== "/" || e.metaKey || document.activeElement === filterInputEl)
    return;

  filterInputEl.focus();
  e.preventDefault();
});
