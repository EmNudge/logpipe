import { $ } from "./utils/lib.js";
import { createLogStore } from "./utils/log-store.js";
import { createVirtualScroller, addLogs as addLogsToScroller, rerender } from "./utils/virtual-scroller.js";

/** @typedef {import('../types.d.ts').CliInput} CliInput */

const logContainer = $(".container");

// Create data store and virtual scroller
const store = createLogStore();
const scroller = createVirtualScroller(logContainer, store, {
  estimatedHeight: 30,
  buffer: 5,
  debounceMs: 16,
});

/** @param {CliInput[]} newLogs */
export async function addLogs(newLogs) {
  await addLogsToScroller(scroller, newLogs);
  $(".log-count .total").textContent = `(${store.logs.length})`;
}

export async function reAddAllLogs() {
  await rerender(scroller);
}

// Export store and scroller for use in other modules
export { store, scroller };