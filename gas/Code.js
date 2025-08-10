// gas/Code.js
const GOOGLE_SHEET_ID = 'YOUR_SHEET_ID'; // Ganti nanti
const SHEET_NAME = 'Results';
const CUSTOM_SEARCH_ENGINE_ID = 'YOUR_CSE_ID';
const API_KEY = 'YOUR_GOOGLE_API_KEY';
const WEBHOOK_URL = 'https://your-scraper.onrender.com/scrape'; // Ganti saat deploy

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function scrapeBlogspot(keyword) {
  const results = [];
  const urls = searchBlogspot(keyword);

  urls.forEach(url => {
    const title = extractTitleFromUrl(url) || 'Unknown Title';
    const content = fetchArticleContent(url);
    results.push([keyword, title, url, content, new Date()]);
  });

  saveToSheet(results);

  return { success: true, found: urls.length, results };
}

function searchBlogspot(keyword) {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    keyword
  )}&cx=${CUSTOM_SEARCH_ENGINE_ID}&key=${API_KEY}&num=10&siteSearch=.com`;

  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return [];
    const json = JSON.parse(res.getContentText());
    return (json.items || []).map(i => i.link);
  } catch (e) {
    console.error(e);
    return [];
  }
}

function extractTitleFromUrl(url) {
  const match = url.match(/\/\d{4}\/\d{2}\/([^\/]+)\.html/);
  return match ? decodeURIComponent(match[1].replace(/-/g, ' ')) : null;
}

function fetchArticleContent(url) {
  const dynamicSites = [
    'medium.com',
    'substack.com',
    'dev.to',
    'blog.github.com',
    'nextjs.org',
    'react.dev',
    'v8.dev',
    'angular.io'
  ];

  if (dynamicSites.some(site => url.includes(site))) {
    return sendToExternalScraper(url);
  }

  return scrapeStaticContent(url);
}

function scrapeStaticContent(url) {
  try {
    const res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = res.getContentText();

    const patterns = [
      /<div class="[^"]*post-body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
      /<article[\s\S]*?>([\s\S]*?)<\/article>/i,
      /<div[^>]+class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]+class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<main[^>]*>([\s\S]*?)<\/main>/i
    ];

    let content = '';
    for (let p of patterns) {
      const m = html.match(p);
      if (m) { content = m[1]; break; }
    }

    if (!content) {
      const ps = html.match(/<p[^>]*>.*?<\/p>/gi);
      content = ps && ps.length > 3 ? ps.join(' ') : 'Konten tidak ditemukan';
    }

    return cleanHtml(content).substring(0, 30000);
  } catch (e) {
    return 'Static Error: ' + e.message.substring(0, 200);
  }
}

function sendToExternalScraper(url) {
  try {
    const res = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ url }),
      muteHttpExceptions: true,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const json = JSON.parse(res.getContentText());
    return (json.content || json.error || 'Unknown error').substring(0, 30000);
  } catch (e) {
    return 'Webhook Error: ' + e.message.substring(0, 200);
  }
}

function cleanHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n')
    .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '**$1**\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\s*\n\s*\n/g, '\n\n')
    .trim();
}

function saveToSheet(data) {
  const ss = SpreadsheetApp.openById(GOOGLE_SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  const header = ['Keyword', 'Title', 'URL', 'Content', 'Timestamp'];
  if (!sheet.getRange(1, 1).getValue()) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.autoResizeColumns(1, 5);
    sheet.setColumnWidth(4, 400);
  }

  if (data.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  }
}
