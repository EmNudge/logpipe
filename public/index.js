import { $, $$, cloneTemplate, effect, highlightText, signal } from "./lib.js";

const logsSig = signal(/**@type {string[]}*/ ([]));
const filterSig = signal("");

/** 
 * @param {HTMLElement} element 
 * @param {string} filter
 */
const applyVisibility = (element, filter) => {
  if (element.textContent.includes(filter)) {
    element.style.display = "";
  } else {
    element.style.display = "none";
  }
};


const logContainer = $(".container");
/** @param {string} logStr */
function appendLog(logStr) {
  const logEl = cloneTemplate(".log");
  logEl.innerHTML = highlightText(logStr);
  applyVisibility(logEl, filterSig.value);
  logContainer.prepend(logEl);
}

{ // apply filters
  const filterInput = $("input.filter");
  filterInput.addEventListener("input", (event) => {
    const filter = event.target.value;
    for (const logEl of $$(".container .log")) {
      applyVisibility(logEl, filter);
    }
    filterSig.value = filter;
  });
}

const cliSource = new EventSource("/cli-input");
cliSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (Array.isArray(data)) {
    logsSig.value = [...logsSig.value, ...data];
    for (const log of data) {
      appendLog(log);
    }
    return;
  }
  console.log("unknown data received", data);
};
