import { $, $$, cloneTemplate, effect, highlightText, isInView, signal } from "./lib.js";

/** @typedef {{ input: string, date: number }} CliInput */

const logsSig = signal(/**@type {CliInput[]}*/ ([]));
const filterSig = signal("");

const logContainer = $(".container");

/** @param {CliInput} cliInput */
function getLogEl({ input, date }) {
  const logEl = cloneTemplate(".log");
  logEl.innerHTML = highlightText(input);
  logEl.setAttribute(
    "data-date",
    new Date(date).toLocaleDateString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
  );
  logEl.style.display = input.includes(filterSig.value) ? "" : "none";

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
  }
}

{
  // apply filters
  const filterInput = /** @type {HTMLInputElement} */ ($(".filter"));
  filterInput.addEventListener("input", (event) => {
    const filter = filterInput.value;
    for (const logEl of $$(".container .log")) {
      logEl.style.display = logEl.textContent.includes(filter) ? "" : "none";
    }
    filterSig.value = filter;
  });
}

const cliSource = new EventSource("/cli-input");
/** @param {Event & { data: string }} event */
cliSource.onmessage = async (event) => {
  const data = JSON.parse(event.data);
  
  if (Array.isArray(data)) {
    /** @type {CliInput[]} */
    const logs = data;
    logsSig.value = [...logsSig.value, ...logs];
    await appendLog(...logs.map((log) => getLogEl(log)));
    $(".log-count").textContent = `(${logsSig.value.length})`;

    return;
  }
  
  console.log("unknown data received", data);
};
