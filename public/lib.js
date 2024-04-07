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

  const modified = text
    .replace(/\S+/g, (m) => {
      if (!Number.isNaN(Number(m))) {
        return m;
      }
      if (!Number.isNaN(new Date(m).valueOf())) {
        const placeholder = `$${ident++}`;
        map.set(placeholder, `<span class="date">${m}</span>`);
        return placeholder;
      }

      return m;
    })
    .replace(/"[^"]+?"/g, (m) => {
      const placeholder = `$${ident++}`;
      map.set(placeholder, `<span class="string">${m}</span>`);
      return placeholder;
    })
    .replace(/(\$\d+|\b\d+)\b/g, (m) => {
      if (m.startsWith("$")) return m;

      const placeholder = `$${ident++}`;
      map.set(placeholder, `<span class="number">${m}</span>`);
      return placeholder;
    })
    .replace(/\[\w+\]/g, (m) => {
      const placeholder = `$${ident++}`;
      map.set(placeholder, `<span class="tag">${m}</span>`);
      return placeholder;
    });

  return modified.replace(/\$\d+/g, (m) => {
    return map.get(m);
  });
}