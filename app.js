const api = require('./api');
const auth = require('./auth');
const getCompliments = require('./parse');
const readlineSync = require('readline-sync');

const lover = readlineSync.question('Enter your lover: ');
const delay = readlineSync.question('Enter delay (in seconds): ') * 1000;

(async function() {
  await auth();

  const compliments = await getCompliments();

  sendRandomCompliment();
  const interval = setInterval(sendRandomCompliment, delay);

  function sendRandomCompliment() {
    const number = Math.floor(Math.random() * compliments.length);
    api.sendMessageTo(lover, compliments[number]);
  }
})();

