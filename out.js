const { iterations, delay } = (() => {
  const args = process.argv.slice(2).join(" ");

  const iterations = (() => {
    const match =
      args.match(/--iterations\s+(\d+)/) ?? args.match(/-i\s*(\d+)/);
    return match ? Number(match[1]) : Infinity;
  })();
  const delay = (() => {
    const match = args.match(/--delay\s+(\d+)/) ?? args.match(/-d\s*(\d+)/);
    return match ? Number(match[1]) : 2000;
  })();

  return { iterations, delay };
})();

let count = 0;
const intId = setInterval(logRandom, delay);
function logRandom() {
  if (++count > iterations) {
    clearInterval(intId);
    return;
  }

  const branches = [
    () => console.log("[INFO]", new Date(), '"log random"', count),
    () =>
      console.log(
        "[WARN]",
        "This is a dangerous error. You are fumbulating the fumblertrons. Stop immediately or the blimdpad will forbulmdip."
      ),
    () => console.log("testing | here is some data: ", count),
    () =>
      console.log("my object", {
        a: 1,
        b: 2,
        c: Math.random() * 50,
      }),
    () =>
      console.log(
        "stringified",
        JSON.stringify(
          {
            a: 1,
            b: 2,
            c: Math.random() * 50,
          },
          null,
          2
        )
      ),
    () => console.log("server caught error!"),
  ];
  branches[branches.length * Math.random() | 0]();
}
