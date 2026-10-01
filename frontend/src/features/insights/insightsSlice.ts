import { createSlice } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { insightsApi } from "../../api/insightsApi";
import type {
  ApiError,
  Insight,
  Pagination,
  PromptRequest,
} from "../../types/insight";
import type { RootState } from "../../app/store";

type Status = "idle" | "success" | "needs_clarification";

interface InsightsState {
  /** Last submitted request (without contextId). Source for "Load more". */
  request: PromptRequest | null;
  contextId: string | null;
  status: Status;
  message: string | null;
  items: Insight[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: ApiError | null;
}

const initialState: InsightsState = {
  request: null,
  contextId: null,
  status: "idle",
  message: null,
  items: [],
  pagination: null,
  isLoading: false,
  error: null,
};

function toApiError(payload: unknown): ApiError {
  const err = payload as FetchBaseQueryError | undefined;

  if (err && "data" in err && typeof err.data === "object" && err.data) {
    const { error, message } = err.data as Record<string, unknown>;
    if (typeof error === "string" && typeof message === "string") {
      return { code: error, message };
    }
  }

  if (err && err.status === "FETCH_ERROR") {
    return {
      code: "NETWORK_ERROR",
      message: "Unable to reach the server. Please try again.",
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Something went wrong. Please try again.",
  };
}

const { submitPrompt } = insightsApi.endpoints;

const insightsSlice = createSlice({
  name: "insights",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(submitPrompt.matchPending, (state, action) => {
        const { page, prompt, targetLanguage } =
          action.meta.arg.originalArgs;

        state.isLoading = true;
        state.error = null;

        if (page === 1) {
          // New search: reset everything tied to the previous one.
          state.request = { prompt, targetLanguage };
          state.items = [];
          state.pagination = null;
          state.status = "idle";
          state.message = null;
        }
      })
      .addMatcher(submitPrompt.matchFulfilled, (state, action) => {
        const { page, prompt, targetLanguage } =
          action.meta.arg.originalArgs;
        const response = action.payload;

        state.isLoading = false;

        if (page === 1) {
          // Guard against a stale page-1 response from an older submit.
          if (
            state.request?.prompt !== prompt ||
            state.request?.targetLanguage !== targetLanguage
          ) {
            return;
          }
          state.contextId = response.contextId ?? state.contextId;
          state.status =
            response.status === "NEEDS_CLARIFICATION"
              ? "needs_clarification"
              : "success";
          state.message = response.message ?? null;
          state.items = response.insights;
          state.pagination = response.pagination ?? null;
          return;
        }

        // "Load more": only accept the page that directly follows the
        // current one, for the request that is still current.
        const isCurrent =
          state.request?.prompt === prompt &&
          state.request?.targetLanguage === targetLanguage &&
          state.pagination?.page === page - 1;

        if (!isCurrent) return;

        const known = new Set(state.items.map((i) => i.id));
        state.items.push(...response.insights.filter((i) => !known.has(i.id)));
        state.pagination = response.pagination ?? state.pagination;
      })
      .addMatcher(submitPrompt.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = toApiError(action.payload);
      });
  },
});

export const selectInsights = (state: RootState) => state.insights;

export default insightsSlice.reducer;
