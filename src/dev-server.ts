import app from './app';

// pick any port (not 3000 if you also run vercel dev)
const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  console.log(`Dev server running on http://localhost:${PORT}`);
});
