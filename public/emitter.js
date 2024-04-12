/** @param {(log: { date: number, input: string }[]) => void} func */
export function startEmitter(func) {
  let count = 0;

  const branches = [
    () => ["[INFO]", new Date().toISOString(), '"log random"', count],
    () => ["Info 2024-04-08 19:10:00,779 /opt/tmp/file_seq.data"],
    () => ["[Error(danger)]", "This is a dangerous error."],
    () => ["failed to throw an error. This is surprisingly not a good thing."],
    () => ["[INFO] /opt/file_thing.sock:019 | all systems go"],
    () => [
      "on http://localhost:8080 (127.0.0.1) someone cool made a GET request (source: file_thing.js:32)",
    ],
    () => [
      "stringified",
      JSON.stringify(
        {
          a: 1,
          b: 2,
          c: Math.random() * 50,
        },
        null,
        2
      ),
    ],
    () => ["Debug received POST, GET, PATCH, PUT, and DELETE from 192.168.1.1 (somehow)"],
  ];

  const getBranch = () => branches[(branches.length * Math.random()) | 0]();
  const getLog = () => ({ input: getBranch().join(" "), date: Date.now() });

  func(Array(10).fill().map(getLog));

  return setInterval(() => func([getLog()]), 1000);
}
