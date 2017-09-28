/* eslint no-loop-func: 0 */

const puppeteer = require('puppeteer');

const models = require('./src/models');

// import selectors
const settings = require('../crawlers_settings/bikez');

async function run() {
  // create browser instance
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });

  // create a new page
  const page = await browser.newPage();

  // go to page
  await page.goto(settings.links.startPage);

  // get page data
  const data = await settings.links.getFrom(page);

  const promises = data.map(link =>
    models.Link.create({ workspace: settings.workspace, last_visited: null, link }),
  );

  await Promise.all(promises);

  // kill browser instance
  browser.close();
}

run();
