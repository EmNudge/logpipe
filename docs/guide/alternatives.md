# Alternatives

The primary goal of logpipe is to <ins>**simplify viewing and searching real-time development logs**</ins>. 

If this is not your exact use-case, you may be better served by other tools.

## CLI Programs

For a CLI-specific alternative, I quite like [tailspin](https://github.com/bensadeh/tailspin). Its goals are aligned with this project and it's a great install if you want to keep your input in the terminal. It evolves from programs like [ccze](https://github.com/cornet/ccze)

It doesn't have advanced searching, chunking, or any of the advantages web UIs bring, but it's still really helpful if you're SSHing or just don't want to bother with the web.

For viewing structured logs in the CLI, check out [klp](https://github.com/dloss/klp) or [lnav](https://github.com/tstack/lnav). 

## Web UIs

Web UIs are going to be the easiest for chunking and filtering logs. 

[logscreen](https://github.com/soorajshankar/logScreen) and [logdy](https://logdy.dev/) both exist in this category, but neither applies syntax highlighting nor function well with unstructured logs.

Logpipe seems to exist solely in this niche of "live web ui view on unstructured logs with automatic syntax highlighting". If you find another tool that fits into this category, file an issue and I'll add it to this section.
