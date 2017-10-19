/* eslint no-loop-func: 0 */
/* eslint no-await-in-loop: 0 */
/* eslint no-continue: 0 */

const puppeteer = require('puppeteer');
const readlineSync = require('readline-sync');

const models = require('./src/models');


const exit = () => process.exit();

// this is a workspace settings — quite obscure and won't be disclosed anytime soon
const settings = require('../crawlers_settings/bikez');

const category = 'NAKED';

async function run() {
  // create browser instance
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  // create a new page
  const page = await browser.newPage();

  // go to first page
  let nextPage = settings.links.nextPage(category);
  // till there is no page to explore
  while (nextPage) {
    // we are doing this manually .. gently :)
    // const ok = readlineSync.question(`fetch ${nextPage} ?\n`);
    //
    // // stop script
    // if (ok === 'e') { exit(); }
    // // skip page
    // if (ok !== 'y') { nextPage = settings.links.nextPage(category); continue; }

    // load page
    await page.goto(nextPage);

    // get page data
    const data = await settings.links.getFrom(page);

    // retrieve all links
    const promises = data.map(async (link) => {
      const existingLink = await models.Link.findOne({ raw: true, where: { link } });
      if (!existingLink) {
        await models.Link.create({ workspace: settings.workspace, last_visited: null, link });
      }
      return 1;
    });

    await Promise.all(promises);

    nextPage = settings.links.nextPage(category);
  }
  // kill browser instance
  browser.close();
}

run();
