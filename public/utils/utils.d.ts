import { CliInput } from "../../types.js";

/**
 * Highlighted log with extracted metadata
 */
export interface HighlightedLog {
  /** Highlighted DOM elements */
  elements: Node[];
  /** Extracted tag class names and values */
  tags: string[];
  /** Raw text content for searching */
  textContent: string;
}

/**
 * LogStore manages the data layer for logs, separate from the DOM.
 * Handles caching of highlighted logs and filtering indices.
 */
export interface LogStore {
  /** All logs */
  logs: CliInput[];
  /** Indices of logs that match current filter (null = no filter) */
  filtered: number[] | null;
  /** Filter function */
  filterFn: ((highlighted: HighlightedLog) => boolean) | null;
  /** Cache of highlighted logs by id */
  highlighted: Map<string, HighlightedLog>;
  /** Maximum cache size */
  maxCacheSize: number;
}

/**
 * HeightCache interface for efficient height calculations
 */
export interface HeightCache {
  estimatedHeight: number;
  heights: Map<number, number>;
  prefixSums: number[];
  dirty: boolean;
  count: number;
  getHeight(index: number): number;
  setHeight(index: number, height: number): void;
  hasMeasurement(index: number): boolean;
  rebuild(itemCount: number): void;
  getOffset(index: number): number;
  getTotalHeight(): number;
  findIndexAtOffset(offset: number): number;
  clear(): void;
  clearExcept(indicesToKeep: Set<number>): void;
}

/**
 * VirtualScroller manages rendering only visible log items
 * Provides smooth scrolling performance regardless of total log count
 */
export interface VirtualScroller {
  /** The scroll container */
  container: HTMLElement;
  /** The data store */
  store: LogStore;
  /** Estimated height per item */
  estimatedHeight: number;
  /** Number of items to render outside viewport */
  buffer: number;
  /** Scroll debounce in ms */
  debounceMs: number;
  /** Height cache for O(1) offset lookups */
  heightCache: HeightCache;
  /** Active DOM nodes by visual index */
  activeNodes: Map<number, HTMLElement>;
  /** Pool of reusable DOM nodes */
  recyclePool: HTMLElement[];
  /** Start index of visible range */
  startIndex: number;
  /** End index of visible range */
  endIndex: number;
  /** Pending updates for batching */
  pendingLogs: CliInput[];
  /** Whether an update is scheduled */
  updateScheduled: boolean;
  /** Scroll debounce timeout */
  scrollTimeout: number | null;
  /** Accumulated scroll compensation to prevent jank */
  pendingScrollCompensation: number;
  /** Top spacer element */
  topSpacer: HTMLElement;
  /** Bottom spacer element */
  bottomSpacer: HTMLElement;
  /** Viewport element */
  viewport: HTMLElement;
  /** ResizeObserver for container resize handling */
  resizeObserver: ResizeObserver | null;
  /** Scroll event handler reference for cleanup */
  scrollHandler: (() => void) | null;
}
