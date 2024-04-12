/** @type {Element & { [key: string]: () => Promise<void> }} */
const commandPaletteEl = document.querySelector("sl-dialog.command-palette");

/** @param {Element} formEl @param {string} title */
const showForm = (formEl, title = "Command Palette") => {
  for (const form of commandPaletteEl.querySelectorAll("form")) {
    form.classList.add("hide");
  }
  formEl.classList.remove("hide");
  commandPaletteEl.setAttribute("label", title);
};

const closeCommandPalette = async () => {
  await commandPaletteEl.hide();
  showForm(rootFormEl);
};

/** @type {HTMLInputElement} */
const inputEl = commandPaletteEl.querySelector("sl-input.palette-filter");
/** @type {HTMLElement & { [key: string]: () => Promise<void> }} */
const listEl = commandPaletteEl.querySelector("sl-menu");

const rootFormEl = commandPaletteEl.querySelector("form.palette-form");
rootFormEl.addEventListener("submit", (e) => {
  e.preventDefault();

  for (const menuItem of listEl.querySelectorAll("sl-menu-item")) {
    if (menuItem.classList.contains("hide")) continue;

    listEl.dispatchEvent(new CustomEvent("sl-select", { detail: { item: menuItem } }));
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
  closeCommandPalette();
});

document.body.addEventListener("keydown", (e) => {
  if (e.key === "k" && e.metaKey) {
    commandPaletteEl.show();
  }
});

inputEl.addEventListener("input", () => {
  const filterText = inputEl.value;
  for (const menuItem of listEl.querySelectorAll('sl-menu-item')) {
    const shouldDisplay = menuItem.textContent.toLowerCase().includes(filterText);
    // @ts-ignore
    menuItem.style.display = shouldDisplay ? '' : 'none';
  }
});

listEl.addEventListener(
  "sl-select",
  (/** @type {Event & { detail: any }} e */ e) => {
    /** @type {'set-title'} */
    const action = e.detail.item.value;

    if (action === "set-title") {
      showForm(setTitleFormEl, "Set Title");
      /** @type {Element & { focus: () => Promise<void>}} */
      const formInputEl = setTitleFormEl.querySelector("sl-input");
      formInputEl.focus();
    }
  }
);
