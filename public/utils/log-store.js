import { highlightText, stripAnsiEscape } from "./lib.js";

/** @typedef {import('../../types.d.ts').CliInput} CliInput */
/** @typedef {import('./utils.d.ts').HighlightedLog} HighlightedLog */
/** @typedef {import('./utils.d.ts').LogStore} LogStore */

/**
 * Extract tag information from highlighted elements
 * Tags are <span> elements with class names like "tag", "error", "number", etc.
 * We extract both the class name and the text content
 * @param {Node[]} elements
 * @returns {string[]} Array of "classname:textvalue" strings
 */
function extractTags(elements) {
  const tags = [];

  /**
   * Recursively traverse nodes to find span elements with classes
   * @param {Node[]} nodes
   */
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node instanceof HTMLElement) {
        // Extract all class names from this element
        if (node.tagName === 'SPAN' && node.className) {
          const classes = node.className.split(' ');
          for (const className of classes) {
            // Store as "classname:textcontent" for easier matching
            tags.push(`${className}:${node.textContent}`);
          }
        }

        // Recurse into children
        if (node.children.length > 0) {
          traverse([...node.children]);
        }
      }
    }
  };

  traverse(elements);
  return tags;
}

/**
 * Cache a highlighted log with FIFO eviction
 * @param {LogStore} store
 * @param {string} id
 * @param {HighlightedLog} result
 */
function cacheHighlighted(store, id, result) {
  // Simple FIFO eviction (could be improved to true LRU)
  if (store.highlighted.size >= store.maxCacheSize) {
    const firstKey = store.highlighted.keys().next().value;
    store.highlighted.delete(firstKey);
  }
  store.highlighted.set(id, result);
}

/**
 * Get or fetch highlighted version of a log
 * @param {LogStore} store
 * @param {string} id - Log ID
 * @returns {Promise<HighlightedLog>}
 */
export async function getHighlighted(store, id) {
  // Check cache
  if (store.highlighted.has(id)) {
    return store.highlighted.get(id);
  }

  // Find log by ID
  const log = store.logs.find(l => l.id === id);
  if (!log) {
    throw new Error(`Log with id ${id} not found`);
  }

  // Highlight via Web Worker
  const elements = await highlightText(log.input, stripAnsiEscape);

  // Extract metadata
  const tags = extractTags(elements);
  const textContent = log.input;

  const result = { elements, tags, textContent };
  cacheHighlighted(store, id, result);

  return result;
}

/**
 * Add new logs to the store
 * @param {LogStore} store
 * @param {CliInput[]} newLogs
 */
export async function addLogs(store, newLogs) {
  const startIndex = store.logs.length;
  store.logs.push(...newLogs);

  // If filter is active, check new logs against filter and add matching indices
  if (store.filtered !== null && store.filterFn !== null) {
    for (let i = 0; i < newLogs.length; i++) {
      const log = newLogs[i];
      const highlighted = await getHighlighted(store, log.id);

      if (store.filterFn(highlighted)) {
        store.filtered.push(startIndex + i);
      }
    }
  }
}

/**
 * Get log at visual index (accounting for filter)
 * @param {LogStore} store
 * @param {number} visualIndex
 * @returns {CliInput}
 */
export function getLogAt(store, visualIndex) {
  if (store.filtered === null) {
    return store.logs[visualIndex];
  }
  const actualIndex = store.filtered[visualIndex];
  return store.logs[actualIndex];
}

/**
 * Get total number of visible logs (filtered or all)
 * @param {LogStore} store
 * @returns {number}
 */
export function getVisibleCount(store) {
  return store.filtered === null ? store.logs.length : store.filtered.length;
}

/**
 * Clear the current filter
 * @param {LogStore} store
 */
export function clearFilter(store) {
  store.filtered = null;
  store.filterFn = null;
}

/**
 * Set filtered indices and filter function
 * @param {LogStore} store
 * @param {number[]} indices
 * @param {((highlighted: HighlightedLog) => boolean) | null} filterFn
 */
export function setFiltered(store, indices, filterFn = null) {
  store.filtered = indices;
  store.filterFn = filterFn;
}

/**
 * Create a new LogStore
 * LogStore manages the data layer for logs, separate from the DOM.
 * Handles caching of highlighted logs and filtering indices.
 * @returns {LogStore}
 */
export function createLogStore() {
  return {
    logs: [],
    filtered: null,
    filterFn: null,
    highlighted: new Map(),
    maxCacheSize: 10000,
  };
}
