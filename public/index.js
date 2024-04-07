import { h, render } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
import { signal, effect } from "https://esm.sh/@preact/signals";
import { highlightText } from "./lib.js";

const html = htm.bind(h);

const logsSig = signal([]);
const filterSig = signal('');
effect(() => console.log('filterSig', filterSig.value));

function App() {
  return html`
    <input
      type="text"
      class="filter"
      placeholder="filter..."
      onInput=${(e) => (filterSig.value = e.currentTarget.value)}
    />
    ${filterSig.value}
    <div class="container" tab-index="0">
      ${logsSig.value.map((log) => html`<${LogHolder} text="${log}" />`)}
    </div>
  `;
}

function LogHolder({ text }) {
  console.log(text);
  return html`<div class="log">${highlightText(text)}</div> `;
}

render(html`<${App} />`, document.querySelector("#app"));

const cliSource = new EventSource("/cli-input");
cliSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (Array.isArray(data)) {
    logsSig.value = [...logsSig.value, ...data];
    return;
  }
  console.log("unknown data received", data);
};
