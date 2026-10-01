import { afterEach, describe, expect, it, vi } from "vitest";

import { insightsApi } from "../../api/insightsApi";
import { store } from "../../app/store";

const makeInsights = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({
    id: String(from + i),
    title: `Insight ${from + i}`,
    text: "text",
    metadata: { category: "c", source: "s" },
  }));

const mockFetch = (status: number, body: unknown) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );

const submit = (page: number, prompt = "hello world") =>
  store.dispatch(
    insightsApi.endpoints.submitPrompt.initiate({
      prompt,
      targetLanguage: "en",
      page,
      pageSize: 10,
    }),
  );

afterEach(() => vi.unstubAllGlobals());

describe("insightsSlice", () => {
  it("stores request, results and pagination on success", async () => {
    mockFetch(200, {
      status: "SUCCESS",
      contextId: "ctx-1",
      insights: makeInsights(1, 10),
      pagination: { page: 1, pageSize: 10, total: 15, hasNext: true },
    });
    await submit(1);

    const s = store.getState().insights;
    expect(s.status).toBe("success");
    expect(s.items).toHaveLength(10);
    expect(s.request?.prompt).toBe("hello world");
    expect(s.contextId).toBe("ctx-1");
    expect(s.isLoading).toBe(false);
  });

  it("appends the next page without duplicates", async () => {
    mockFetch(200, {
      status: "SUCCESS",
      insights: makeInsights(10, 15), // id 10 overlaps on purpose
      pagination: { page: 2, pageSize: 10, total: 15, hasNext: false },
    });
    await submit(2);

    const s = store.getState().insights;
    expect(s.items).toHaveLength(15);
    expect(s.pagination?.hasNext).toBe(false);
  });

  it("ignores a late load-more response for an older prompt", async () => {
    mockFetch(200, {
      status: "SUCCESS",
      insights: makeInsights(1, 3),
      pagination: { page: 1, pageSize: 10, total: 3, hasNext: false },
    });
    await submit(1, "a brand new prompt");

    mockFetch(200, {
      status: "SUCCESS",
      insights: makeInsights(100, 105),
      pagination: { page: 2, pageSize: 10, total: 99, hasNext: false },
    });
    await submit(2, "hello world"); // stale: different prompt

    expect(store.getState().insights.items).toHaveLength(3);
  });

  it("handles NEEDS_CLARIFICATION", async () => {
    mockFetch(200, {
      status: "NEEDS_CLARIFICATION",
      message: "Please provide more details",
      insights: [],
    });
    await submit(1, "hi");

    const s = store.getState().insights;
    expect(s.status).toBe("needs_clarification");
    expect(s.message).toBe("Please provide more details");
    expect(s.items).toEqual([]);
  });

  it("surfaces structured 4xx errors", async () => {
    mockFetch(400, {
      error: "INVALID_LANGUAGE",
      message: "Target language is not supported",
    });
    await submit(1);

    expect(store.getState().insights.error).toEqual({
      code: "INVALID_LANGUAGE",
      message: "Target language is not supported",
    });
  });
});
