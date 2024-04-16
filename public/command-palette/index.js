import { toggleAnsiParsing } from "../highlight.js";
import { $, downloadResource } from "../lib.js";

/** @type {Element & { [key: string]: () => Promise<void> }} */
const commandPaletteEl = document.querySelector("sl-dialog.command-palette");

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

commandPaletteEl.addEventListener("sl-after-hide", () => {
  showForm(rootFormEl);
});

/** @type {HTMLInputElement} */
const inputEl = commandPaletteEl.querySelector("sl-input.palette-filter");
/** @type {HTMLElement & { [key: string]: () => Promise<void> }} */
const listEl = commandPaletteEl.querySelector("sl-menu");

const rootFormEl = commandPaletteEl.querySelector("form.palette-form");
rootFormEl.addEventListener("submit", (e) => {
  e.preventDefault();

  for (const menuItem of listEl.querySelectorAll("sl-menu-item")) {
    if (menuItem.classList.contains("hide")) continue;

    listEl.dispatchEvent(
      new CustomEvent("sl-select", { detail: { item: menuItem } })
    );
    break;
  }
});

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
  if (e.key === "k" && e.metaKey) {
    commandPaletteEl.show();
  }
});

inputEl.addEventListener("input", () => {
  const filterText = inputEl.value;
  for (const menuItem of listEl.querySelectorAll("sl-menu-item")) {
    const shouldDisplay = menuItem.textContent
      .toLowerCase()
      .includes(filterText);
    // @ts-ignore
    menuItem.style.display = shouldDisplay ? "" : "none";
  }
});
inputEl.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

  const items = [...listEl.querySelectorAll("sl-menu-item")];
  if (e.key === "ArrowUp") items.reverse();

  for (const menuItem of items) {
    if (menuItem.classList.contains("hide")) continue;
    // @ts-ignore
    menuItem.focus();
    return;
  }
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

listEl.addEventListener(
  "sl-select",
  (/** @type {Event & { detail: any }} e */ e) => {
    /** @type {'set-title' | 'expand' | 'theme' | 'ansi' | 'save' | 'about' | 'help'} */
    const action = e.detail.item.value;

    if (action === "set-title") {
      showForm(setTitleFormEl, "Set Title");
    } else if (action === "expand") {
      toggleExpandTerminal();
    } else if (action === "theme") {
      $("html").classList.toggle("sl-theme-dark");
      $("html").classList.toggle("sl-theme-light");
      commandPaletteEl.hide();
    } else if (action === "ansi") {
      toggleAnsiParsing();
      commandPaletteEl.hide();
    } else if (action === "save") {
      downloadResource("/_/logs", "logs");
      commandPaletteEl.hide();
    } else if (action === "about") {
      showForm(aboutFormEl, "About");
    } else if (action === "help") {
      showForm(helpFormEl, "Help Menu");
    }
  }
);
