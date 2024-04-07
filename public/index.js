import { $, $$, cloneTemplate, effect, highlightText, signal } from "./lib.js";

const logsSig = signal(/**@type {string[]}*/ ([]));
const filterSig = signal("");

const logContainer = $(".container");
/** @param {Element} logEl @returns {Promise<boolean>} */
const isInView = (logEl) => {
  return new Promise((res) => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          res(true);
        }
      },
      { root: logContainer }
    );
    observer.observe(logEl);
    setTimeout(() => {
      res(false);
    }, 5);
  });
};

/** @param {string} logStr */
function getLogEl(logStr) {
  console.log({ logStr })
  const logEl = cloneTemplate(".log");
  logEl.innerHTML = highlightText(logStr);
  logEl.style.display = logStr.includes(filterSig.value) ? "" : "none";
  return logEl;
}
/** @param {Element[]} logEls */
async function appendLog(...logEls) {
  const shouldScrollDown = logContainer.lastChild
    ? await isInView(logContainer.lastChild)
    : false;

  logContainer.append(...logEls);
  if (shouldScrollDown) {
    logContainer.lastChild.scrollIntoView();
  }
}

{
  // apply filters
  const filterInput = $(".filter");
  filterInput.addEventListener("input", (event) => {
    const filter = event.target.value;
    for (const logEl of $$(".container .log")) {
      logEl.style.display = logEl.textContent.includes(filter) ? "" : "none";
    }
    filterSig.value = filter;
  });
}

effect(() => {
  $(".log-count").textContent = `(${logsSig.value.length})`;
});

const cliSource = new EventSource("/cli-input");
cliSource.onmessage = async (event) => {
  const data = JSON.parse(event.data);
  if (Array.isArray(data)) {
    logsSig.value = [...logsSig.value, ...data];
    await appendLog(...data.map((log) => getLogEl(log)));
    return;
  }
  console.log("unknown data received", data);
};
