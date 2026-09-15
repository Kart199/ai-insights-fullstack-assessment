import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  InsightsResponse,
  PromptRequest,
} from "../types/insight";

export const insightsApi = createApi({
  reducerPath: "insightsApi",

 baseQuery: fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
}),
  endpoints: (builder) => ({
  submitPrompt: builder.mutation<
  InsightsResponse,
  PromptRequest & {
    page?: number;
    pageSize?: number;
  }
>({
  query: ({ page = 1, pageSize = 10, ...body }) => ({
    url: `/insights?page=${page}&pageSize=${pageSize}`,
    method: "POST",
    body,
  }),
}),
  }),
});

export const {
  useSubmitPromptMutation,
} = insightsApi;