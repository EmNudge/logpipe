#!/usr/bin/env node

import http from "http";
import fs from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";

/** @typedef {{ input: string, date: number, id: string }} CliInput */

/** @type {CliInput[]} */
const lines = [];

/** @type {Set<(lines: CliInput[], newLines: CliInput[]) => void>} */
const notifiers = new Set();

process.stdin.on("data", (data) => {
  /** @type {string} */
  const input = data.toString();
  const date = Date.now();
  const id = String(lines.length);

  /** @type {CliInput[]} */
  const newLines = [];
  let prevWhitespace = 0;
  for (const line of input.trim().split("\n")) {
    const curWhitespace = line.match(/^\s+/)?.[0].length;
    if ((curWhitespace > prevWhitespace || line === "}") && newLines.length) {
      const { input } = newLines.pop();
      newLines.push({ input: [input, line].join("\n"), date, id });
    } else {
      newLines.push({ input: line, date, id });
    }
  }

  lines.push(...newLines);

  for (const func of notifiers) {
    func(lines, newLines);
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

const port = (() => {
  const args = process.argv.slice(2).join(" ");
  const match = args.match(/--port\s+(\d+)/) ?? args.match(/-p\s*(\d+)/);
  return match ? Number(match[1]) : 0;
})();
const title = (() => {
  const args = process.argv.slice(2).join(" ");
  const match = args.match(/--title\s+([\w ]+)/) ?? args.match(/-t\s*([\w ]+)/);
  return match ? match[1] : "CLI Input";
})();

// user asked for CLI help
if (/--help| -h/.test(process.argv.slice(2).join(" "))) {
  console.log("Usage: logpipe [--port PORT] [--title TITLE]");
  console.log("");
  console.log("Options:");
  console.log("  --port PORT  The port to run the web server on.");
  console.log("  --title TITLE  The title of the web page.");
  console.log("");
  console.log("Examples:");
  console.log('  your-program | logpipe --port 8080 --title "My CLI Input"');
  console.log('  your-program | logpipe -p 8080 -t "My CLI Input"');
  console.log("  your-program | logpipe");
  console.log("");
  process.exit();
}

const PUBLIC_DIR = join(fileURLToPath(import.meta.url), "..", "public");

const server = http
  .createServer(async (req, res) => {
    if (req.method !== "GET") return;

    if (req.url === "/_/cli-input") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      });

      res.write(`data: ${JSON.stringify(lines)}\n\n`);
      notifiers.add((_lines, newLines) => {
        res.write(`data: ${JSON.stringify(newLines)}\n\n`);
      });
      return;
    }

    // We could directly write to FS, but we shouldn't trust the user to specify download location information correctly. 
    // This means we'd need a lot of error handling. It's easier to let the browser handle file downloads.
    if (req.url === "/_/logs" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(lines));
      res.end();
      return;
    }

    // node js read local directory files into an array
    const files = new Set(await fs.readdir(PUBLIC_DIR));

    if (req.url == "/" || req.url == "/index.html") {
      res.writeHead(200, {
        "Content-Type": "text/html",
        "X-Custom-Title": title,
      });
      /** @type {string} */
      const site = (await fs.readFile(join(PUBLIC_DIR, "index.html"), "utf8"))
        .replace(/<title>.+?<\/title>/g, `<title>${title}</title>`)
        .replace(/<h1>.+?<\/h1>/g, `<h1>${title}</h1>`);
      res.write(site);
      res.end();
      return;
    } else if (files.has(req.url.slice(1))) {
      res.writeHead(200, { "Content-Type": getMimeTypeForFile(req.url) });
      res.write(await fs.readFile(join(PUBLIC_DIR, req.url.slice(1))));
      res.end();
      return;
    }

    res.writeHead(404, { "Content-Type": "text/html" });
    res.write("Resource not found");
    res.end();
  })
  .listen(port);

if (!server.address() && port) {
  console.error("\nServer could not bind to port", port);
  console.log(
    "Specify a different port or allow the server to choose a random port."
  );
  process.exit(1);
}

const address = `http://localhost:${server.address().port}`;
console.log(`\nLogs are displayed on \x1b[32;1;4m${address}\x1b[0m\n`);
