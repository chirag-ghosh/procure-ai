import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  contactPerson: text("contact_person"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});


export const rfps = pgTable("rfps", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  originalRequest: text("original_request").notNull(),
  structuredRequirements: jsonb("structured_requirements"), 
  status: text("status").default("draft"),
  budget: integer("budget"),
  createdAt: timestamp("created_at").defaultNow(),
});


export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  rfpId: integer("rfp_id").references(() => rfps.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  status: text("status").default("sent"),
  rawContent: text("raw_content"),
  extractedData: jsonb("extracted_data"), 
  aiScore: integer("ai_score"),
  aiSummary: text("ai_summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rfpsRelations = relations(rfps, ({ many }) => ({
  proposals: many(proposals),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  rfp: one(rfps, { fields: [proposals.rfpId], references: [rfps.id] }),
  vendor: one(vendors, { fields: [proposals.vendorId], references: [vendors.id] }),
}));
