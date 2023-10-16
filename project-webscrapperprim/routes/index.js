var express = require('express');
var router = express.Router();
var app = require('../app');
const puppeteer = require('puppeteer');
const wordCount = require("word-count");

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  next();
});

router.get('/', function(req, res, next) {
  returnPayload(req.query.link).then(result => {
    Promise.all(result).then(m => {
      res.send(JSON.stringify(m));
    });
  });
});

async function fetchInitialData(link) {

  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.goto(link);

  const initialData = await page.$$eval('#__next > main > div > div > div > div > div > div:nth-child(2)', titles => titles.map(title => title.innerText));

  const links = await page.$$eval('#__next > main > div > div > div > div > div > div > div > a', anchors => anchors.map(el => el.getAttribute('href')));

  const images = await page.$$eval('#__next > main > div > div > div > div > a > img', src => src.map(el => el.getAttribute('src')));

  let payloads = initialData.map((title, indexValue) => {
    return {
      title: title.split(/\r?\n/)[0],
      short_description: title.split(/\r?\n/)[1],
      link: 'https://wsa-test.vercel.app' + links[indexValue],
      image: 'https://wsa-test.vercel.app' + images[indexValue]
    }
  });

  await browser.close();
  return payloads;
}

async function fetchAdvancedData(payloads){
  const browser = await puppeteer.launch();

  const res = payloads.map(async (payload, i) => {
    const page = await browser.newPage();

    await page.goto(payload.link);

    const longDescription = await page.$$eval('#__next > div > div > div > div:nth-child(2) > div > div > div:nth-child(2)', descriptions => descriptions.map(description => description.innerText));

    payload.long_description = longDescription[0];

    const content = await page.$$eval('#__next > div > div', content => content.map(text => text.innerText));

    payload.words = wordCount(content[0]);

    await page.close();

    return payload;
  });

  const result = Promise.all(res).then(result => {
    browser.close();
    return res;
  });

  return result;
}

async function returnPayload(link) {
  const payloads = await fetchInitialData(link);

  const payloadsPrim =  await fetchAdvancedData(payloads);

  return payloadsPrim;
}

module.exports = router;
