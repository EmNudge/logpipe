# Logpipe ![logpipe logo][logo]

*Get clarity on development logs*

<video src="https://github.com/EmNudge/logpipe/assets/24513691/59a1772a-2e5d-4129-aaa2-470dea297aee"></video>

Checkout [the docs][docs] or see it in action in [this online demo][demo]!

## Installation

There is no build step in this codebase, so you can install it directly from git if you want.

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

`logpipe` parameters:
- `--port <number>`
  - Choose a specific port (instead of random). Useful for command runners like `nodemon`.
- `--title <some text>`
  - Title for the page. Useful if you have multiple `logpipe`s open at once.


### Redirecting Stderr

Many programs will output their logs to `stderr` instead of `stdout`. If `logpipe` is not capturing anything and you still see output in your terminal, this is probably what's happening.

You can use bash redirection to fix this.

```sh
my-program 2>&1 | logpipe # note the "2>&1"
```

Check out [the docs](https://logpipe.dev/guide/shell-redirection.html#shell-redirection) for more info on shell redirection.

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

## Advanced Usage, Alternative Tools, Contribution Guide, etc

A lot of info has been moved to [the docs][docs]. Here are some quick links:

- [Alternatives](https://logpipe.emnudge.dev/guide/alternatives.html)
- [Shell Redirection](https://logpipe.emnudge.dev/guide/shell-redirection.html)
- [Filtering](https://logpipe.emnudge.dev/guide/filtering.html)
- [Contribution Guide](https://logpipe.emnudge.dev/guide/contribution-guide.html)

<!----->
[logo]: https://github.com/EmNudge/logpipe/assets/24513691/8526ba7d-e8a1-460a-8fad-60c488b5b15e
[demo]: https://logpipe.pages.dev
[docs]: https://logpipe.dev

