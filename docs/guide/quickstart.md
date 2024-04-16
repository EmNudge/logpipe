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
$ some-other-program | logpipe

> server running on http://localhost:7381
```

Then go to the URL and inspect away!

### Optional Parameters

- `--port <number>` or `-p <number>`
   - Choose a specific port (instead of random). Useful for command runners like nodemon.
- `--title "<text>"` or `-t "<text>"`
  - Title for the page. Useful if you have multiple "logpipe"s open at once.
- `--help` or `-h`
  - Display this list of commands.
- `--version` or `-v`
  - Display the current version.

## Shell Redirection

### Redirecting Stderr

Many programs will output their logs to stderr instead of stdout. If logpipe is not capturing anything and you still see output in your terminal, this is probably what's happening.

You can use bash redirection to fix this.

```sh
my-program 2>&1 | logpipe # note the "2>&1"
# In modern terminals, this can be shortened to:
my-program |& logpipe
```

### Bash Multi-Redirection

Using `|&` allows you to combine stderr into stdout. You may want to separate these 2 into separate streams.

To do this, the syntax is a bit different. 

```sh
my-program > >(logpipe -t "stdout") 2> >(logpipe -t "stderr")
# or just pipe the stdout portion as normal
my-program 2> >(logpipe -t "stderr") | logpipe -t "stdout"
```

the `-t "string"` parts are optional, but useful if you want to tell these 2 apart.

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

