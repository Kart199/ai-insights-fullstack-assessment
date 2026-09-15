
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  InsightsResponse,
  PromptRequest,
} from "../../types/insight";

interface InsightsState {
  lastRequest: PromptRequest | null;
  lastResponse: InsightsResponse | null;
}

const initialState: InsightsState = {
  lastRequest: null,
  lastResponse: null,
};

const insightsSlice = createSlice({
  name: "insights",
  initialState,
  reducers: {
    setRequest: (
      state,
      action: PayloadAction<PromptRequest>
    ) => {
      state.lastRequest = action.payload;
    },

    setResponse: (
      state,
      action: PayloadAction<InsightsResponse>
    ) => {
      state.lastResponse = action.payload;
    },
  },
});

export const {
  setRequest,
  setResponse,
} = insightsSlice.actions;

export default insightsSlice.reducer;

