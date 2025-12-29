# Contribution Guide

Logpipe is a fun project with some weird restrictions! Some arbitrary, some necessary.

Firstly, logpipe does not use any fancy web framework. It's built with [Shoelace](https://shoelace.style/) web components with everything else in vanilla JS, CSS, and HTML.

The backend doesn't even use a web server package! We use the native Node.js `http` module and manually do our own [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

**Why?**

I wanted this project to be transparent. There are no hidden dependencies you need to be afraid of. The structure should be obvious. It should be quick to run. There should be no build step between you see and the code you run.

This brings with it some difficulties in making clean code, however.

## Automatic Reloading In Logpipe

It has been helpful to use something like [nodemon](https://nodemon.io/) during development to automatically restart the server when the code changes.

```sh
nodemon --exec 'node out.js | node index.mjs -p 7280' -e ts,html,js,mjs,css
```

## Project Structure

The entrypoint to our application is our `index.mjs` node file. It's called `.mjs` because we want to run it as a module instead of with CommonJS.

Here is an overview of the directory:

```yaml
index.mjs # the script run when you call "logpipe"
out.js # script for generating example data

public/ # all files you see in the browser
  index.html # web entrypoint
  index.js # js entrypoint
  style.css # main styles
  # ...some other files
  command-palette/ # command palette feature
  context-menu/ # context menu feature
```

## Routing

We're not running something like [express](https://expressjs.com/), so all of our routing is done manually.

Any `/` route will try to be matched with an equivalent file from the `public` folder.

Routes under `/_/` are API routs, such as `/_/cli-input` which is where we stream the CLI input or `/_/logs` which returns all logs as JSON.

## HTML Based Components

This is a single-page app, so those folders you see in the public folder are not meant to be routed to directly.

They are "components" in that they're pieces of our application we've separated out for clarity. They are single-use, however. We won't be injecting them multiple times.

Let's take `command-palette` for example.

It's a complex feature with its associated functionality (JS), styles (CSS), and UI (HTML). Inside of the `public/command-palette/index.html` file you'll find what looks like

```html
<body>
  <link rel="stylesheet" href="./style.css">
  <script type="module" src="./index.js"></script>
  
  <sl-dialog>
    <!-- some other html here -->
  </sl-dialog>
</body>
```

The HTML file imports the local script and styles. This is all vanilla - no fancy framework going on.

In our JS entrypoint (`public/index.js`), we make a call to `loadHtmlComponent('command-palette')` which will do, in this order:

1. Fetch the html file for that folder
1. Inline the content in the current page
1. Manually import all script tags from this new HTML

The new HTML blob will import its associated styles correctly, but the script tags will be blocked by the browser. That's why we need to import them manually.

## Highlighting

Our highlighting is currently done in-browser with a series of regex. 

Is this fast? Probably not. It's fast enough, but massive pages will have some difficulty.

Luckily, we parse the logs as they arrive, so we're only paying this penalty over time. We don't re-parse the logs on searches. We just use HTML's `.textContent` and use `display: none` to hide search results. This is usually fast enough.


