import { highlightText } from "./highlight.js";
import { $, cloneTemplate, isInView } from "./lib.js";
import { applyFilter } from "./filter.js";
import { maybeAddTag } from "./tags.js";
import './contextmenu.js';
import './command-palette.js';

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

  applyFilter(logEl);

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

const cliSource = new EventSource("/_/cli-input");
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
