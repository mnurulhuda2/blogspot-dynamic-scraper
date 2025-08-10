const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());
const PORT = process.env.PORT || 3000;

// Gunakan browser headless di server
let browser;

(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  console.log('Browser siap!');
})();

app.post('/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL diperlukan' });
  }

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Ambil teks dari body atau artikel
    const content = await page.evaluate(() => {
      const selectors = [
        'article',
        '.post-content',
        '.entry-content',
        'main',
        '.content',
        'body'
      ];
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el.innerText || el.textContent;
      }
      return document.body.innerText;
    });

    await page.close();

    res.json({
      url,
      content: content.substring(0, 30000),
      length: content.length,
      success: true
    });

  } catch (err) {
    res.status(500).json({
      url,
      error: 'Gagal scrape: ' + err.message
    });
  }
});

app.get('/', (req, res) => {
  res.send('🔧 Scraper Eksternal Siap! Kirim POST ke /scrape');
});

app.listen(PORT, () => {
  console.log(`🚀 Scraper berjalan di http://localhost:${PORT}`);
});
