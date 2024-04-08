/**
 * Highlights some text based off of various heuristics.
 * Returns html as a string
 *
 * @param {string} text text to transform
 * @param {(text: string) => string} getReplacement function for inserting replacements.
 * @returns {string} html
 */
function replaceAnsi(text, getReplacement) {
  let openingTags = 0;
  return text
    // replace links (yes, these exist)
    .replace(/\x1B]8;;(.+?)\x1B\\(.+?)\x1B]8;;\x1B\\/g, (_, link, text) => {
      return getReplacement(`<a href="${link}">${text}</a>`);
    })
    .replace(/\x1B\[((?:\d+|;)+?)m/g, (_, /** @type {string} */ num) => {
      if (num === "0") {
        const closingTags = "</span>".repeat(openingTags);
        openingTags = 0;
        return getReplacement(closingTags);
      }

      openingTags++;

      if (num.startsWith("38;5")) {
        const ansiColor = Number(num.split(";").slice(-1)[0]);
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
        if (colors[ansiColor]) {
          return getReplacement(`<span style="color: ${colors[ansiColor]}">`);
        }
        return getReplacement(
          `<span class="ansi-256-foreground-${ansiColor}">`
        );
      }

      const codes = num.split(";");
      const styles = codes
        .map((code) => {
          if (code === "1") return "bold";
          if (code === "2") return "dim";
          if (code === "3") return "italic";
          if (code === "4") return "underline";
          if (code === "5") return "blink";
          return code;
        })
        .map((name) => `ansi-${name}`);

      return getReplacement(`<span class="${styles.join(" ")}">`);
    });
}


/**
 * Highlights some text based off of various heuristics.
 * Returns html as a string
 *
 * @param {string} text
 * @returns {string} html
 */
export function highlightText(text) {
  const map = new Map();
  let ident = 0;
  const getIdent = () => `$${ident++};`;
  /** @param {string} text */
  const getReplacement = (text) => {
    const placeholder = getIdent();
    map.set(placeholder, text);
    return placeholder;
  };

  const modified = replaceAnsi(text, getReplacement)
    .replace(/\n( *)/g, (_, space) => {
      return getReplacement(
        space ? `<br><span style="white-space: pre">${space}</span>` : "<br>"
      );
    })
    // parse weird date format (from golang)
    .replace(/\d+\/\d+\/\d+ \d+:\d+:\d+[\.,]\d+/g, (m) => {
      return getReplacement(`<span class="date">${m}</span>`);
    })
    // parse ISO date
    .replace(/\S+/g, (m) => {
      const dateObj = new Date(m);
      if (Number.isNaN(dateObj.valueOf())) {
        return m;
      }
      if (dateObj.toISOString() === m) {
        return getReplacement(`<span class="date">${m}</span>`);
      }

      return m;
    })
    .replace(/(\S+?)=(\S+)/g, (_, key, value) => {
      return getReplacement(`<span class="key">${key}</span>=<span class="value">${value}</span>`);
    })
    // color quoted strings
    .replace(/"[^"]*?"/g, (m) => {
      return getReplacement(`<span class="string">${m}</span>`);
    })
    // color numbers
    .replace(/ \$?(-|\+)?\d+(.\d+)? /g, (m) => {
      if (m.startsWith(" $")) return m;

      return getReplacement(`<span class="number">${m}</span>`);
    })
    // color [TAG] indicators
    .replace(/\[\w+\]/g, (m) => {
      return getReplacement(`<span class="tag">${m}</span>`);
    });

  return modified.replace(/\$\d+;/g, (m) => {
    return map.get(m);
  });
}
