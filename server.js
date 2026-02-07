import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data", "reviews.json");

const app = express();
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const readReviews = async () => {
  try {
    const file = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(file);
  } catch (error) {
    return { pending: [], approved: [] };
  }
};

const writeReviews = async (payload) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2));
};

app.get("/api/reviews", async (_req, res) => {
  const data = await readReviews();
  res.json(data.approved || []);
});

app.get("/api/reviews/pending", async (_req, res) => {
  const data = await readReviews();
  res.json(data.pending || []);
});

app.post("/api/reviews", async (req, res) => {
  const name = String(req.body.name || "").trim().slice(0, 80);
  const message = String(req.body.message || "").trim().slice(0, 600);

  if (!name || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const data = await readReviews();
  const review = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    message,
    createdAt: new Date().toISOString(),
  };

  data.pending = [review, ...(data.pending || [])];
  await writeReviews(data);
  return res.status(201).json({ ok: true });
});

app.post("/api/reviews/approve", async (req, res) => {
  const id = String(req.body.id || "").trim();
  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  const data = await readReviews();
  const pending = data.pending || [];
  const index = pending.findIndex((review) => review.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  const [review] = pending.splice(index, 1);
  data.pending = pending;
  data.approved = [review, ...(data.approved || [])];
  await writeReviews(data);
  return res.json({ ok: true });
});

app.post("/api/reviews/reject", async (req, res) => {
  const id = String(req.body.id || "").trim();
  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }

  const data = await readReviews();
  data.pending = (data.pending || []).filter((review) => review.id !== id);
  await writeReviews(data);
  return res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Server ready.
});
