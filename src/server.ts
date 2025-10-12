import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser())


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Routes
app.get("/", (req, res) => {
    res.send("Hello, World!");
});
