import { $ } from "./lib.js";
import { store, scroller } from "../log-adder.js";
import { getHighlighted, clearFilter, setFiltered } from "./log-store.js";
import { getScrollAnchor, rerender, scrollToIndex } from "./virtual-scroller.js";

/** @typedef {import('../../types.d.ts').CliInput} CliInput */
/** @typedef {import('../../types.d.ts').TagGroup} TagGroup */
/** @typedef {import('./utils.d.ts').HighlightedLog} HighlightedLog */

const filterInputEl = /** @type {HTMLInputElement} */ ($("sl-input.filter"));

let filterText = "";

/**
 * Update the filter count display
 */
export const updateFilterCount = () => {
  if (!filterText.length || !store.filtered) {
    $(".log-count .filtered").textContent = "";
    return;
  }

  $(".log-count .filtered").textContent = `filtered: (${store.filtered.length})`;
};

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
 * Match tags against extracted tag data
 * Tags are stored as "classname:textcontent" strings
 *
 * @param {TagGroup[]} tagGroups
 * @param {string[]} extractedTags - Array of "classname:textvalue" strings
 */
const matchTags = (tagGroups, extractedTags) => {
  // all groups must match for it to match log
  for (const tagGroup of tagGroups) {
    // if any tag in group matches, this group is a match
    const matches = (() => {
      for (const { tag, textValue } of tagGroup) {
        // Check if any extracted tag starts with this class name
        const hasTag = extractedTags.some(extracted => {
          const [className, content] = extracted.split(':');
          if (className !== tag) return false;

          // If no specific text value required, just matching the class is enough
          if (!textValue) return true;

          // Otherwise, check if the content matches
          return content === textValue;
        });

        if (hasTag) return true;
      }
      return false;
    })();

    if (!matches) return false;
  }

  return true;
};

/**
 * Checks if highlighted log matches filter (based on global variable filterText)
 * @param {HighlightedLog} highlighted - Highlighted log data
 */
const matchesFilter = (highlighted) => {
  let filter = filterText;

  const tags = extractTagGroups(filterText);
  if (tags.length) {
    if (!matchTags(tags, highlighted.tags)) return false;

    filter = filter.replace(getSelector(), "").trim();
    if (!filter) return true;
  }

  return highlighted.textContent.toLowerCase().includes(filter.toLowerCase());
};

/**
 * @param {string} newText
 * @param {{ updateInput?: boolean, dispatchEvent?: boolean }} options
 */
export const setFilter = async (newText, options = {}) => {
  const { updateInput = false, dispatchEvent = false } = options;
  filterText = newText;
  if (updateInput) {
    filterInputEl.value = newText;
    if (dispatchEvent) {
      filterInputEl.dispatchEvent(new KeyboardEvent('input'));
    }
  }

  // No filter - show all logs
  if (!filterText.length) {
    clearFilter(store);
    await rerender(scroller);
    updateFilterCount();
    return;
  }

  // Get scroll anchor before filtering to preserve scroll position
  const anchor = getScrollAnchor(scroller);

  // Create filter function that can be reused for new logs
  const filterFn = (highlighted) => matchesFilter(highlighted);

  // Filter on data layer
  const indices = [];
  for (let i = 0; i < store.logs.length; i++) {
    const log = store.logs[i];
    const highlighted = await getHighlighted(store, log.id);

    if (filterFn(highlighted)) {
      indices.push(i);
    }
  }

  setFiltered(store, indices, filterFn);

  // Try to restore scroll position
  if (anchor) {
    const newIndex = indices.findIndex(i => store.logs[i].id === anchor.id);
    if (newIndex !== -1) {
      await rerender(scroller);
      await scrollToIndex(scroller, newIndex, 'start');
    } else {
      await rerender(scroller);
    }
  } else {
    await rerender(scroller);
  }

  // Update filter log count text
  updateFilterCount();
};

filterInputEl.addEventListener("input", () => setFilter(filterInputEl.value));

document.addEventListener("keydown", (e) => {
  if (e.key !== "/" || e.metaKey || document.activeElement === filterInputEl)
    return;

  filterInputEl.focus();
  e.preventDefault();
});
