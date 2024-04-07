let count = 0;
const logRandom = () => {
  const random = Math.random();
  if (random < .2) {
    console.log('[INFO]', new Date(), '"log random"', count++);
  } else if (random < .4) {
    console.log('[WARN]', 'This is a dangerous error. You are fumbulating the fumblertrons. Stop immediately or the blimdpad will forbulmdip.');
  } else if (random < .6) {
    console.log('testing | here is some data: ', count++);
  } else if (random < .8) {
    console.log('my object', { a: 1, b: 2, c: 3 });
  } else {
    console.log('server caught error!');
  }
}

setInterval(logRandom, 2000)