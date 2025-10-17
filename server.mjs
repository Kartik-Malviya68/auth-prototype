import app from "./api/index.js";

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Auth API listening on http://localhost:${port}`);
});
