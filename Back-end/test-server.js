// test-server.js
import express from 'express';

const app = express();
const PORT = 5000;

// Only basic routes - no imports
app.get('/', (req, res) => res.json({ message: 'Test OK' }));
app.get('/api/test', (req, res) => res.json({ message: 'API Test OK' }));

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});