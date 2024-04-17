# Quickstart

![logo](/logo.png)

## Installation

There is no build step, so you can install it directly from git or the npm package at `@emnudge/logpipe`.

```sh
npm i -g https://github.com/EmNudge/logpipe.git
# or
npm i -g @emnudge/logpipe
```

## Usage

```sh
$ my-program | logpipe

> server running on http://localhost:7381
```

Then go to the URL and inspect away!

If output is still being logged in the terminal, but not in the web ui, you may want to redirect `stderr`. For more info on this, read [Shell Redirection](/guide/shell-redirection#redirecting-stderr).

### Optional Parameters

- `--port <number>` or `-p <number>`
   - Choose a specific port (instead of random). Useful for command runners like nodemon.
- `--title "<text>"` or `-t "<text>"`
  - Title for the page. Useful if you have multiple "logpipe"s open at once.
- `--help` or `-h`
  - Display this list of commands.
- `--version` or `-v`
  - Display the current version.

## Local Demo

To demo logpipe locally when you can't find an input source, you can try the included `out.js` file.

```sh
node out.js | node index.mjs
```

### Optional Parameters

- `--delay <number>` or `-d <number>`
  - delay in milliseconds between each log
- `--iterations <number>` or `-i <number>`
  - number of iterations to run (default Infinity)

