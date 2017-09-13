/* eslint no-loop-func: 0 */

const puppeteer = require('puppeteer');
const compact = require('lodash/compact');
const striptags = require('striptags');

// import selectors
const settings = require('../crawlers_settings/bikez');

const sanitizeKey = key => striptags(key);

async function run() {
  // create browser instance
  const browser = await puppeteer.launch({ headless: false });

  // create a new page
  const page = await browser.newPage();

  await page.goto(settings.startPage);
  console.log('> p > ', settings.startPage);

  const tableSelector = '#pagecontent > table:nth-child(7) > tbody > tr:nth-child(INDEX)';
  const LENGTH_SELECTOR_CLASS = '#pagecontent > table:nth-child(7) > tbody';

  await page.waitForSelector(LENGTH_SELECTOR_CLASS);

  const numberOfRows = await page.evaluate((sel) => {
    const selectedElement = document.querySelector(sel);
    if (selectedElement) {
      return selectedElement.rows.length;
    }
    return null;
  }, LENGTH_SELECTOR_CLASS);

  console.log('numberOfRows', numberOfRows);

  const promises = [];
  for (let i = 0; i < numberOfRows; i += 1) {
    const rowSelector = tableSelector.replace('INDEX', i + 1);
    const promise = page.evaluate(
      (sel) => {
        const selectedElement = document.querySelector(sel);
        if (selectedElement && selectedElement.cells && selectedElement.cells.length === 2) {
          const key = selectedElement.cells[0].innerHTML;
          const value = selectedElement.cells[1].innerHTML;

          return ({ [key]: value });
        }
        return null;
      },
      rowSelector,
    );
    promises.push(promise);
  }
  //
  // console.log('tableSelector>', tableSelector);
  // const table = await page.evaluate((sel) => {
  //   console.log('evaluating');
  //   console.log('sel', sel);
  //   const selectedTable = document.querySelector(sel);
  //   console.log('selectedTable', selectedTable);
  //   return selectedTable;
  // }, tableSelector);
  //
  //
  const result = compact(await Promise.all(promises));

  const data = {};
  // console.log('result', result);
  result.map((item) => {
    console.log('idx>', item);
    const key = Object.keys(item)[0];


    data[sanitizeKey(key)] = item[key];

    return 0;
  });

  console.log('data', data);


  // // sanitize results
  // Object.keys(result).map((key) => {
  //   const cleanKey = striptags(key);
  //   const value = result[key];
  //
  //   console.log(`${cleanKey} <> ${key}`);
  //
  //   delete result[key];
  //
  //   result[cleanKey] = value;
  //   return 0;
  // });
  //
  // console.log('table..', result);
  // extract data
  // const promises = Object.keys(settings.selectors).map(
  //   async (selectorKey) => {
  //     console.log(`> selecting ${selectorKey}`);
  //
  //     const value = await page.evaluate(
  //       (sel) => {
  //         console.log('evaluating');
  //         const selectedElement = document.querySelector(sel);
  //         console.log('selectedElement', selectedElement);
  //         if (selectedElement) {
  //           return selectedElement.innerHTML;
  //         }
  //         return null;
  //       },
  //       settings.selectors[selectorKey],
  //     );
  //
  //     return { [selectorKey]: value };
  //   },
  // );
  // console.log('promises', promises);
  //
  // const results = await Promise.all(promises);
  //
  // console.log('results', results);

  // kill browser instance
  browser.close();
}

run();
