import express from 'express';

const app = express();

app.use(express.json());

// test route
app.get('/api', (req, res) => {
  res.json({ message: "FreshCart API working 🚀" });
});

export default app;