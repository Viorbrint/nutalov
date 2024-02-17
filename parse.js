const HTMLparser = require('node-html-parser');

module.exports = async function() {
  const url = 'https://t-loves.narod.ru/komplimenty-devushke.htm';
  const response = await fetch(url);
  
  let compliments = null;

  if (response.ok) {
    const html = await response.text();
    const root = HTMLparser.parse(html);
    compliments = root.querySelectorAll('p.text-main').map(coml => coml.structuredText);
  } else {
    console.log(response.status);
  }

  return compliments;
};