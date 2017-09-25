/* eslint no-loop-func: 0 */

const puppeteer = require('puppeteer');

const models = require('./src/models');

// import selectors
const settings = require('../crawlers_settings/bikez');

const authorizedFields = require('./src/authorizedFields');


async function run() {
  await models.sequelize.sync({ force: true });

  // create browser instance
  const browser = await puppeteer.launch({ headless: false });

  // create a new page
  const page = await browser.newPage();

  // go to page
  await page.goto(settings.startPage);

  // get page data
  const data = await settings.getPageData(page);

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
  await models.Motorcycle.create({
    ...data,
  });

  // kill browser instance
  browser.close();
}

run();
