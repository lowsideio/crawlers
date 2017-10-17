/* eslint no-loop-func: 0 */
/* eslint no-await-in-loop: 0 */
/* eslint no-continue: 0 */

const puppeteer = require('puppeteer');
const readlineSync = require('readline-sync');
const moment = require('moment');

const models = require('./src/models');

// import selectors
const settings = require('../crawlers_settings/bikez');

const authorizedFields = require('./src/authorizedFields');

/* utils */
const exit = () => process.exit();
const timestamp = () => moment().format('YYYY-DD-MM HH:mm:ss.SSS');
const log = (msg, newLine) => console.log(`${newLine ? '\n' : ''}${timestamp()}\t${msg}`); // eslint-disable-line
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const nextLink = () => models.Link.findOne({
  where: {
    workspace: settings.workspace,
    last_visited: null,
  },
});

async function run() {
  // create browser instance
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });

  // create a new page
  const page = await browser.newPage();

  /* getLinks from workspace */
  let linkObject = await nextLink();
  while (linkObject) {
    linkObject = await nextLink();
    log(`@> ${linkObject.link}`);
    try {
      // we are doing this manually .. gently :)

      /* ********************* */
      /* MANUAL
      /* ********************* */
      // const ok = readlineSync.question(`fetch ${linkObject.link} ?\n`);
      //
      // // stop script
      // if (ok === 'e') { exit(); }
      // // skip page
      // if (ok !== 'y') { linkObject = await nextLink(); continue; }

      /* ********************* */
      /* AUTOMATIC
      /* ********************* */
      await sleep(((Math.random() * 500000000) % 1000) + 1000);

      // navigate to page
      await page.goto(linkObject.link);

      // get page data
      const data = await settings.getPageData(page);

      console.log('data', data);

      // check page data
      Object.keys(data).map((key) => {
        if (!authorizedFields.includes(key)) {
          delete data[key];
          return 1;
        }
        if (settings.normalize()[key]) {
          data[key] = settings.normalize()[key](data[key]);
        }
        return 0;
      });

      // save data
      const existingMotorcycle = await models.Motorcycle.findOne({
        where: {
          model: data.model,
          year: data.year,
        },
      });

      if (!existingMotorcycle) {
        log(`create\t${data.model}`);
        await models.Motorcycle.create({ ...data, _source: linkObject.link });
      } else {
        log(`update\t${data.model}`);
        await existingMotorcycle.update({ ...data, _source: linkObject.link });
      }
      await linkObject.update({ last_visited: (new Date()).toISOString() });
    } catch (e) {
      console.log('e', e);
    }
  }

  // kill browser instance
  browser.close();
}

run();
