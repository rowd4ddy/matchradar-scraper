import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'UFC Scraper is running' });
});

// Scrape upcoming UFC event
app.get('/ufc-upcoming', async (req, res) => {
  let browser;
  try {
    // Launch browser with more memory-friendly options
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--disable-extensions'
      ],
      defaultViewport: { width: 1280, height: 800 },
      timeout: 60000 // 60 seconds
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    // Go to UFC events page with longer timeout
    await page.goto('https://www.ufc.com/events', {
      waitUntil: 'networkidle2',
      timeout: 45000
    });

    // Wait for upcoming events section
    await page.waitForSelector('.c-card-event--upcoming', { timeout: 20000 });

    // Extract data
    const eventData = await page.evaluate(() => {
      const card = document.querySelector('.c-card-event--upcoming');
      if (!card) return null;

      // Title
      const titleEl = card.querySelector('.event-title');
      const title = titleEl ? titleEl.textContent.trim() : 'UFC Event';

      // Date (from data attribute)
      const dateAttr = card.getAttribute('data-date');
      const date = dateAttr ? new Date(parseInt(dateAttr) * 1000).toISOString() : null;

      // Fighters
      const fighterEls = card.querySelectorAll('.c-listing-fight-card__fighter-name');
      const fighters = Array.from(fighterEls)
        .map(el => el.textContent.trim())
        .filter(name => name && name !== '—' && name.length > 1)
        .slice(0, 2);

      return {
        title,
        date: date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        fighters: fighters.length === 2 ? fighters : ['TBD', 'TBD'],
        category: 'UFC Fight',
        stream: 'ESPN+ PPV',
        impact: 'Next UFC event.'
      };
    });

    await browser.close();

    if (eventData) {
      res.json(eventData);
    } else {
      res.status(404).json({ error: 'No upcoming event found' });
    }

  } catch (err) {
    console.error('Scraping error:', err);
    await browser?.close();
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`UFC Scraper running on port ${PORT}`);
});