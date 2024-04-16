# Command Palette

Command palettes are great! Logpipe ships with one.

## How To Open

Just use <kbd>Cmd</kbd> + <kbd>k</kbd>. 

I'm not sure why, but most web tools seemed to have standardized on this one.

## Features

At present there are only 2 features. Rest assured, this section will expand.

### Set Title

You can set the title from the command line with the `--title` argument, but it's probably not worth restarting the server just to change the title.

Use this to change the title of your tab and page. Useful for if you have multiple logpipe instances open.

### Expand Terminal

The default size might be a bit small for some people. This size was chosen on purpose, but you can expand the sizing of many panes with this feature. It's a toggle, so it can be reverted just as easily.

### Save Logs

Download the current logs as a JSON file.

In the future you'll be able to restart a session using this file. For now, use something like [jq](https://jqlang.github.io/jq/) to get what you need.

### Help Menu

Forgot something? This might help.

It includes a few common questions and their answers.