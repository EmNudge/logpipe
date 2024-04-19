import { getHighlightObjects } from "./highlight.js";

/** @typedef {{ input: string, stripAnsiEscape: boolean, id: string }} Payload */
/** @typedef {{ nodes: any[], id: string }} */
self.addEventListener("message", (/** @type {MessageEvent<Payload>} */ e) => {
  const { input, stripAnsiEscape, id } = e.data;
  const highlighted = getHighlightObjects(input, stripAnsiEscape);
  self.postMessage({ nodes: highlighted, id });
});
