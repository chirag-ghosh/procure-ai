import { GoogleGenAI } from "@google/genai";
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateJSonResponse(prompt: string) {
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      responseMimeType: "application/json"
    },
    contents: prompt
  });
  
  return response.text;
}

export const aiService = {
  async parseRfpRequest(userPrompt: string) {
    const prompt = `
      You are a procurement expert. Convert the user's request into a structured Request for Proposal (RFP).
      
      User Request: "${userPrompt}"

      Output strictly valid JSON with this schema:
      {
        "title": "Short descriptive title",
        "budget": number (or null if not specified),
        "currency": "USD",
        "requirements": [
          { "item": "Name of item", "quantity": number, "specs": "Technical details" }
        ],
        "timeline": "Delivery deadline or timeframe",
        "paymentTerms": "e.g., Net 30"
      }
    `;

    try {
      return JSON.parse(await generateJSonResponse(prompt));
    } catch (error) {
      console.error("AI RFP Parsing Error:", error);
      throw new Error("Failed to parse RFP request");
    }
  },

  async parseVendorResponse(emailBody: string) {
    const prompt = `
      You are a data extraction AI. Extract key proposal details from this vendor email.

      Email Content:
      """
      ${emailBody}
      """

      Output strictly valid JSON with this schema:
      {
        "totalPrice": number,
        "currency": "string", (Example: USD. Donot use symbols)
        "deliveryDate": "YYYY-MM-DD" or string description,
        "warranty": "string description",
        "itemsIncluded": ["list of items mentioned"]
      }
    `;

    try {
      return JSON.parse(await generateJSonResponse(prompt));
    } catch (error) {
      console.error("AI Vendor Parsing Error:", error);
      throw new Error("Failed to parse vendor response");
    }
  },

  async generateRecommendation(rfp: any, proposals: any[]) {
    if (!proposals || proposals.length === 0) return [];

    const rfpContext = {
      title: rfp.title,
      budget: rfp.budget,
      requirements: rfp.structuredRequirements, 
    };

    const proposalsContext = proposals.map((p) => ({
      id: p.id,
      vendor: p.vendor?.name,
      extractedData: p.extractedData,
    }));

    const prompt = `
      You are a Procurement Evaluator. Grade the following proposals against the RFP requirements.

      RFP REQUIREMENTS:
      ${JSON.stringify(rfpContext)}

      PROPOSALS TO EVALUATE:
      ${JSON.stringify(proposalsContext)}

      TASK:
      For EACH proposal, provide:
      1. "score": A number 0-100 based on fit (Budget, Specs, Delivery).
      2. "summary": A concise 1-sentence explanation of the score (mention pros/cons).

      OUTPUT JSON ARRAY:
      [
        { "proposalId": 101, "score": 85, "summary": "Within budget but delivery is slow." },
        { "proposalId": 102, "score": 40, "summary": "Too expensive and missing specs." }
      ]
    `;

    try {
      return JSON.parse(await generateJSonResponse(prompt));
    } catch (error) {
      console.error("AI Scoring Error:", error);
      return [];
    }
  }
};
