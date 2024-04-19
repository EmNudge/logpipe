import { $, downloadResource, toggleParsingAnsi } from "../lib.js";
import { reAddAllLogs } from "../log-adder.js";

const commandPaletteEl =
  /** @type {HTMLElement & { [key: string]: () => Promise<void> }} */ (
    $("sl-dialog.command-palette")
  );

const palletFormEl = $(".palette-form");
const menuEl = $(".palette-form .menu");

/** @param {HTMLElement} newSelection */
const changeSelection = (newSelection) => {
  const selectedEl = menuEl.querySelector('[aria-selected="true"]');
  selectedEl.setAttribute("aria-selected", "false");

  newSelection.setAttribute("aria-selected", "true");
  newSelection.scrollIntoView();
};

/** @param {string} key */
const moveSelection = (key) => {
  if (key !== "ArrowDown" && key !== "ArrowUp") return;

  const selectedEl = menuEl.querySelector('[aria-selected="true"]');
  const els = [...menuEl.querySelectorAll('[role="menuitem"]')].filter(
    (el) => el.getAttribute("aria-hidden") !== "true"
  );
  if (els.length < 2) return;

  const index = [...els].indexOf(selectedEl);
  if (key === "ArrowDown") {
    const nextEl = els[(index + 1) % els.length];
    changeSelection(/** @type {HTMLElement} **/ (nextEl));
  } else {
    const nextEl = els[(els.length + index - 1) % els.length];
    changeSelection(/** @type {HTMLElement} **/ (nextEl));
  }
};

menuEl.addEventListener("click", (e) => {
  if (!(e.target instanceof HTMLElement)) return;
  if (e.target.getAttribute("role") !== "menuitem") return;

  changeSelection(e.target);
  const submitEvent = new FormDataEvent("submit", { formData: new FormData() });
  palletFormEl.dispatchEvent(submitEvent);
});

/** @param {Element} formEl @param {string} title */
const showForm = (formEl, title = "Command Palette") => {
  for (const form of commandPaletteEl.querySelectorAll("form")) {
    form.classList.add("hide");
  }
  formEl.classList.remove("hide");
  commandPaletteEl.setAttribute("label", title);

  if (commandPaletteEl.open) {
    // @ts-ignore
    formEl.querySelector("sl-input, sl-button")?.focus();
  }
};

const rootFormEl = commandPaletteEl.querySelector("form.palette-form");
commandPaletteEl.addEventListener("sl-after-hide", () => {
  showForm(rootFormEl);
});

/** @type {HTMLInputElement} */
const inputEl = commandPaletteEl.querySelector("sl-input.palette-filter");

const setTitleFormEl = commandPaletteEl.querySelector("form.title-form");
setTitleFormEl.addEventListener("submit", (e) => {
  e.preventDefault();

  /** @type {HTMLInputElement} */
  const inputEl = setTitleFormEl.querySelector("sl-input");
  document.querySelector("main > h1").textContent = inputEl.value;
  document.title = inputEl.value;
  commandPaletteEl.hide();
});

const versionEl = commandPaletteEl.querySelector("span.about-version");
versionEl.textContent = $("meta[name=version]").getAttribute("content");
const aboutFormEl = commandPaletteEl.querySelector("form.about-menu");
aboutFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  commandPaletteEl.hide();
});

const helpFormEl = commandPaletteEl.querySelector("form.help-menu");
helpFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  commandPaletteEl.hide();
});

document.body.addEventListener("keydown", (e) => {
  if (e.key !== "k") return;

  if ((navigator.userAgent.includes(" Mac") && e.metaKey) || e.ctrlKey) {
    commandPaletteEl.show();
    e.preventDefault();
  }
});

inputEl.addEventListener("input", () => {
  const filterText = inputEl.value;

  /** @type {HTMLElement} */
  let firstVisible;

  for (const menuItem of menuEl.querySelectorAll('[role="menuitem"]')) {
    if (menuItem.textContent.toLowerCase().includes(filterText)) {
      menuItem.removeAttribute("aria-hidden");
      // @ts-ignore
      if (!firstVisible) firstVisible = menuItem;
    } else {
      menuItem.setAttribute("aria-hidden", "true");
    }
  }

  if (firstVisible) {
    changeSelection(firstVisible);
  }
});
inputEl.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

  moveSelection(e.key);
});

const containerEl = $("div.container");
const mainEl = $("main");
const tagsDialogEl = $(".tags-dialog");
function toggleExpandTerminal() {
  containerEl.classList.toggle("expand");
  mainEl.classList.toggle("expand");
  tagsDialogEl.classList.toggle("expand");

  commandPaletteEl.hide();
}

palletFormEl.addEventListener("submit", (e) => {
  e.preventDefault();

  const menuItemEl = menuEl.querySelector('[aria-selected="true"]');
  if (menuItemEl.getAttribute("aria-hidden") === "true") return;

  /** @typedef {import('../../types.d.ts').CommandPaletteAction} ActionType */
  const action = /** @type {ActionType} */ (menuItemEl.getAttribute("value"));

  if (action === "set-title") {
    showForm(setTitleFormEl, "Set Title");
  } else if (action === "expand") {
    toggleExpandTerminal();
  } else if (action === "theme") {
    $("html").classList.toggle("sl-theme-dark");
    $("html").classList.toggle("sl-theme-light");
    commandPaletteEl.hide();
  } else if (action === "ansi") {
    toggleParsingAnsi();
    // TODO: only re-highlight if it contains ANSI
    reAddAllLogs();
    commandPaletteEl.hide();
  } else if (action === "save") {
    downloadResource("/_/logs", "logs");
    commandPaletteEl.hide();
  } else if (action === "about") {
    showForm(aboutFormEl, "About");
  } else if (action === "help") {
    showForm(helpFormEl, "Help Menu");
  }
});

const cmdPlatteHint = $(".command-palette-hint");
cmdPlatteHint.classList.remove("hide");
$("h1").insertAdjacentElement("afterend", cmdPlatteHint);

if (!navigator.userAgent.includes(" Mac")) {
  cmdPlatteHint.querySelector(".modifier").textContent = "Ctrl";
}
