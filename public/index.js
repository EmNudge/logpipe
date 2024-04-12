import { highlightText } from "./highlight.js";
import { $, $$, cloneTemplate, isInView } from "./lib.js";
import { applyFilter, setFilter } from "./filter.js";
import './contextmenu.js';

/** @typedef {{ input: string, date: number, id: string }} CliInput */

/** @type {CliInput[]} */
const logs = [];

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
    filterInput.value = tagEl.textContent;
    setFilter(tagEl.textContent);
  } else {
    tagEl.setAttribute("variant", "neutral");
    tagEl.setAttribute("aria-pressed", "true");
    filterInput.value = "";
    setFilter("");
  }
});

/** @type {Set<string>} */
const tagsSet = new Set();
/** @param {HTMLElement} logEl */
function maybeAddTag(logEl) {
  const newTags = [...logEl.querySelectorAll(".tag")]
    .map((el) => el.textContent)
    .filter((tag) => !tagsSet.has(tag));

  for (const tagText of newTags) {
    tagsSet.add(tagText);
    const tag = cloneTemplate(".badge", { textContent: tagText });
    tagsContainer.append(tag);
  }
}

/** @param {CliInput} cliInput */
function getLogEl({ input, date, id }) {
  const logEl = cloneTemplate(".log");
  logEl.append(...highlightText(input));
  maybeAddTag(logEl);

  logEl.setAttribute("data-id", id);
  logEl.setAttribute(
    "data-date",
    new Date(date).toLocaleDateString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
  );

  applyFilter(input, logEl);

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
    logContainer.lastElementChild?.scrollIntoView();
  }
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
