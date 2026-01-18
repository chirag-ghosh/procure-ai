import { Router } from "express";
import { db } from "./db";
import { rfps, vendors, proposals } from "./schema";
import { aiService } from "./services/ai";
import { emailService } from "./services/email";
import { eq, desc } from "drizzle-orm";
import { syncService } from "./services/sync";

export const rfpRouter = Router();

rfpRouter.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  try {
    const structuredData = await aiService.parseRfpRequest(prompt);

    const [newRfp] = await db
      .insert(rfps)
      .values({
        title: structuredData.title || "New RFP",
        originalRequest: prompt,
        structuredRequirements: structuredData,
        status: "draft",
        budget: structuredData.budget,
      })
      .returning();

    res.json(newRfp);
  } catch (err) {
    res.status(500).json({ error: "AI Processing Failed" });
  }
});

rfpRouter.get("/vendors", async (req, res) => {
  try {
    const allVendors = await db
      .select()
      .from(vendors)
      .orderBy(desc(vendors.createdAt));
      
    res.json(allVendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
})

rfpRouter.get("/rfps", async (req, res) => {
  try {
    const allRfps = await db
      .select()
      .from(rfps)
      .orderBy(desc(rfps.createdAt));

    res.json(allRfps);
  } catch (error) {
    console.error("Error fetching RFPs:", error);
    res.status(500).json({ error: "Failed to fetch RFPs" });
  }
})

rfpRouter.get("/rfps/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const rfp = await db.query.rfps.findFirst({
      where: eq(rfps.id, id),
      with: {
        proposals: {
          with: {
            vendor: true 
          }
        }
      }
    });

    if (!rfp) {
      return res.status(404).json({ error: "RFP not found" });
    }

    res.json(rfp);
  } catch (error) {
    console.error("Error fetching RFP details:", error);
    res.status(500).json({ error: "Failed to fetch RFP details" });
  }
});

rfpRouter.post("/rfps/:id/send", async (req, res) => {
  const rfpId = parseInt(req.params.id);
  const { vendorIds } = req.body; 

  if (!vendorIds || vendorIds.length === 0) {
    return res.status(400).json({ error: "No vendors selected" });
  }

  try {
    const rfp = await db.query.rfps.findFirst({ where: eq(rfps.id, rfpId) });
    const selectedVendors = await db.query.vendors.findMany({
      where: (vendors, { inArray }) => inArray(vendors.id, vendorIds)
    });

    if (!rfp) return res.status(404).json({ error: "RFP not found" });

    const proposalsCreated = [];

    for (const vendor of selectedVendors) {
      await emailService.sendRfp(vendor, rfp);

      const existing = await db.query.proposals.findFirst({
        where: (p, { and, eq }) => and(eq(p.rfpId, rfpId), eq(p.vendorId, vendor.id))
      });

      if (!existing) {
        const [newProp] = await db.insert(proposals).values({
          rfpId,
          vendorId: vendor.id,
          status: "sent"
        }).returning();
        proposalsCreated.push(newProp);
      }
    }

    await db.update(rfps).set({ status: "active" }).where(eq(rfps.id, rfpId));

    res.json({ 
      success: true, 
      sentCount: selectedVendors.length,
      proposalsCreated: proposalsCreated.length 
    });

  } catch (error) {
    console.error("Send Error:", error);
    res.status(500).json({ error: "Failed to send RFPs" });
  }
});

rfpRouter.post("/sync-emails", async (req, res) => {
  try {
    const result = await syncService.syncProposals();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Manual Sync Error:", error);
    res.status(500).json({ error: "Sync failed" });
  }
});
