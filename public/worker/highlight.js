/** @typedef {import('../../types.d.ts').ElementObject} ElementObject */

/**
 * @param {string} name
 * @param {Record<string, string>} properties
 * @returns {ElementObject}
 */
const getEl = (name, properties) => ({ name, ...properties });

/**
 * @param {string} className
 * @param {string} textContent
 * @param {Record<string, string>} properties
 */
const getSpan = (className, textContent = "", properties = {}) => {
  return getEl("span", { className, textContent, ...properties });
};

const VARIATION_SELECTOR_100 = String.fromCodePoint(917843);

/**
 * @param {string} text text to transform
 * @param {(...el: ElementObject[]) => string} getReplacement function for inserting replacements.
 * @param {boolean} stripAnsiEscape
 * @returns {string} html
 */
function replaceAnsi(text, getReplacement, stripAnsiEscape) {
  if (stripAnsiEscape) {
    return text.replace(/\x1B(?:]8;;|\\|\[(?:\d+|;)+?m)/g, '');
  }

  const withReplacedLinks = text
    // replace links (yes, these exist)
    .replace(/\x1B]8;;(.+?)\x1B\\(.+?)\x1B]8;;\x1B\\/g, (_, link, text) => {
      return getReplacement(
        getEl("a", { className: "url", href: link, textContent: text })
      );
    });

  /** @type {string[]} */
  const ansiClassNames = [];
  return withReplacedLinks
    .replace(
      /\x1B\[((?:\d+|;)+?)m([^\x1B]+)/g,
      (_, /** @type {string} */ numbers, /** @type {string} */ text) => {
        if (numbers === "0") {
          ansiClassNames.length = 0;
          return text;
        }

        if (numbers.startsWith("38;5")) {
          const ansiColor = Number(numbers.split(";").slice(-1)[0]);
          const colors = [
            "black",
            "red",
            "green",
            "yellow",
            "blue",
            "magenta",
            "cyan",
            "white",
            "gray",
            "red",
            "brightgreen",
            "yellow",
            "dodgerblue",
            "pink",
            "aqua",
            "white",
          ];

          const className = colors[ansiColor]
            ? `ansi-${colors[ansiColor]}`
            : `ansi-256-foreground-${ansiColor}`;
          ansiClassNames.push(className);
          return getReplacement(getSpan(ansiClassNames.join(" "), text));
        }

        const styles = numbers
          .split(";")
          .map((code) => {
            if (code === "1") return "bold";
            if (code === "2") return "dim";
            if (code === "3") return "italic";
            if (code === "4") return "underline";
            if (code === "5") return "blink";
            return code;
          })
          .map((name) => `ansi-${name}`);
        ansiClassNames.push(...styles);

        return getReplacement(getSpan(ansiClassNames.join(" "), text));
      }
    )
    .replace(/\x1B\[0m/g, "");
}

/**
 * @param {string} text text to transform
 * @param {(...el: ElementObject[]) => string} getReplacement function for inserting replacements.
 * @returns {string} html
 */
function replaceURLs(text, getReplacement) {
  return text.replace(
    // Lord forgive me, for I have sinned
    /\b(https?:)\/\/(\w+(?:\.\w+)*)(:\d+)?((?:\/[\w\.]+)*\/?)((?:\?(?:&?\w+=\w+)*))?/gi,
    (_, protocol, host, port, path, params) => {
      const urlContainer = getSpan("url");
      urlContainer.children = [];
      urlContainer.children.push(
        getSpan("url-protocol", protocol),
        "//",
        getSpan("url-host", host)
      );
      for (const [key, value] of Object.entries({ port, path, params })) {
        if (!value) continue;
        urlContainer.children.push(getSpan(`url-${key}`, value));
      }

      return getReplacement(urlContainer);
    }
  );
}

/**
 * Highlights some text based off of various heuristics.
 * Returns html as a string
 *
 * @param {string} text text to transform
 * @param {(...els: ElementObject[]) => string} getReplacement function for inserting replacements.
 * @returns {string} html
 */
function replaceDate(text, getReplacement) {
  return (
    text
      .replace(/\b\d+[-\/]\d+[-\/]\d+ \d+:\d+:\d+(?:[.,]\d+)?/g, (m) => {
        return getReplacement(getSpan("date", m));
      })
      // parse ISO date
      .replace(/\S+/g, (m) => {
        const dateObj = new Date(m);
        if (Number.isNaN(dateObj.valueOf())) {
          return m;
        }
        if (dateObj.toISOString() === m) {
          return getReplacement(getSpan("date", m));
        }

        return m;
      })
  );
}

/**
 * @param {string} text text to transform
 * @param {(...els: ElementObject[]) => string} getReplacement function for inserting replacements.
 * @returns {string} html
 */
function replacePath(text, getReplacement) {
  return text
    .replace(/(\/?(?:[\w.-]+\/)+)(\S+)/g, (_, folder, file) => {
      return getReplacement(getSpan("path", folder), getSpan("file", file));
    })
    .replace(/[\w-]+\.[a-zA-Z]+(?::(?:\d+|\(\d+,\d+\)))?/g, (m) => {
      return getReplacement(getSpan("file", m));
    });
}

/**
 * @param {string} text text to transform
 * @param {(...els: ElementObject[]) => string} getReplacement function for inserting replacements.
 * @returns {string} html
 */
function replaceTags(text, getReplacement) {
  return text
    .replace(/^info\b|^warn\b|^error\b|^debug\b|^trace\b/i, (m) => {
      return getReplacement(getSpan("tag", m));
    })
    .replace(/\[\w+(?:\(\w+\))?\]/g, (m) => {
      // don't parse numbers and IPs as tags
      if (/\[[\d\.:]+\]/.test(m)) return m;
      return getReplacement(getSpan("tag", m));
    });
}

/**
 * Highlights some text based off of various heuristics.
 * Returns html as a string
 *
 * @param {string} text
 * @param {boolean} stripAnsiEscape
 * @returns {(string | ElementObject)[]} html
 */
export function getHighlightObjects(text, stripAnsiEscape = true) {
  /** @type {Map<string, (ElementObject | string)[]>} */
  const map = new Map();
  let ident = 0;
  const getIdent = () =>
    `${VARIATION_SELECTOR_100}${ident++}${VARIATION_SELECTOR_100}`;
  /** @param {(ElementObject | string)[]} el */
  const getReplacement = (...el) => {
    const placeholder = getIdent();
    map.set(placeholder, el);
    return placeholder;
  };

  // Remove specific invisible character we will be using for regex replacing
  let modified = text.replace(new RegExp(VARIATION_SELECTOR_100, "g"), "");
  modified = replaceAnsi(text, getReplacement, stripAnsiEscape);
  modified = replaceURLs(modified, getReplacement);
  modified = replaceDate(modified, getReplacement);
  modified = replacePath(modified, getReplacement);
  modified = replaceTags(modified, getReplacement);

  modified = modified
    // parse key=value pairs
    .replace(/(\S+?)=(\S+)/g, (_, key, value) => {
      return getReplacement(
        getSpan("key", key),
        "=",
        getSpan("value", value)
      );
    })
    // parse IP addrs
    .replace(/\b\d+\.\d+\.\d+\.\d+\b/g, (m) => {
      return getReplacement(getSpan("ip", m));
    })
    // parse quoted strings
    .replace(/"(?:\\"|[^"])*?"|'(?:\\'|[^'])*?'/g, (m) => {
      return getReplacement(getSpan("string", m));
    })
    // parse time
    .replace(/(?:\d+(\.\d+)?(?:h|ms?|s))+/g, (m) => {
      return getReplacement(getSpan("time", m));
    })
    // parse numbers
    .replace(
      new RegExp(
        String.raw`(?:${VARIATION_SELECTOR_100})?\b(?:-|\+)?\d+(?:\.\d+)?\b`,
        "g"
      ),
      (m) => {
        if (m.startsWith(VARIATION_SELECTOR_100)) return m;
        return getReplacement(getSpan("number", m));
      }
    )
    .replace(/\b(?:GET|POST|PUT|PATCH|DELETE)\b/g, (m) => {
      return getReplacement(
        getSpan("http-method http-method-" + m.toLowerCase(), m)
      );
    })
    // parse keywords
    .replace(/\b(?:true|false|null|undefined)\b/gi, (m) => {
      return getReplacement(getSpan("keyword", m));
    })
    // parse errors
    .replace(/\b(?:error|fail(?:ure|ed))\b/gi, (m) => {
      return getReplacement(getSpan("error", m));
    });

  if (!modified) return [];

  return modified
    .match(
      new RegExp(
        `${VARIATION_SELECTOR_100}\\d+${VARIATION_SELECTOR_100}|[^${VARIATION_SELECTOR_100}]+`,
        "g"
      )
    )
    .flatMap(
      /** @returns {(ElementObject | string)[]} */ (str) => {
        if (!str.startsWith(VARIATION_SELECTOR_100)) return [str];
        return map.get(str);
      }
    );
}
