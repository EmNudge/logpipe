import { $ } from "./lib.js";

const logContainer = $(".container");
const contextMenu = $(".contextmenu");

/** @type {HTMLElement | undefined} */
let selectedLog;

/** @param {HTMLElement} logEl @param {number} x @param {number} y */
const openContextMenu = (logEl, x, y) => {
  closeContextMenu();
  contextMenu.classList.add("show");
  contextMenu.style.setProperty("--x", String(x));
  contextMenu.style.setProperty("--y", String(y));
  selectedLog = logEl;
  selectedLog.classList.add("selected");
};
const closeContextMenu = () => {
  contextMenu.classList.remove("show");
  selectedLog?.classList.remove("selected");
  selectedLog = undefined;
};

document.addEventListener("click", (e) => {
  console.log(e.target);
  if (!contextMenu.contains(e.target)) {
    closeContextMenu();
  }
});

contextMenu.addEventListener("sl-select", async (e) => {
  /** @type {'copy-log' | 'copy-id' | 'copy-date' | 'jump'} */
  const action = e.detail.item.value;

  if (!selectedLog) {
    throw new Error(`could not perform action ${action} on undefined element`);
  }

  if (action === "copy-log") {
    const text = selectedLog.textContent;
    await navigator.clipboard.writeText(text);
  } else if (action === "copy-date") {
    const { date } = selectedLog.dataset;
    await navigator.clipboard.writeText(date);
  } else if (action === "copy-id") {
    const { id } = selectedLog.dataset;
    await navigator.clipboard.writeText(id);
  } else {
    const { id } = selectedLog.dataset;
    console.log("attempt to jump to", id);
  }

  contextMenu.classList.remove("show");
});

logContainer.addEventListener("contextmenu", (e) => {
  // ignore any modifiers to allow browser-native debugging
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

  const logEl = (() => {
    let el = e.target;
    while (el instanceof HTMLSpanElement) {
      el = el.parentElement;
    }

    return /** @type {HTMLElement} */ (el);
  })();
  if (!logEl.classList.contains("log")) return;

  e.preventDefault();
  openContextMenu(logEl, e.clientX, e.clientY);
});
