import { highlightText } from "./highlight.js";

self.addEventListener('message', (e) => {
  const highlighted = highlightText(e.data, true)
  self.postMessage(highlighted);
})