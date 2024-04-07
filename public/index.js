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
const isInView = (logEl) => {
  return new Promise(res => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        res(true);
      }
    }, { root: logContainer });
    observer.observe(logEl);
    setTimeout(() => {
      res(false)
    }, 5);
  })
};


/** @param {string} logStr */
async function appendLog(logStr) {
  const logEl = cloneTemplate(".log");
  logEl.innerHTML = highlightText(logStr);
  applyVisibility(logEl, filterSig.value);

  if (logContainer.lastChild) {
    isInView(logContainer.lastChild).then(inView => {
      if (inView) {
        logContainer.append(logEl);
        logContainer.lastChild.scrollIntoView();
        return;
      }
    });
  }
  logContainer.append(logEl);
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

effect(() => {
  $('.log-count').textContent = `(${logsSig.value.length})`;
})

const cliSource = new EventSource("/cli-input");
cliSource.onmessage = async (event) => {
  const data = JSON.parse(event.data);
  if (Array.isArray(data)) {
    logsSig.value = [...logsSig.value, ...data];
    for (const log of data) {
      await appendLog(log);
    }
    return;
  }
  console.log("unknown data received", data);
};
