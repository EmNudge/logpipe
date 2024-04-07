let count = 0;
setInterval(() => {
  console.log('[INFO]', new Date(), '"log count"', count++);
}, 2000)