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
    () => console.log("Info 2024-04-08 19:10:00,779 /opt/tmp/file_seq.data"),
    () =>
      console.log(
        "[Error(danger)]",
        "An error occurred due to a false value when expecting a true value"
      ),
    () => console.log('failed to throw an error. This is surprisingly not a good thing.'),
    () => console.log("[INFO] /opt/file_thing.sock:019 | all systems go"),
    () =>
      console.log("on http://localhost:8080 (127.0.0.1) someone cool made a GET request (source: file_thing.js:32)", {
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
    () => console.log("Debug received POST, GET, PATCH, PUT, and DELETE from 192.168.1.1 (somehow)"),
  ];
  branches[branches.length * Math.random() | 0]();
}
