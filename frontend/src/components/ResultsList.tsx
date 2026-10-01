import { memo, useMemo, useState } from "react";

import useDebounce from "../hooks/useDebounce";
import type { Insight } from "../types/insight";
import InsightCard from "./InsightCard";

type SortOrder = "asc" | "desc";

interface ResultsListProps {
  insights: Insight[];
  /** Total number of insights on the server (across all pages). */
  total: number;
}

const matches = (insight: Insight, term: string) =>
  [
    insight.title,
    insight.text,
    insight.metadata.category,
    insight.metadata.source,
  ].some((value) => value.toLowerCase().includes(term));

function ResultsList({ insights, total }: ResultsListProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const debouncedSearch = useDebounce(search, 300);

  const visibleInsights = useMemo(() => {
    const term = debouncedSearch.toLowerCase().trim();
    const filtered = term
      ? insights.filter((insight) => matches(insight, term))
      : insights;

    const direction = sortOrder === "asc" ? 1 : -1;

    return [...filtered].sort(
      (a, b) =>
        direction *
        a.title.localeCompare(b.title, undefined, { numeric: true }),
    );
  }, [insights, debouncedSearch, sortOrder]);

  return (
    <section className="results">
      <div className="results-header">
        <div>
          <h2>Insights</h2>
          <p>
            Showing {visibleInsights.length} of {insights.length} loaded
            {total > insights.length && ` (${total} total)`}. Search and sort
            apply to loaded results.
          </p>
        </div>

        <div className="results-controls">
          <input
            type="search"
            aria-label="Search insights"
            placeholder="Search insights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            aria-label="Sort order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
      </div>

      {visibleInsights.length === 0 ? (
        <p>No matching insights found.</p>
      ) : (
        <div className="insights">
          {visibleInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </section>
  );
}

export default memo(ResultsList);
