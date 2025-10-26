import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/ufc-upcoming', (req, res) => {
  res.json({
    title: "UFC 305: Du Plessis vs. Adesanya",
    date: "2025-10-26T22:00:00Z",
    fighters: ["Dricus Du Plessis", "Israel Adesanya"],
    category: "Middleweight Title Fight",
    stream: "ESPN+ PPV",
    impact: "Winner becomes undisputed UFC Middleweight Champion."
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});