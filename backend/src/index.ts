import express from "express";
import cors from "cors";
import cron from "node-cron";
import { runMigrations } from "./migrate";
import { seedDatabase } from "./seed";
import { rfpRouter } from "./routes";
import { syncService } from "./services/sync";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date() })
);

app.use("/", rfpRouter);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await runMigrations();
  await seedDatabase();

  cron.schedule('*/10 * * * *', async () => {
    console.log('Running Scheduled Email Sync...');
    await syncService.syncProposals();
  });
  console.log("Email Sync Scheduler started (runs every 10 mins)");

  app.listen(PORT, () => {
    console.log(`Backend Service running on port ${PORT}`);
  });
};

startServer();
