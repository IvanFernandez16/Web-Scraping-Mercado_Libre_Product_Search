const puppeteer = require("puppeteer");

function busqueda(Product) {
  (async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://www.mercadolibre.com.ar/");
    await page.waitForSelector(".nav-search");
    await page.type(".nav-search", Product);
    await page.click("body > header > div > form > button");
    await page.waitForSelector(
      "#root-app > div > div.ui-search-main.ui-search-main--exhibitor.ui-search-main--only-products > section"
    );
    const links = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        "#root-app > div > div.ui-search-main.ui-search-main--exhibitor.ui-search-main--only-products > section > ol > li > div > div > div.ui-search-result__content-wrapper > div.ui-search-item__group.ui-search-item__group--title > a.ui-search-item__group__element.ui-search-link"
      );
      const linkx = [];
      for (let element of elements) {
        linkx.push(element.href);
      }
      return linkx;
    });
    const objects = [];
    for (let link of links) {
      await page.goto(link);
      await page.waitForSelector(
        "#root-app > div > div.ui-pdp-container.ui-pdp-container--pdp > div > div.ui-pdp-container__col.col-1.ui-pdp-container--column-right.mt-16.pr-16.ui-pdp--relative > div > div.ui-pdp-container__row.ui-pdp-component-list.pr-16.pl-16 > div > div.ui-pdp-container__row.ui-pdp-container__row--header > div > div.ui-pdp-header__title-container > h1"
      );
      const data = await page.evaluate(() => {
        const priceAndTitle = {};
        priceAndTitle.titleOnPage = document.querySelector(
          "#root-app > div > div.ui-pdp-container.ui-pdp-container--pdp > div > div.ui-pdp-container__col.col-1.ui-pdp-container--column-right.mt-16.pr-16.ui-pdp--relative > div > div.ui-pdp-container__row.ui-pdp-component-list.pr-16.pl-16 > div > div.ui-pdp-container__row.ui-pdp-container__row--header > div > div.ui-pdp-header__title-container > h1"
        ).innerText;
        priceAndTitle.priceOnPage = document.querySelector(
          "#root-app > div > div.ui-pdp-container.ui-pdp-container--pdp > div > div.ui-pdp-container__col.col-1.ui-pdp-container--column-right.mt-16.pr-16.ui-pdp--relative > div > div.ui-pdp-container__row.ui-pdp-component-list.pr-16.pl-16 > div > div.ui-pdp-container__row.ui-pdp-container__row--price > div > div.ui-pdp-price__second-line > span > span.price-tag-amount > span.price-tag-fraction"
        ).innerText;
        return priceAndTitle;
      });
      objects.push(data);
    }
    let allNumbers = [];

    for (let index = 0; index < objects.length; index++) {
      objects[index].priceOnPage = objects[index].priceOnPage.replace(".", "");
      objects[index].priceOnPage = parseInt(objects[index].priceOnPage);
      allNumbers.push(objects[index].priceOnPage);
    }
    console.log(objects);

    let minNum = Math.min(...allNumbers);
    let maxNum = Math.max(...allNumbers);

    let maxprice = { Product: "x", Price: 0 };
    let minprice = { Product: "x", Price: 0 };

    objects.forEach((e) => {
      if (e.priceOnPage === maxNum) {
        maxprice.Product = e.titleOnPage;
        maxprice.Price = e.priceOnPage;
      } else if (e.priceOnPage === minNum) {
        minprice.Product = e.titleOnPage;
        minprice.Price = e.priceOnPage;
      }
    });
    console.log("el mas caro es \n", maxprice, "\n");
    console.log("el mas barato es \n ", minprice, "\n");
    await browser.close();
  })();
}

busqueda("guantes de boxeo everlast");
