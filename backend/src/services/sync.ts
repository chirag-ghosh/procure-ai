import { db } from "../db";
import { proposals, vendors, rfps } from "../schema";
import { emailService } from "./email";
import { aiService } from "./ai";
import { and, eq } from "drizzle-orm";

export const syncService = {
  async syncProposals() {
    console.log("Starting Sync Process...");

    const newEmails = await emailService.checkInboxForResponses();

    if (newEmails.length === 0) {
      console.log("Sync complete. No new emails.");
      return { processed: 0 };
    }

    let processedCount = 0;

    for (const email of newEmails) {
      if (!email.rfpId) continue;

      const vendor = await db.query.vendors.findFirst({
        where: eq(vendors.email, email.senderEmail),
      });

      if (!vendor) {
        console.warn(
          `⚠️ Unknown vendor ${email.senderEmail} for RFP-${email.rfpId}`
        );
        continue;
      }

      console.log(`Processing proposal from ${vendor.name}...`);

      try {
        const extractedData = await aiService.parseVendorResponse(email.body);

        const existingProposal = await db.query.proposals.findFirst({
          where: and(
            eq(proposals.rfpId, email.rfpId),
            eq(proposals.vendorId, vendor.id)
          ),
        });

        if (existingProposal) {
          console.log(
            `Updating proposal ${existingProposal.id} with reply...`
          );

          await db
            .update(proposals)
            .set({
              status: "received",
              rawContent: email.body,
              extractedData: extractedData,
            })
            .where(eq(proposals.id, existingProposal.id));
        }

        const rfpData = await db.query.rfps.findFirst({
          where: eq(rfps.id, email.rfpId),
          with: { proposals: { with: { vendor: true } } },
        });

        if (rfpData && rfpData.proposals.length > 0) {
          console.log(
            `Scoring ${rfpData.proposals.length} proposals for RFP-${rfpData.id}...`
          );

          const scores = await aiService.generateRecommendation(
            rfpData,
            rfpData.proposals
          );

          for (const item of scores) {
            if (!item.proposalId) continue;

            await db
              .update(proposals)
              .set({
                aiScore: item.score,
                aiSummary: item.summary,
              })
              .where(eq(proposals.id, item.proposalId));
          }
          console.log(`Scores updated.`);
        }
      } catch (error) {
        console.error(`Failed to process email from ${vendor.name}`, error);
      }
    }

    console.log(`Sync complete. Processed ${processedCount} proposals.`);
    return { processed: processedCount };
  },
};
