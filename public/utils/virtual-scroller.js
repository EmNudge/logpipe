import { cloneTemplate } from "./lib.js";
import { maybeAddTag } from "../tags.js";
import { getVisibleCount, getLogAt, getHighlighted, addLogs as addLogsToStore } from "./log-store.js";

/** @typedef {import('../../types.d.ts').CliInput} CliInput */
/** @typedef {import('./utils.d.ts').LogStore} LogStore */
/** @typedef {import('./utils.d.ts').VirtualScroller} VirtualScroller */

/**
 * Efficient height cache using prefix sums for O(1) offset lookups
 * and O(log n) index finding via binary search
 */
class HeightCache {
  constructor(estimatedHeight) {
    this.estimatedHeight = estimatedHeight;
    /** @type {Map<number, number>} Individual heights */
    this.heights = new Map();
    /** @type {number[]} Prefix sums for fast offset calculation */
    this.prefixSums = [0];
    /** @type {boolean} Whether prefix sums need rebuilding */
    this.dirty = false;
    /** @type {number} Number of items in cache */
    this.count = 0;
  }

  /**
   * Get height for an item (measured or estimated)
   * @param {number} index
   * @returns {number}
   */
  getHeight(index) {
    return this.heights.get(index) ?? this.estimatedHeight;
  }

  /**
   * Set height for an item and mark cache as dirty
   * @param {number} index
   * @param {number} height
   */
  setHeight(index, height) {
    this.heights.set(index, height);
    this.dirty = true;
  }

  /**
   * Check if an item has been measured
   * @param {number} index
   * @returns {boolean}
   */
  hasMeasurement(index) {
    return this.heights.has(index);
  }

  /**
   * Rebuild prefix sums array - O(n) operation
   * @param {number} itemCount
   */
  rebuild(itemCount) {
    if (!this.dirty && this.count === itemCount) return;

    this.count = itemCount;
    this.prefixSums = [0];

    for (let i = 0; i < itemCount; i++) {
      this.prefixSums.push(this.prefixSums[i] + this.getHeight(i));
    }

    this.dirty = false;
  }

  /**
   * Get offset for a given index - O(1)
   * @param {number} index
   * @returns {number}
   */
  getOffset(index) {
    if (this.dirty || index >= this.prefixSums.length - 1) {
      // Fallback to manual calculation if cache is dirty
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += this.getHeight(i);
      }
      return offset;
    }
    return this.prefixSums[index];
  }

  /**
   * Get total height of all items - O(1)
   * @returns {number}
   */
  getTotalHeight() {
    if (this.dirty || this.prefixSums.length === 0) {
      let total = 0;
      for (let i = 0; i < this.count; i++) {
        total += this.getHeight(i);
      }
      return total;
    }
    return this.prefixSums[this.prefixSums.length - 1];
  }

  /**
   * Find index at given scroll offset using binary search - O(log n)
   * @param {number} offset
   * @returns {number}
   */
  findIndexAtOffset(offset) {
    if (this.dirty || this.prefixSums.length === 0) {
      // Fallback to linear search if cache is dirty
      let cumulative = 0;
      for (let i = 0; i < this.count; i++) {
        const height = this.getHeight(i);
        if (cumulative + height > offset) {
          return i;
        }
        cumulative += height;
      }
      return Math.max(0, this.count - 1);
    }

    // Binary search on prefix sums
    let left = 0;
    let right = this.prefixSums.length - 1;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.prefixSums[mid] <= offset) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    return Math.max(0, left - 1);
  }

  /**
   * Clear all measurements
   */
  clear() {
    this.heights.clear();
    this.prefixSums = [0];
    this.dirty = false;
    this.count = 0;
  }

  /**
   * Clear measurements and preserve only specific indices
   * @param {Set<number>} indicesToKeep
   */
  clearExcept(indicesToKeep) {
    const preserved = new Map();
    for (const index of indicesToKeep) {
      if (this.heights.has(index)) {
        preserved.set(index, this.heights.get(index));
      }
    }
    this.heights = preserved;
    this.dirty = true;
  }
}

/**
 * Clone elements from the highlight result
 * The elements from the store might be reused, so we need to clone them
 * @param {Node[]} elements
 * @returns {Node[]}
 */
function cloneElements(elements) {
  return elements.map(el => {
    if (typeof el === 'string') {
      return document.createTextNode(el);
    }

    if (el instanceof Text) {
      return document.createTextNode(el.textContent);
    }

    return el.cloneNode(true);
  });
}

/**
 * Get a node from the pool or create a new one
 * @param {VirtualScroller} scroller
 * @returns {HTMLElement}
 */
function getOrCreateNode(scroller) {
  if (scroller.recyclePool.length > 0) {
    return scroller.recyclePool.pop();
  }

  const node = cloneTemplate('.log');
  node.tabIndex = 0;
  return node;
}

/**
 * Measure actual height of a node and update cache
 * @param {VirtualScroller} scroller
 * @param {number} index
 * @param {HTMLElement} node
 */
function measureNode(scroller, index, node) {
  const wasPreviouslyMeasured = scroller.heightCache.hasMeasurement(index);
  const oldHeight = scroller.heightCache.getHeight(index);

  // Force layout by reading offsetHeight (forces browser to calculate layout)
  // This ensures getBoundingClientRect returns accurate values
  void node.offsetHeight;
  const newHeight = node.getBoundingClientRect().height;

  // Use device pixel ratio for more accurate threshold on high-DPI screens
  const threshold = (window.devicePixelRatio || 1) * 0.5;
  if (Math.abs(newHeight - oldHeight) < threshold) return;

  scroller.heightCache.setHeight(index, newHeight);

  // Compensate scroll ONLY for items above the viewport that were already measured
  // This prevents scroll jumps when existing items change height (e.g., line wrapping)
  if (wasPreviouslyMeasured && index < scroller.startIndex) {
    const diff = newHeight - oldHeight;
    // Schedule scroll compensation after current frame to avoid jank
    if (!scroller.pendingScrollCompensation) {
      scroller.pendingScrollCompensation = 0;
    }
    scroller.pendingScrollCompensation += diff;
  }
}

/**
 * Recycle nodes outside the visible range
 * @param {VirtualScroller} scroller
 * @param {number} newStart
 * @param {number} newEnd
 */
function recycleNodesOutsideRange(scroller, newStart, newEnd) {
  for (const [index, node] of scroller.activeNodes) {
    if (index < newStart || index >= newEnd) {
      scroller.activeNodes.delete(index);
      scroller.recyclePool.push(node);
      node.remove();
    }
  }
}

/**
 * Render a single item
 * @param {VirtualScroller} scroller
 * @param {number} index
 * @param {*} log
 * @param {*} highlighted
 */
function renderItem(scroller, index, log, highlighted) {
  const node = getOrCreateNode(scroller);

  // Clear and populate
  node.innerHTML = '';
  node.append(...cloneElements(highlighted.elements));

  // Add tags if present
  maybeAddTag(node);

  // Set attributes
  node.setAttribute('data-id', log.id);
  node.setAttribute('data-date', new Date(log.date).toLocaleDateString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }));

  scroller.activeNodes.set(index, node);
  scroller.viewport.append(node);

  // Measure height
  measureNode(scroller, index, node);
}

/**
 * Render a range of items with progressive rendering
 * Items render as highlights become available instead of waiting for all
 * @param {VirtualScroller} scroller
 * @param {number} start
 * @param {number} end
 */
async function renderRange(scroller, start, end) {
  const batch = [];
  const visibleCount = getVisibleCount(scroller.store);

  // Collect items that need rendering
  for (let i = start; i < end; i++) {
    if (scroller.activeNodes.has(i)) continue;

    // Safety check: don't render beyond visible count
    if (i >= visibleCount) continue;

    const log = getLogAt(scroller.store, i);

    // Safety check: skip if log is undefined
    if (!log) continue;

    batch.push({ index: i, log });
  }

  // Nothing to render
  if (batch.length === 0) return;

  // Progressive rendering: render items as highlights become available
  // This prevents blocking on slow highlight operations
  await Promise.all(
    batch.map(async ({ index, log }) => {
      const highlighted = await getHighlighted(scroller.store, log.id);
      renderItem(scroller, index, log, highlighted);
    })
  );
}

/**
 * Main render loop - calculates visible range and renders items
 * @param {VirtualScroller} scroller
 */
async function render(scroller) {
  const visibleCount = getVisibleCount(scroller.store);
  if (visibleCount === 0) {
    scroller.viewport.innerHTML = '';
    scroller.topSpacer.style.height = '0px';
    scroller.bottomSpacer.style.height = '0px';
    return;
  }

  // Rebuild prefix sums if needed (amortized O(1) when not dirty)
  scroller.heightCache.rebuild(visibleCount);

  const scrollTop = scroller.container.scrollTop;
  const viewportHeight = scroller.container.clientHeight;

  // Calculate visible range using O(log n) binary search
  const startIndex = Math.max(0,
    scroller.heightCache.findIndexAtOffset(scrollTop) - scroller.buffer
  );
  const endIndex = Math.min(visibleCount,
    scroller.heightCache.findIndexAtOffset(scrollTop + viewportHeight) + scroller.buffer + 1
  );

  // Update indices BEFORE rendering so measureNode uses correct reference
  scroller.startIndex = startIndex;
  scroller.endIndex = endIndex;

  // Reset scroll compensation accumulator
  scroller.pendingScrollCompensation = 0;

  // Recycle nodes outside visible range
  recycleNodesOutsideRange(scroller, startIndex, endIndex);

  // Render visible range (this will measure items and update cache)
  await renderRange(scroller, startIndex, endIndex);

  // CRITICAL: Rebuild cache after measuring to get accurate spacer heights
  scroller.heightCache.rebuild(visibleCount);

  // Update spacers with accurate heights AFTER measuring
  const topHeight = scroller.heightCache.getOffset(startIndex);
  const bottomHeight = scroller.heightCache.getTotalHeight() - scroller.heightCache.getOffset(endIndex);

  scroller.topSpacer.style.height = `${topHeight}px`;
  scroller.bottomSpacer.style.height = `${Math.max(0, bottomHeight)}px`;

  // Apply accumulated scroll compensation if needed
  if (scroller.pendingScrollCompensation !== 0) {
    scroller.container.scrollTop += scroller.pendingScrollCompensation;
    scroller.pendingScrollCompensation = 0;
  }
}

/**
 * Scroll to the bottom of the container
 * Iteratively renders and measures until we reach the actual bottom
 * @param {VirtualScroller} scroller
 */
export async function scrollToBottom(scroller) {
  // Cancel any pending scroll debounce
  clearTimeout(scroller.scrollTimeout);

  const visibleCount = getVisibleCount(scroller.store);
  if (visibleCount === 0) return;

  const viewportHeight = scroller.container.clientHeight;
  let previousScrollTop = -1;
  let iterations = 0;
  const maxIterations = 3; // Prevent infinite loops

  // Iterate until scroll position stabilizes or max iterations reached
  while (iterations < maxIterations && scroller.container.scrollTop !== previousScrollTop) {
    previousScrollTop = scroller.container.scrollTop;

    // Rebuild cache with current measurements
    scroller.heightCache.rebuild(visibleCount);

    // Calculate scroll position for bottom
    const totalHeight = scroller.heightCache.getTotalHeight();
    scroller.container.scrollTop = Math.max(0, totalHeight - viewportHeight);

    // Render at this position, which will measure any new items
    await render(scroller);

    iterations++;
  }
}

/**
 * Scroll to a specific index
 * @param {VirtualScroller} scroller
 * @param {number} index
 * @param {string} [align='start'] - 'start', 'center', or 'end'
 */
export async function scrollToIndex(scroller, index, align = 'start') {
  const visibleCount = getVisibleCount(scroller.store);
  if (index < 0 || index >= visibleCount) return;

  // Rebuild cache for accurate positioning
  scroller.heightCache.rebuild(visibleCount);

  const offset = scroller.heightCache.getOffset(index);
  const itemHeight = scroller.heightCache.getHeight(index);

  if (align === 'start') {
    scroller.container.scrollTop = offset;
  } else if (align === 'center') {
    scroller.container.scrollTop = offset - (scroller.container.clientHeight / 2) + (itemHeight / 2);
  } else if (align === 'end') {
    scroller.container.scrollTop = offset + itemHeight - scroller.container.clientHeight;
  }

  // Render immediately after scrolling
  await render(scroller);
}

/**
 * Get scroll anchor for preserving position during filter changes
 * @param {VirtualScroller} scroller
 * @returns {{id: string, offset: number} | null}
 */
export function getScrollAnchor(scroller) {
  const visibleCount = getVisibleCount(scroller.store);
  if (visibleCount === 0) return null;

  scroller.heightCache.rebuild(visibleCount);

  const scrollTop = scroller.container.scrollTop;
  const index = scroller.heightCache.findIndexAtOffset(scrollTop);
  const log = getLogAt(scroller.store, index);

  if (!log) return null;

  const offset = scrollTop - scroller.heightCache.getOffset(index);
  return { id: log.id, offset };
}

/**
 * Re-render everything (used when filter changes or toggling ANSI)
 * @param {VirtualScroller} scroller
 */
export async function rerender(scroller) {
  // Clear all measured heights since indices may have changed
  scroller.heightCache.clear();

  // CRITICAL: Clear ALL nodes from viewport to prevent stale content
  // We must remove nodes from DOM AND clear activeNodes map
  for (const node of scroller.activeNodes.values()) {
    scroller.recyclePool.push(node);
    node.remove();
  }
  scroller.activeNodes.clear();

  // CRITICAL: Empty the entire viewport to ensure no stale content
  scroller.viewport.innerHTML = '';

  // CRITICAL: Clamp scroll position to valid range
  // When filtering reduces item count, scroll position might be beyond the new end
  const visibleCount = getVisibleCount(scroller.store);

  if (visibleCount === 0) {
    scroller.container.scrollTop = 0;
    scroller.topSpacer.style.height = '0px';
    scroller.bottomSpacer.style.height = '0px';
    return;
  } else {
    // Build cache with estimates to get approximate total height
    scroller.heightCache.rebuild(visibleCount);
    const totalHeight = scroller.heightCache.getTotalHeight();
    const maxScroll = Math.max(0, totalHeight - scroller.container.clientHeight);

    // Clamp scroll position
    if (scroller.container.scrollTop > maxScroll) {
      scroller.container.scrollTop = maxScroll;
    }
  }

  // Render current viewport
  await render(scroller);
}

/**
 * Add new logs (batched with requestAnimationFrame)
 * @param {VirtualScroller} scroller
 * @param {CliInput[]} newLogs
 */
export async function addLogs(scroller, newLogs) {
  scroller.pendingLogs.push(...newLogs);

  if (!scroller.updateScheduled) {
    scroller.updateScheduled = true;
    requestAnimationFrame(async () => {
      // Get current state before adding logs
      const visibleCount = getVisibleCount(scroller.store);
      scroller.heightCache.rebuild(visibleCount);

      const scrollBottom = scroller.container.scrollTop + scroller.container.clientHeight;
      const totalHeight = scroller.heightCache.getTotalHeight();
      const wasAtBottom = Math.abs(totalHeight - scrollBottom) < 10;

      // Add logs to store
      const logsToAdd = scroller.pendingLogs;
      scroller.pendingLogs = [];
      scroller.updateScheduled = false;

      await addLogsToStore(scroller.store, logsToAdd);

      await render(scroller);

      if (wasAtBottom) {
        await scrollToBottom(scroller);
      }

      // Update filter count if filter is active
      if (scroller.store.filtered !== null) {
        // Dynamically import to avoid circular dependency
        const { updateFilterCount } = await import('./filter.js');
        updateFilterCount();
      }
    });
  }
}

/**
 * Create a new VirtualScroller
 * VirtualScroller manages rendering only visible log items
 * Provides smooth scrolling performance regardless of total log count
 * @param {HTMLElement} container - The scroll container
 * @param {LogStore} store - The data store
 * @param {Object} options - Configuration options
 * @param {number} [options.estimatedHeight=30] - Estimated height per item
 * @param {number} [options.buffer=5] - Number of items to render outside viewport
 * @param {number} [options.debounceMs=16] - Scroll debounce in ms (60fps)
 * @returns {VirtualScroller}
 */
export function createVirtualScroller(container, store, options = {}) {
  const estimatedHeight = options.estimatedHeight || 30;

  const scroller = {
    container,
    store,
    estimatedHeight,
    buffer: options.buffer || 5,
    debounceMs: options.debounceMs || 16,
    heightCache: new HeightCache(estimatedHeight),
    activeNodes: new Map(),
    recyclePool: [],
    startIndex: 0,
    endIndex: 0,
    pendingLogs: [],
    updateScheduled: false,
    scrollTimeout: null,
    pendingScrollCompensation: 0,
    topSpacer: null,
    bottomSpacer: null,
    viewport: null,
    resizeObserver: null,
    scrollHandler: null,
  };

  // Set up the virtual scroll DOM structure
  scroller.topSpacer = document.createElement('div');
  scroller.topSpacer.className = 'virtual-top-spacer';

  scroller.bottomSpacer = document.createElement('div');
  scroller.bottomSpacer.className = 'virtual-bottom-spacer';

  scroller.viewport = document.createElement('div');
  scroller.viewport.className = 'virtual-viewport';

  // Replace container content with virtual structure
  scroller.container.innerHTML = '';
  scroller.container.append(scroller.topSpacer, scroller.viewport, scroller.bottomSpacer);

  // Attach scroll event listener (stored for cleanup)
  scroller.scrollHandler = () => {
    clearTimeout(scroller.scrollTimeout);
    scroller.scrollTimeout = setTimeout(() => {
      render(scroller);
    }, scroller.debounceMs);
  };
  scroller.container.addEventListener('scroll', scroller.scrollHandler);

  // Observe container resize and invalidate heights
  scroller.resizeObserver = new ResizeObserver(() => {
    // Clear all measured heights since container width changed
    scroller.heightCache.clear();
    render(scroller);
  });
  scroller.resizeObserver.observe(scroller.container);

  return scroller;
}

/**
 * Destroy the VirtualScroller and clean up resources
 * @param {VirtualScroller} scroller
 */
export function destroyVirtualScroller(scroller) {
  // Remove event listeners
  if (scroller.scrollHandler) {
    scroller.container.removeEventListener('scroll', scroller.scrollHandler);
    scroller.scrollHandler = null;
  }

  // Disconnect resize observer
  if (scroller.resizeObserver) {
    scroller.resizeObserver.disconnect();
    scroller.resizeObserver = null;
  }

  // Clear timeouts
  clearTimeout(scroller.scrollTimeout);

  // Clear height cache
  scroller.heightCache.clear();

  // Clear all nodes
  for (const node of scroller.activeNodes.values()) {
    node.remove();
  }
  scroller.activeNodes.clear();
  scroller.recyclePool = [];

  // Clear pending logs
  scroller.pendingLogs = [];
  scroller.updateScheduled = false;
}
