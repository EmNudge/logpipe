# Logpipe

## Usage

```sh
$ some-other-program | logpipe

> server running on http://localhost:8080
```

It runs a web server which you can use to inspect all logs from your program.

## Motivation

When dealing with various codebases in development, you'll come across perhaps hundreds of logs per minute. Some of these are supposed to be useful. 
As it's just sending out unstructured text, it can be hard to find what you want. Furthermore, it often lacks syntax highlighting. It is hard to know where one log ends and another starts.

In contrast, something like your browser's dev console allows filtering, highlighting, and inspection of "unstructured" logs. The goal is to supercharge this to be used for any system that outputs any kind of logs.

## Behavior

This is a tool meant primarily for development. Therefore, the intention is to value assistance over correctness.

This allows us the following interesting features:
- **Logpipe** will syntax highlight logs that previously had no syntax highlighting.
- It will automatically apply tags to logs for you to search over.
- It will attempt to group logs together that seem related (based on indentation or language grammar)

It also allows us to live-filter logs while retaining the log state - something already present in most log inspection tools.

## Development

```sh
nodemon --exec 'node out.js | node index.mjs' -e ts,html,js,mjs
```