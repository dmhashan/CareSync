const express = require('express');
const app = express();

app.use(express.json());

// In-memory store for drugs
let drugs = [];
let currentId = 1;

// Add a new drug
app.post('/drugs', (req, res) => {
  const { name, schedule } = req.body;
  const newDrug = { id: currentId++, name, schedule };
  drugs.push(newDrug);
  res.status(201).json(newDrug);
});

// Get all drugs
app.get('/drugs', (req, res) => {
  res.json(drugs);
});

// Get a single drug
app.get('/drugs/:id', (req, res) => {
  const drug = drugs.find(d => d.id === parseInt(req.params.id));
  if (!drug) return res.status(404).json({ message: 'Drug not found' });
  res.json(drug);
});

// Update a drug
app.put('/drugs/:id', (req, res) => {
  const drug = drugs.find(d => d.id === parseInt(req.params.id));
  if (!drug) return res.status(404).json({ message: 'Drug not found' });

  const { name, schedule } = req.body;
  drug.name = name || drug.name;
  drug.schedule = schedule || drug.schedule;
  res.json(drug);
});

// Delete a drug
app.delete('/drugs/:id', (req, res) => {
  const index = drugs.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Drug not found' });

  const deleted = drugs.splice(index, 1);
  res.json({ message: 'Drug deleted', deleted });
});

// Root
app.get('/', (req, res) => {
  res.send('Drug Management API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
