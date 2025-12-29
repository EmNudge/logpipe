# Command Palette

Command palettes are great! Logpipe ships with one.

## How To Open

Just use <kbd>Cmd</kbd> + <kbd>k</kbd>. 

I'm not sure why, but most web tools seemed to have standardized on this one.

Here are a list of the options and what they do.


## Set Title

You can set the title from the command line with the `--title` argument, but it's probably not worth restarting the server just to change the title.

Use this to change the title of your tab and page. Useful for if you have multiple logpipe instances open.

## Toggle Terminal Expand

You may encounter some UI issues that stem from the small size of the displayed terminal. The size is intentional, but you can increase it with this command.

## Toggle ANSI Parsing

By default we parse ANSI escapes to create the syntax highlighting you're familiar with on the terminal. 

This is usually a safe bet, but sometimes people are really bad at choosing colors. An entire message will be in bright blue. If we turn off ANSI parsing, we'll let our own syntax highlighting engine redo their handy-work.

## Toggle Theme

If your browser is currently using light mode, but you want logpipe to be in dark mode, this will help with that.

It unfortunately does not preserve your choice (for now), so this needs to be done manually each time.

## Expand Terminal

The default size might be a bit small for some people. This size was chosen on purpose, but you can expand the sizing of many panes with this feature. It's a toggle, so it can be reverted just as easily.

## Save Logs

Download the current logs as a JSON file.

In the future you'll be able to restart a session using this file. For now, use something like [jq](https://jqlang.github.io/jq/) to get what you need.

## Help Menu

Forgot something? This might help.

It includes a few common questions and their answers.