const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = path.join(__dirname, "test-assets");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function createAssets() {
  console.log("Generating test JPG, PNG, and WebP assets...");
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Create a canvas and export as PNG, JPEG, and WebP
  await page.setContent(`
    <html>
      <body>
        <canvas id="c" width="1600" height="1200"></canvas>
        <script>
          const canvas = document.getElementById('c');
          const ctx = canvas.getContext('2d');
          
          // Draw colorful test pattern
          ctx.fillStyle = '#1F8C7F';
          ctx.fillRect(0, 0, 1600, 1200);

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(800, 600, 300, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0B0B0D';
          ctx.font = 'bold 72px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Test Artwork 1600x1200', 800, 620);
        </script>
      </body>
    </html>
  `);

  const pngBase64 = await page.evaluate(() => {
    return document.getElementById("c").toDataURL("image/png").split(",")[1];
  });
  fs.writeFileSync(path.join(outDir, "test-artwork.png"), Buffer.from(pngBase64, "base64"));

  const jpgBase64 = await page.evaluate(() => {
    return document.getElementById("c").toDataURL("image/jpeg", 0.9).split(",")[1];
  });
  fs.writeFileSync(path.join(outDir, "test-artwork.jpg"), Buffer.from(jpgBase64, "base64"));

  const webpBase64 = await page.evaluate(() => {
    return document.getElementById("c").toDataURL("image/webp", 0.9).split(",")[1];
  });
  fs.writeFileSync(path.join(outDir, "test-artwork.webp"), Buffer.from(webpBase64, "base64"));

  await browser.close();
  console.log("Created test-artwork.jpg, test-artwork.png, and test-artwork.webp in test-assets/");
}

createAssets().catch((err) => {
  console.error(err);
  process.exit(1);
});
