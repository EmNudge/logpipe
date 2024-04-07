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

  const random = Math.random();
  if (random < 0.2) {
    console.log("[INFO]", new Date(), '"log random"', count);
  } else if (random < 0.4) {
    console.log(
      "[WARN]",
      "This is a dangerous error. You are fumbulating the fumblertrons. Stop immediately or the blimdpad will forbulmdip."
    );
  } else if (random < 0.6) {
    console.log("testing | here is some data: ", count);
  } else if (random < 0.8) {
    console.log("my object", {
      a: 1,
      b: 2,
      c: Math.random() * 50,
    });
  } else {
    console.log("server caught error!");
  }
}
