import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";

export const runMigrations = async () => {
  try {
    console.log("Running database migrations...");

    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations completed successfully");

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};
