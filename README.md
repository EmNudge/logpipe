# Logpipe

> Get clarity on development logs

https://github.com/EmNudge/logpipe/assets/24513691/0115d249-0fa3-4e4a-9a38-68a45fd854c6

## Installation

```sh
npm i -g https://github.com/EmNudge/logpipe.git
```

## Usage

```sh
$ some-other-program | logpipe

> server running on http://localhost:7381
```

Then go to the URL and inspect away!

It takes an optional `--port` parameter if you'd like to specify a port which can be helpful if you're using it together with a command runner like `nodemon`.

## Motivation

When dealing with various codebases in development, you'll come across perhaps hundreds of logs per minute. Some of these are supposed to be useful. 
As it's just sending out unstructured text, it can be hard to find what you want. Furthermore, it often lacks syntax highlighting. It is hard to know where one log ends and another starts.

In contrast, something like your browser's dev console allows filtering, highlighting, and inspection of "unstructured" logs. The goal is to supercharge this to be used for any system that outputs any kind of logs.

## Behavior

This is a tool meant primarily for development. Therefore, the intention is to value assistance over correctness.

This allows us the following interesting features:
- **Logpipe** will syntax highlight logs that previously had no syntax highlighting.
- It will automatically apply tags to logs for you to search over.
- It will attempt to group logs that seem related (based on indentation or language grammar)

It also allows us to live-filter logs while retaining the log state - something already present in most log inspection tools.

## Development

It has been helpful to use something like `nodemon` during development to automatically restart the server when the code changes.

There is a file called `out.js` which is purely used to simulate logs like in a regular application.

`out.js` parameters:
- `--delay <number>`
  - delay in milliseconds between each log
- `--iterations <number>`
  - number of iterations to run (default Infinity)

```sh
nodemon --exec 'node out.js | node index.mjs -p 7280' -e ts,html,js,mjs,css
```
