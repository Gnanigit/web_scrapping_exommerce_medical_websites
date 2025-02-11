import puppeteer from "puppeteer";

async function scrapeFlipkart(productName) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Opening Flipkart...");
  await page.goto(
    `https://www.flipkart.com/search?q=${encodeURIComponent(
      productName
    )}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off&sort=price_asc`,
    { waitUntil: "networkidle2" }
  );

  // Extract product details
  const products = await page.evaluate(() => {
    const productRows = document.querySelectorAll("._75nlfW"); // Select product rows
    let productList = [];
    let maxProducts = 8; // Limit to 8 products

    productRows.forEach((row) => {
      const productCards = row.querySelectorAll(".slAVV4"); // Select individual product cards

      productCards.forEach((card) => {
        if (productList.length >= maxProducts) return; // Stop if 8 products are already collected

        const productAnchor = card.querySelector(".VJA3rP");
        const productLink = productAnchor
          ? `https://www.flipkart.com${productAnchor.getAttribute("href")}`
          : null;

        const imgTag = productAnchor?.querySelector(".DByuf4");
        const productImage = imgTag ? imgTag.getAttribute("src") : null;

        const nameAnchor = card.querySelector(".wjcEIp");
        const actualName = nameAnchor ? nameAnchor.innerText.trim() : null;

        // Extract rating
        const ratingSpan = card.querySelector(".XQDdHH");
        const rating = ratingSpan ? ratingSpan.innerText.trim() : null;

        // Extract prices
        const priceDiv = card.querySelector(".Nx9bqj");
        const currentPrice = priceDiv ? priceDiv.innerText.trim() : null;

        const actualPriceDiv = card.querySelector(".yRaY8j");
        const actualPrice = actualPriceDiv
          ? actualPriceDiv.innerText.trim()
          : null;

        if (actualName && productLink) {
          productList.push({
            actualName,
            productImage,
            productLink,
            rating,
            currentPrice,
            actualPrice,
          });
        }
      });
    });

    return productList;
  });

  await browser.close();
  return products.slice(0, 8); // Ensure only 8 products are returned
}

// Run the function
(async () => {
  const productName = "Fogg";
  const FlipkartData = await scrapeFlipkart(productName);
  console.log("Flipkart Data:", FlipkartData);
})();
