import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const connect = async () => {
  try {
    await client.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed", error);
  }
};

connect();

export const db = drizzle(client, { schema });
