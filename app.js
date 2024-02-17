const api = require('./api');
const auth = require('./auth');
const getCompliments = require('./parse');
const readlineSync = require('readline-sync');

const lover = readlineSync.question('Enter your lover: ');
const delay = 7000;

(async function() {
  await auth();

  const compliments = await getCompliments();

  const interval = setInterval(() => {
    const number = Math.floor(Math.random() * compliments.length);
    api.sendMessageTo(lover, compliments[number]);
  }, delay);
})();

