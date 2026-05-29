import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth";
import albumRoutes from "./routes/album";
import collectionRoutes from "./routes/collection";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/collection", collectionRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Figuritas API running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
