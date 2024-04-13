import { setFilter } from "./filter.js";
import { $, $$, cloneTemplate } from "./lib.js";

const tagsContainer = $(".tags");

tagsContainer.addEventListener("click", (e) => {
  const tagEl = e.target;
  if (!(tagEl instanceof HTMLElement)) return;
  if (tagEl.tagName !== "SL-BADGE") return;

  if (tagEl.getAttribute("variant") === "neutral") {
    for (const tag of $$(".tags sl-badge")) {
      tag.setAttribute("variant", "neutral");
      tag.setAttribute("aria-pressed", "false");
    }
    tagEl.setAttribute("variant", "primary");
    tagEl.setAttribute("aria-pressed", "true");
    setFilter(`@@tag="${tagEl.textContent}"`, true);
  } else {
    tagEl.setAttribute("variant", "neutral");
    tagEl.setAttribute("aria-pressed", "true");
    setFilter("", true);
  }
});

/** @type {Set<string>} */
const tagsSet = new Set();

/**
 * Finds all tag elements in a log.
 * Only adds a new tag if it is not already present.
 *
 * @param {HTMLElement} logEl
 */
export function maybeAddTag(logEl) {
  const newTags = [...logEl.querySelectorAll(".tag")]
    .map((el) => el.textContent)
    .filter((tag) => !tagsSet.has(tag));

  for (const tagText of newTags) {
    tagsSet.add(tagText);
    const tag = cloneTemplate(".badge", { textContent: tagText });
    tagsContainer.append(tag);
  }
}
