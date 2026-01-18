export type Vendor = {
  id: number;
  name: string;
  email: string;
  contactPerson: string;
  category: string;
  createdAt: string;
};

export type Proposal = {
  id: number;
  rfpId: number;
  vendorId: number;
  vendor: Vendor;
  status: string;
  rawContent: string;
  extractedData?: Object;
  aiScore?: number;
  aiSummary?: string;
  createdAt: string;
};

export type RFP = {
  id: number;
  title: string;
  originalRequest: string;
  createdAt: string;
  status: "draft" | "active" | "closed";
  budget: number;
  structuredRequirements: Object;
  proposals: Proposal[];
  aiRecommendation?: string;
};
