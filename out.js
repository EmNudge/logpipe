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
    "\x1B]8;;https://doc.rust-lang.org/cargo/reference/profiles.html#default-profiles\x1B\\`dev` profile [unoptimized + debuginfo]\x1B]8;;\x1B\\",
    "\x1B[31m [ANSI] Hello There! \x1B[0m",
    `[INFO] ${new Date().toISOString()} "log random" ${count}`,
    "Info 2024-04-08 19:10:00,779 /opt/tmp/file_seq.data",
    "[Error(danger)] An error occurred [42] seconds ago due to a false value when expecting a true value",
    "failed to throw an error. This is surprisingly not a good thing.",
    "[INFO] /opt/file_thing.sock:19 took 232.21ms | all systems go",
    "on http://localhost:8080 (127.0.0.1) someone cool made a GET request (source: file_thing.js:32)",
    '["this is not a tag"] action took 32h2m1.13s at file_info.go:(12,31)',
    `stringified ${JSON.stringify(
      { a: 1, b: 2, c: Math.random() * 50 },
      null,
      2
    )}`,
    "Debug received POST, GET, PATCH, PUT, and DELETE from 192.168.1.1 (somehow)",
  ];
  const log = branches[(branches.length * Math.random()) | 0];
  console.log(log);
}
