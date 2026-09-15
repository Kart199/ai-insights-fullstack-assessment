import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  InsightsResponse,
  PromptRequest,
} from "../types/insight";

export const insightsApi = createApi({
  reducerPath: "insightsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api",
  }),

  endpoints: (builder) => ({
    submitPrompt: builder.mutation<
      InsightsResponse,
      PromptRequest
    >({
      query: (body) => ({
        url: "/insights",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useSubmitPromptMutation,
} = insightsApi;