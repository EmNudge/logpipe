import { h, render } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
import { signal, computed } from "https://esm.sh/@preact/signals";
import { highlightText } from "./lib.js";

const html = htm.bind(h);

const logsSig = signal([]);
const filterSig = signal('');
computed(() => console.log(logsSig.value));
computed(() => console.log(filterSig.value));

function App() {
  console.log(logsSig.value);

  return html`
    <input
      type="text"
      class="filter"
      placeholder="filter..."
      onClick=${(e) => (filterSig.value = e.currentTarget.value)}
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
  console.log("data received", data);
  if (Array.isArray(data)) {
    console.log("array", data);
    logsSig.value = [...logsSig.value, ...data];
    return;
  }
  console.log("unknown data received", data);
};
