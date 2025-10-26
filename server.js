import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'UFC Scraper is running' });
});

// Scrape upcoming UFC event from ufcstats.com
app.get('/ufc-upcoming', async (req, res) => {
  try {
    const response = await fetch('https://www.ufcstats.com/statistics/events/upcoming');
    const html = await response.text();

    // Extract next event title
    const titleMatch = html.match(/<a href="[^"]+" class="b-link b-link_style_bold">([^<]+)<\/a>/);
    const title = titleMatch ? titleMatch[1].trim() : 'UFC Event';

    // Extract date
    const dateMatch = html.match(/<span class="b-statistics__table-col">([^<]+)<\/span>/);
    const date = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Extract fighters (simplified)
    const fighterMatches = html.matchAll(/<a href="[^"]+">([^<]+)<\/a>/g);
    const foundFighters = [];
    for (const match of fighterMatches) {
      const name = match[1].trim();
      if (name && name !== '—' && !name.includes('Event')) {
        foundFighters.push(name);
      }
    }

    // Take first two fighters
    let fighters = ['TBD', 'TBD'];
    if (foundFighters.length >= 2) {
      fighters = [foundFighters[0], foundFighters[1]];
    }

    res.json({
      title,
      date,
      fighters,
      category: 'UFC Fight',
      stream: 'ESPN+ PPV',
      impact: 'Next UFC event.'
    });

  } catch (err) {
    console.error('Scraping error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`UFC Scraper running on port ${PORT}`);
});