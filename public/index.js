import { $, $$, cloneTemplate, effect, highlightText, signal } from "./lib.js";

const logsSig = signal(/**@type {string[]}*/ ([]));
const filterSig = signal("");

/** @param {HTMLElement} element */
const applyVisibility = (element) => {
  const filter = filterSig.value;
  if (element.textContent.includes(filter)) {
    element.style.display = "";
  } else {
    element.style.display = "none";
  }
};

const logContainer = $(".container");
effect(() => {
  const logs = logsSig.value;
  logContainer.innerHTML = "";
  for (const log of logs) {
    const logEl = cloneTemplate(".log");
    logEl.innerHTML = highlightText(log);
    applyVisibility(logEl);
    logContainer.appendChild(logEl);
  }
});

$("input.filter").addEventListener("input", (event) => {
  filterSig.value = event.target.value;
});
effect(() => {
  for (const logEl of $$(".container .log")) {
    applyVisibility(logEl);
  }
});

const cliSource = new EventSource("/cli-input");
cliSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (Array.isArray(data)) {
    logsSig.value = [...logsSig.value, ...data];
    return;
  }
  console.log("unknown data received", data);
};
