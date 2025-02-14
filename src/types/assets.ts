
export type BrandscriptAnswers = {
  companyName: string;
  productsServices: string;
  targetAudience: string;
  mainProblem: string;
  solution: string;
  differentiation: string;
  authority: string;
  steps: string;
};

export type BusinessInfoAnswers = {
  services: string;
  excludedServices: string;
  locations: string;
  excludedLocations: string;
  priorityService: string;
  phoneNumber: string;
  address: string;
};

export type CustomerPersonasContent = {
  personas: string;
  referenced_assets: string[];
};

export type AssetContent = {
  answers: BrandscriptAnswers | BusinessInfoAnswers;
  brandscript?: string;
  personas?: string;
  problem_statements?: string[];
  referenced_assets?: string[];
};

export type Asset = {
  id: string;
  business_id: string;
  type: 'brandscript' | 'business_info' | 'customer_personas' | 'problem_statements';
  status: 'draft' | 'complete';
  content: AssetContent;
  created_at: string;
  referenced_assets?: string[];
};
