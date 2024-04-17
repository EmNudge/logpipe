# Shell Redirection


## Redirecting Stderr

Many programs will output their logs to `stderr` instead of `stdout`. If logpipe is not capturing anything and you still see output in your terminal, this is probably what's happening.

You can use bash redirection to fix this.

```sh
my-program 2>&1 | logpipe # note the "2>&1"
# In modern terminals, this can be shortened to:
my-program |& logpipe
```

## Preserving Logs

Logpipe will swallow all your logs to keep a cleaner shell. While you can keep your logs later by saving them through the command palette, it is not recommended to rely on this. 

If you know you'll want to preserve your logs, you should instead use something like `tee`.

```sh
# saves all logs into saved_logs.txt
my-program |& tee saved_logs.txt | logpipe
```
## Bash Multi-Redirection

Using `|&` allows you to combine stderr into stdout. You may want to separate these 2 into separate streams.

To do this, the syntax is a bit different. 

```sh
my-program > >(logpipe -t "stdout") 2> >(logpipe -t "stderr")
# or just pipe the stdout portion as normal
my-program 2> >(logpipe -t "stderr") | logpipe -t "stdout"
```

the `-t "string"` parts are optional, but useful if you want to tell these 2 apart.
