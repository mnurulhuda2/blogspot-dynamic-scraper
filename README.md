# 🌐 Hybrid Blogspot & Dynamic Website Scraper

Tool untuk scraping artikel dari **Blogspot (Blogger)** dan **website dinamis (Medium, React, dll)** menggunakan kombinasi:

- ✅ **Google Apps Script** → pencarian & scraping statis
- ✅ **Node.js + Puppeteer** → scraping website dinamis
- ✅ **Google Sheets** → penyimpanan hasil
- ✅ **Render.com** → hosting gratis

## 🧩 Fitur

- Pencarian artikel berdasarkan kata kunci
- Support Blogspot, WordPress, Medium, Dev.to, dll
- Auto-detect website dinamis → kirim ke Puppeteer
- Hasil disimpan ke Google Sheet
- Web interface sederhana

## 🚀 Cara Pakai

1. [Setup Google Apps Script](docs/how-to-use.md)
2. [Deploy Node.js ke Render](docs/deployment-guide.md)
3. Ganti `WEBHOOK_URL` di GAS
4. Jalankan dari web app

## 🔐 Dependencies

- Google Account
- Google Sheet
- Google Cloud API (Custom Search)
- Render.com account (gratis)

Dibuat dengan ❤️ oleh [Nama Kamu]
