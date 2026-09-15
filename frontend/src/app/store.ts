import { configureStore } from "@reduxjs/toolkit";
import { insightsApi } from "../api/insightsApi";
import insightsReducer from "../features/insights/insightsSlice";

export const store = configureStore({
  reducer: {
    [insightsApi.reducerPath]: insightsApi.reducer,
    insights: insightsReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      insightsApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;