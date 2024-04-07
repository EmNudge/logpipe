let count = 0;
const logRandom = () => {
  const random = Math.random();
  if (random < 0.2) {
    console.log("[INFO]", new Date(), '"log random"', count++);
  } else if (random < 0.4) {
    console.log(
      "[WARN]",
      "This is a dangerous error. You are fumbulating the fumblertrons. Stop immediately or the blimdpad will forbulmdip."
    );
  } else if (random < 0.6) {
    console.log("testing | here is some data: ", count++);
  } else if (random < 0.8) {
    console.log("my object", { 
      a: 1,
      b: 2,
      c: Math.random() * 50
    });
  } else {
    console.log("server caught error!");
  }
};

setInterval(logRandom, 2000);
