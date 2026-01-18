import { createTransport } from "nodemailer";
import { connect } from "imap-simple";
import { simpleParser } from "mailparser";
import { PDFParse } from "pdf-parse";

const transporter = createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const emailService = {
  async sendRfp(vendor: any, rfpData: any) {
    const subject = `[RFP-${rfpData.id}] Request for Proposal: ${rfpData.title || "Procurement Request"}`;

    const formatMoney = (amount: number) => 
      amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount) : 'N/A';

    console.log(`Sending tracked email to ${vendor.email}: "${subject}"`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          /* Basic Reset */
          body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background-color: #2c3e50; color: #ffffff; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
          .content { padding: 30px; color: #333333; line-height: 1.6; }
          .table-container { margin: 25px 0; overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          th { background-color: #f8f9fa; border-bottom: 2px solid #e9ecef; padding: 12px; text-align: left; color: #495057; font-weight: 600; }
          td { border-bottom: 1px solid #e9ecef; padding: 12px; vertical-align: top; }
          .terms-box { background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0; border-radius: 4px; }
          .terms-item { margin-bottom: 8px; display: flex; justify-content: space-between; }
          .terms-label { font-weight: 600; color: #555; }
          .footer { background-color: #f4f7f6; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e9ecef; }
          .cta-note { background-color: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; text-align: center; margin-top: 20px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>REQUEST FOR PROPOSAL</h1>
          </div>

          <div class="content">
            <p><strong>Project:</strong> ${rfpData.title}</p>
            <p>Dear ${vendor.contactPerson},</p>
            <p>We invite you to submit a formal quote for the requirements listed below. Please review the specifications and commercial terms carefully.</p>

            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th width="40%">Item / Service</th>
                    <th width="15%" style="text-align: center;">Qty</th>
                    <th width="45%">Specifications & Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${rfpData.structuredRequirements.requirements?.map((item: any) => `
                    <tr>
                      <td style="font-weight: 500;">${item.item}</td>
                      <td style="text-align: center;">${item.quantity}</td>
                      <td style="color: #666;">${item.specs || "Standard Specs"}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <div class="terms-box">
              <h3 style="margin-top: 0; font-size: 16px; color: #2c3e50;">📋 Commercial Requirements</h3>
              
              <div class="terms-item">
                <span class="terms-label">Budget Cap: </span>
                <span>${rfpData.budget ? formatMoney(rfpData.budget) : "Competitive"}</span>
              </div>
              
              <div class="terms-item">
                <span class="terms-label">Delivery Timeline: </span>
                <span>${rfpData.structuredRequirements.timeline || "As soon as possible"}</span>
              </div>
              
              <div class="terms-item">
                <span class="terms-label">Payment Terms: </span>
                <span>${rfpData.structuredRequirements.paymentTerms || "Standard Net 30"}</span>
              </div>
            </div>

            <div class="cta-note">
              <strong>⚠ Submission Instruction:</strong> Please reply directly to this email with your proposal. <br>Do not modify the subject line <code>[RFP-${rfpData.id}]</code>.
            </div>

            <p style="margin-top: 30px;">Best regards,<br><strong>Procurement Team</strong></p>
          </div>

          <div class="footer">
            Reference ID: ${rfpData.id} • Generated by ProcureAI<br>
            Please treat this document as confidential.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"RFP Manager" <${process.env.EMAIL_USER}>`,
      to: vendor.email,
      subject: subject,
      html: htmlContent,
      replyTo: process.env.EMAIL_USER 
    });

    return info;
  },

  async checkInboxForResponses() {
    const config = {
      imap: {
        user: process.env.EMAIL_USER!,
        password: process.env.EMAIL_PASS!,
        host: process.env.IMAP_HOST!,
        port: Number(process.env.IMAP_PORT!),
        tls: true,
        authTimeout: 30000,
        tlsOptions: { 
          rejectUnauthorized: false
        },
      },
    };

    try {
      const connection = await connect(config);

      connection.on("error", (err) => {
        console.warn("IMAP Connection Error:", err);
      });

      await connection.openBox("INBOX");

      const searchCriteria = ["UNSEEN"];
      const fetchOptions = {
        bodies: ["HEADER"], 
        markSeen: false,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      if (messages.length === 0) {
        connection.end();
        return [];
      }

      const rfpRegex = /RFP-(\d+)/i;
      const relevantMessages = messages.filter((msg) => {
        const headerPart = msg.parts.find((p) => p.which === "HEADER");
        const subject = headerPart?.body?.subject?.[0] || "";
        return rfpRegex.test(subject);
      });

      if (relevantMessages.length === 0) {
        console.log("New emails found, but none match an RFP thread.");
        connection.end();
        return [];
      }

      console.log(`Found ${relevantMessages.length} relevant RFP replies. Parsing...`);

      const parsedResults = [];

      for (const msg of relevantMessages) {
        const uid = msg.attributes.uid;

        const fullMsg = await connection.search([['UID', uid]], {
          bodies: [""], 
          markSeen: true
        });

        if (fullMsg.length > 0) {
          const rawSource = fullMsg[0].parts.find((p) => p.which === "")?.body;

          if (rawSource) {
            const parsed = await simpleParser(rawSource);

            const subject = parsed.subject || "";
            const idMatch = subject.match(rfpRegex);
            const rfpId = idMatch ? parseInt(idMatch[1]) : null;

            let combinedText = parsed.text || parsed.html || "";

            if (parsed.attachments && parsed.attachments.length > 0) {
              console.log(`Found ${parsed.attachments.length} attachment(s) for RFP-${rfpId}`);
              
              for (const att of parsed.attachments) {
                if (att.contentType === "application/pdf") {
                  try {
                    console.log(`Parsing PDF: ${att.filename}`);
                    const parser = new PDFParse({ data: att.content })
                    const pdfData = await parser.getText();
                    
                    combinedText += `\n\n--- [ATTACHMENT CONTENT: ${att.filename}] ---\n${pdfData.text}\n-----------------------------------\n`;
                  } catch (err) {
                    console.error(`Failed to parse PDF ${att.filename}:`, err);
                  }
                }
              }
            }

            parsedResults.push({
              rfpId,
              senderEmail: parsed.from?.value[0]?.address || "",
              subject,
              body: combinedText, // Now contains Email Body + PDF Text
            });
          }
        }
      }

      connection.end();
      return parsedResults;

    } catch (error) {
      console.error("IMAP Error:", error);
      return [];
    }
  },
};
