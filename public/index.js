import { highlightText } from "./highlight.js";
import { $, $$, cloneTemplate, isInView } from "./lib.js";

/** @typedef {{ input: string, date: number }} CliInput */

/** @type {CliInput[]} */
const logs = [];
let filterText = "";
let filterItemsCount = 0;

/** @param {string} newText */
const setFilter = (newText) => {
  filterText = newText;

  {
    // update filtered items
    let filterCount = 0;
    for (const logEl of $$(".container .log")) {
      const shouldDisplay = logEl.textContent.includes(filterText);
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

const logContainer = $(".container");

// scroll to bottom of container
const downButton = $(".down-button");
downButton.addEventListener("click", () => {
  logContainer.children[logContainer.children.length - 1].scrollIntoView();
});
let showButton = downButton.classList.contains("show");
const GOAL_DIST = 150;
logContainer.addEventListener("scroll", (e) => {
  const dist = Math.abs(
    logContainer.scrollHeight -
      logContainer.scrollTop -
      logContainer.clientHeight
  );

  if (dist > GOAL_DIST && !showButton) {
    downButton.classList.add("show");
    showButton = true;
  } else if (dist < GOAL_DIST && showButton) {
    downButton.classList.remove("show");
    showButton = false;
  }
});

const tagsContainer = $(".tags");
tagsContainer.addEventListener("click", (e) => {
  const tagEl = e.target;
  if (!(tagEl instanceof HTMLElement)) return;
  if (tagEl.tagName !== "SL-BADGE") return;

  const filterInput = /** @type {HTMLInputElement} */ ($(".filter"));
  if (tagEl.getAttribute("variant") === "neutral") {
    for (const tag of $$(".tags sl-badge")) {
      tag.setAttribute("variant", "neutral");
      tag.setAttribute("aria-pressed", "false");
    }
    tagEl.setAttribute("variant", "primary");
    tagEl.setAttribute("aria-pressed", "true");
    const text = `[${tagEl.textContent}]`;
    filterInput.value = text;
    setFilter(text);
  } else {
    tagEl.setAttribute("variant", "neutral");
    tagEl.setAttribute("aria-pressed", "true");
    filterInput.value = "";
    setFilter('');
  }
});
/** @type {Set<string>} */
const tagsSet = new Set();
/** @param {string} text */
function maybeAddTag(text) {
  const tagText = text.match(/\[(\w+)\]/)?.[1];
  if (!tagText) return;
  if (tagsSet.has(tagText)) return;

  tagsSet.add(tagText);
  const tag = cloneTemplate(".badge", { textContent: tagText });
  tagsContainer.append(tag);
}

/** @param {CliInput} cliInput */
function getLogEl({ input, date }) {
  const logEl = cloneTemplate(".log", { innerHTML: highlightText(input) });
  maybeAddTag(input);
  logEl.setAttribute(
    "data-date",
    new Date(date).toLocaleDateString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
  );

  const shouldDisplay = input.includes(filterText);
  logEl.style.display = shouldDisplay ? "" : "none";
  if (shouldDisplay) filterItemsCount++;

  return logEl;
}
/** @param {Element[]} logEls */
async function appendLog(...logEls) {
  const lastElement = /** @type {Element} */ (logContainer.lastChild);
  const shouldScrollDown = lastElement
    ? await isInView(lastElement, logContainer)
    : false;

  logContainer.append(...logEls);
  if (shouldScrollDown) {
    lastElement.scrollIntoView();
  } else if (!lastElement) {
    logContainer.lastElementChild.scrollIntoView();
  }
}

{
  // apply filters
  const filterInput = /** @type {HTMLInputElement} */ ($(".filter"));
  filterInput.addEventListener("input", () => {
    const filter = filterInput.value;
    for (const logEl of $$(".container .log")) {
      logEl.style.display = logEl.textContent.includes(filter) ? "" : "none";
    }
    setFilter(filter);
  });
}

const cliSource = new EventSource("/cli-input");
/** @param {Event & { data: string }} event */
cliSource.onmessage = async (event) => {
  const data = JSON.parse(event.data);

  if (Array.isArray(data)) {
    /** @type {CliInput[]} */
    const newLogs = data;

    logs.push(...newLogs);
    $(".log-count .total").textContent = `(${logs.length})`;

    await appendLog(...newLogs.map((log) => getLogEl(log)));
    return;
  }

  console.log("unknown data received", data);
};
