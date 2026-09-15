export interface PromptRequest {
  prompt: string;
  targetLanguage: string;
  contextId?: string;
}

export interface Insight {
  id: string;
  title: string;
  text: string;
  metadata: {
    category: string;
    source: string;
  };
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
}

export interface InsightsResponse {
  status: "SUCCESS" | "NEEDS_CLARIFICATION";
  message?: string;
  insights: Insight[];
  pagination?: Pagination;
}