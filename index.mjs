#!/usr/bin/env node

import http from "http";
import fs from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";

/** @type {string[]} */
const lines = [];
/** @type {Set<(lines: string[], newLine: string) => void>} */
const notifiers = new Set();
process.stdin.on("data", (data) => {
  const newLine = data.toString();
  lines.push(newLine);

  for (const func of notifiers) {
    func(lines, newLine);
  }
});

process.stdin.on("close", () => {
  console.log("\x1b[31mInput has ended.\x1b[0m");
  console.log("Use Ctrl+C to close the web server.");
});

/** @param {string} path */
const getMimeTypeForFile = (path) => {
  const ext = path.split(".").slice(-1)[0];

  /** @type {string} */
  const mimeType = {
    js: "text/javascript",
    css: "text/css",
    html: "text/html",
    png: "image/png",
    jpg: "image/jpg",
    jpeg: "image/jpeg",
    ico: "image/x-icon",
    svg: "image/svg+xml",
    json: "application/json",
  }[ext];
  return mimeType ?? "text/plain";
};

const PUBLIC_DIR = join(fileURLToPath(import.meta.url), "..", "public");

const server = http
  .createServer(async (req, res) => {
    if (req.url === "/cli-input") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      });

      res.write(`data: ${JSON.stringify(lines)}\n\n`);
      notifiers.add((lines, newLine) => {
        res.write(`data: ${JSON.stringify([newLine])}\n\n`);
      });
      return;
    }

    // node js read local directory files into an array
    const files = new Set(await fs.readdir(PUBLIC_DIR));

    if (files.has(req.url.slice(1))) {
      res.writeHead(200, { "Content-Type": getMimeTypeForFile(req.url) });
      res.write(await fs.readFile(join(PUBLIC_DIR, req.url.slice(1))));
      res.end();
      return;
    } else if (req.url == "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(await fs.readFile(join(PUBLIC_DIR, "index.html")));
      res.end();
      return;
    }

    res.writeHead(404, { "Content-Type": "text/html" });
    res.write("Resource not found");
    res.end();
  })
  .listen(0);

const address = `http://localhost:${server.address().port}`;
console.log(`\nLogs are displayed on \x1b[32;1;4m${address}\x1b[0m\n`);
