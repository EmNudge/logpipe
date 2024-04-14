import { setFilter } from "../filter.js";
import { $ } from "../lib.js";

const logContainer = $(".container");
const contextMenu = $(".contextmenu");

const copyNotifEl =
  /** @type {HTMLElement & { [key: string]: () => Promise<void> }} */ (
    $(".copy-notif")
  );

/** @param {string} text @param {string} desc */
const copyText = async (text, desc) => {
  await copyNotifEl.hide();
  copyNotifEl.querySelector(".copy-label").textContent = desc;

  await navigator.clipboard.writeText(text);
  copyNotifEl.toast();
};

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

document.addEventListener(
  "click",
  (/** @type {Event & { target: Element }} e */ e) => {
    if (!contextMenu.contains(e.target)) {
      closeContextMenu();
    }
  }
);

contextMenu.addEventListener(
  "sl-select",
  async (/** @type {Event & { detail: any }} e */ e) => {
    /** @type {'copy-log' | 'copy-id' | 'copy-date' | 'jump'} */
    const action = e.detail.item.value;

    if (!selectedLog) {
      throw new Error(
        `could not perform action ${action} on undefined element`
      );
    }

    if (action === "copy-log") {
      copyText(selectedLog.textContent, "log contents");
    } else if (action === "copy-date") {
      copyText(selectedLog.dataset.date, "log date");
    } else if (action === "copy-id") {
      copyText(selectedLog.dataset.id, "log ID");
    } else {
      setFilter('', true);
      selectedLog.scrollIntoView();
    }

    contextMenu.classList.remove("show");
  }
);

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
