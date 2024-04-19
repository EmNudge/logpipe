import { getHighlightObjects } from "./highlight.js";

/** @typedef {import('../../types.d.ts').HighlightWorkerRequest} Payload */

self.addEventListener("message", (/** @type {MessageEvent<Payload>} */ e) => {
  const { input, stripAnsiEscape, id } = e.data;
  const highlighted = getHighlightObjects(input, stripAnsiEscape);
  self.postMessage({ nodes: highlighted, id });
});
