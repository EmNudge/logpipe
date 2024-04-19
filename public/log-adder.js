import { applyFilter } from "./filter.js";
import { $, cloneTemplate, highlightText } from "./lib.js";
import { maybeAddTag } from "./tags.js";

/** @typedef {import('../types.d.ts').CliInput} CliInput */

/** @type {CliInput[]} */
const logs = [];

const logContainer = $(".container");

/** @param {CliInput} cliInput */
async function getLogEl({ input, date, id }) {
  const logEl = cloneTemplate(".log");
  const elements = await highlightText(input);
  logEl.append(...elements);
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
  const lastElement = logContainer.lastElementChild;

  const shouldScrollDown = (() => {
    if (!lastElement) return false;
    const logBottom = lastElement?.getBoundingClientRect().bottom;
    const parentBottom = logContainer.getBoundingClientRect().bottom;

    return Math.abs(parentBottom - logBottom) < 10;
  })();

  logContainer.append(...logEls);
  if (shouldScrollDown) {
    lastElement.scrollIntoView();
  }
}

/** @param {CliInput[]} newLogs */
export async function addLogs(newLogs) {
  logs.push(...newLogs);
  $(".log-count .total").textContent = `(${logs.length})`;

  const logEls = await Promise.all(newLogs.map((log) => getLogEl(log)));
  await appendLog(...logEls);
}

export async function reAddAllLogs() {
  logContainer.innerHTML = '';
  const logEls = await Promise.all(logs.map((log) => getLogEl(log)));
  await appendLog(...logEls);
}