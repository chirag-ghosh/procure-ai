import { db } from "./db";
import { vendors } from "./schema";

export const seedDatabase = async () => {
  try {
    console.log("Checking seed data...");

    // Check if any vendors exist
    const existingVendors = await db.select().from(vendors).limit(1);

    if (existingVendors.length > 0) {
      console.log("Database already seeded. Skipping.");
      return;
    }

    console.log("Inserting initial vendors...");
    await db.insert(vendors).values([
      {
        name: "TechDepot Solutions",
        email: "flairstudios828049@gmail.com",
        contactPerson: "Alice Johnson",
        category: "Hardware"
      },
      {
        name: "Pam Office Supplies",
        email: "pam@fake-domain.com",
        contactPerson: "Pam Beesly",
        category: "Supplies"
      },
      {
        name: "Global Hardware Inc.",
        email: "chirag-ghosh-dev@proton.me",
        contactPerson: "Chirag Ghosh",
        category: "Hardware"
      },
    ]);
    console.log("Seeding completed.");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
};
