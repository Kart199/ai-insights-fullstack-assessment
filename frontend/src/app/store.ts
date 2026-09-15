import { configureStore } from "@reduxjs/toolkit";
import { insightsApi } from "../api/insightsApi";

export const store = configureStore({
  reducer: {
    [insightsApi.reducerPath]: insightsApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(insightsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;