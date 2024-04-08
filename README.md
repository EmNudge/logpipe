# Logpipe

> Get clarity on development logs

https://github.com/EmNudge/logpipe/assets/24513691/0115d249-0fa3-4e4a-9a38-68a45fd854c6

## Installation

```sh
npm i -g https://github.com/EmNudge/logpipe.git
```

## Usage

> [!CAUTION]
> `logpipe` is a tool for inspecting development logs for <ins>a tool you trust</ins>. It uses a lot of `.innerHTML` from input taken directly out of your terminal.
>
> This is ripe for an **XSS attack or code-injection** with a trivial amount of effort.
>
> I will hopefully address this in the future, but it is not an immediate concern due to the context of its use.


```sh
$ some-other-program | logpipe

> server running on http://localhost:7381
```

Then go to the URL and inspect away!

`logpipe` parameters:
- `--port <number>`
  - Choose a specific port (instead of random). Useful for command runners like `nodemon`.
- `--title <some text>`
  - Title for the page. Useful if you have multiple `logpipe`s open at once.


### Redirecting Stderr

Many programs will output their logs to stderr instead of stdout. If `logpipe` is not capturing anything and you still see output in your terminal, this is probably what's happening.

You can use bash redirection to fix this.

```sh
my-program  2>&1 | logpipe # note the "2>&1"
```

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
