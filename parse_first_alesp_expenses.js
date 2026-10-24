const { XMLParser } = require('fast-xml-parser');

async function run() {
  try {
    const url = 'http://www.al.sp.gov.br/repositorioDados/deputados/despesas_gabinetes.xml';
    console.log('Fetching ALESP expenses XML...');
    const resp = await fetch(url);
    const text = await resp.text();
    console.log('XML length:', text.length);
    const parser = new XMLParser({
      processEntities: false
    });
    const json = parser.parse(text);
    
    // Find the first few expense elements
    // The structure is usually <Despesas><Despesa>...</Despesa></Despesas> or similar
    const keys = Object.keys(json);
    console.log('Root keys:', keys);
    
    const rootKey = keys[0];
    const items = json[rootKey];
    console.log('Inner keys:', Object.keys(items));
    
    const arrayKey = Object.keys(items)[0];
    const list = items[arrayKey];
    console.log('Total expense records:', list.length);
    console.log('First expense record:', JSON.stringify(list[0], null, 2));
    console.log('First expense record keys:', Object.keys(list[0]));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
