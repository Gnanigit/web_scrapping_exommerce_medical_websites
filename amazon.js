import puppeteer from "puppeteer";

async function scrapeAmazon(productName) {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();

  console.log("Opening Amazon...");
  await page.goto("https://www.amazon.in/", { waitUntil: "networkidle2" });

  console.log("Typing product name...");
  await page.waitForSelector(".nav-input.nav-progressive-attribute");
  await page.type(".nav-input.nav-progressive-attribute", productName);

  console.log("Clicking search button...");
  await page.click("#nav-search-submit-button");

  console.log("Waiting for search results...");
  //   await page.waitForTimeout(5000); // Wait extra time to ensure loading
  console.log("Current Page URL:", page.url());

  console.log("Taking screenshot...");
  await page.screenshot({ path: "amazon_search_result.png", fullPage: true });

  console.log("Extracting products...");
  const products = await page.evaluate(() => {
    const items = document.querySelectorAll(
      "#a-page #search .s-result-item .s-card-container"
    );
    const results = [];

    items.forEach((item, index) => {
      if (index >= 5) return;

      const productName =
        item.querySelector(".s-title-instructions-style .a-link-normal h2 span")
          ?.innerText || "N/A";
      const productImage =
        item.querySelector(".s-image-square-aspect img")?.src || "N/A";
      console.log(productName);
      const rating =
        item.querySelector(".a-spacing-top-micro .a-icon-alt")?.innerText ||
        "N/A";
      console.log(rating);
      const currentPrice =
        item.querySelector(".s-price-instructions-style .a-price .a-offscreen")
          ?.innerText || "N/A";
      console.log(currentPrice);
      const actualPrice =
        item.querySelector(
          ".s-price-instructions-style .aok-inline-block .a-price .a-offscreen"
        )?.innerText || "N/A";
      console.log(actualPrice);
      results.push({
        actualName: productName,
        productImage: productImage,
        rating: rating,
        currentPrice: currentPrice,
        actualPrice: actualPrice,
      });
    });

    return results;
  });

  return products;
}

// Run the function
(async () => {
  const productName = "Fogg Napoleon Body Spray 150+Ml";
  const amazonData = await scrapeAmazon(productName);
  console.log("Amazon:", amazonData);
})();
