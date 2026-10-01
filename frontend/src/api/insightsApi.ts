import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { InsightsResponse, PromptRequest } from "../types/insight";

export interface SubmitPromptArgs extends PromptRequest {
  page: number;
  pageSize: number;
}

export const insightsApi = createApi({
  reducerPath: "insightsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  }),

  endpoints: (builder) => ({
    // POST + conversation side effects => modelled as a mutation.
    // Results/pagination live in the insights slice (see insightsSlice.ts).
    submitPrompt: builder.mutation<InsightsResponse, SubmitPromptArgs>({
      query: ({ page, pageSize, ...body }) => ({
        url: "/insights",
        method: "POST",
        params: { page, pageSize },
        body,
      }),
    }),
  }),
});

export const { useSubmitPromptMutation } = insightsApi;
