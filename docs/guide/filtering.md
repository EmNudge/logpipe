# Filtering

Logpipe tries its best to be simple and intuitive. There is no advanced initial setup.

You may want some more power when searching, however.

## Simple Filtering

<kbd>/</kbd> focuses the input.

Regular text searches are not case sensitive.

To view the context of a log you see in a search, right-click it and select "Jump to location".

![](//jump_to_location.webp)

## Automatic Tag Detection

"Tags" are automatically detected from input and given a corresponding pill in the upper-right of your search box.

![](/tags_list.png)

Clicking these will search for this specific tag by filling your input with the corresponding [syntax query](#Syntax-Query-Language).

Tags are matched by finding any text inside of `[]` brackets or finding keywords like `Warn`, `Info`, or `Debug` at the start of a log. This is usually good enough, but might not match every use case. 

If you find a common-format not matched or one matched when it shouldn't, please file an issue.

## Syntax Query Language

We re-use the same syntax-highlighting engine for advanced searching. The queries take the form:

```md
@@<type>
@@<type>=<string_match>

@@<type>,<or_type2>,<or_type3>
@@<type> @<and_type2>

@@<type>=<string_match>,<or_type2>,<or_type3> @<and_type2>
```

Where `<type>` is some predefined syntax highlight class name and `<string_match>` is some string in quotes.

Here is an example query for finding messages with an error tag and a local ip:

```rs
@@ip="192.0.0.1" @@tag="[Error]"
```

And here is one where we look for any message that includes a string <ins>or</ins> a number, but also a URL:
```rs
@@string,url @@url
```