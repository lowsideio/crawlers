/* eslint no-loop-func: 0 */

const puppeteer = require('puppeteer');

const models = require('./src/models');

// import selectors
const settings = require('../crawlers_settings/bikez');

const authorizedFields = require('./src/authorizedFields');


async function run() {
  // create browser instance
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });

  // create a new page
  const page = await browser.newPage();

  /* getLinks from workspace */
  const links = await models.Link.findAll({
    where: {
      workspace: settings.workspace,
      last_visited: null,
    },
    limit: 2,
  });

  const promises = links.map(async (item) => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 2000);
    });
    console.log('visiting =====++>', item.link);
    // go to page
    await page.goto(item.link);

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
    const existingMotorcycle = await models.Motorcycle.findOne({
      where: {
        model: data.model,
        year: data.year,
      },
    });
    if (!existingMotorcycle) {
      console.log('inserting new model');
      await models.Motorcycle.create(data);
    } else {
      console.log('updating new model');
      await existingMotorcycle.update(data);
    }
    console.log('updateint link');
    await item.update({ last_visited: (new Date()).toISOString() });
  });

  console.log('promises', promises);

  await Promise.all(promises);

  // kill browser instance
  browser.close();
}

run();
