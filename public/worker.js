// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parentPort, workerData } = require('node:worker_threads');

const { data, regex } = workerData;

console.log('-- regex:', regex);

parentPort.postMessage(
  regex === undefined
    ? data
    : data.filter((clip) => clip.plainText.match(regex))
);
