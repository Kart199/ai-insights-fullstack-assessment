import { useMemo, useState } from "react";
import type { Insight } from "../types/insight";
import useDebounce from "../hooks/useDebounce";

interface ResultsListProps {
  insights: Insight[];
}

function ResultsList({ insights }: ResultsListProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const debouncedSearch = useDebounce(search, 300);

  const filteredAndSortedInsights = useMemo(() => {
    const searchTerm = debouncedSearch.toLowerCase().trim();

    const filtered = insights.filter((insight) => {
      return (
        insight.title.toLowerCase().includes(searchTerm) ||
        insight.text.toLowerCase().includes(searchTerm) ||
        insight.metadata.category
          .toLowerCase()
          .includes(searchTerm) ||
        insight.metadata.source
          .toLowerCase()
          .includes(searchTerm)
      );
    });

    return [...filtered].sort((a, b) => {
      const comparison =
        Number(a.id) - Number(b.id);

      return sortOrder === "asc"
        ? comparison
        : -comparison;
    });
  }, [insights, debouncedSearch, sortOrder]);

  if (insights.length === 0) {
    return <p>No insights found.</p>;
  }

  return (
    <section className="results">
      <div className="results-header">
        <div>
          <h2>Insights</h2>

          <p>
            Showing {filteredAndSortedInsights.length} of{" "}
            {insights.length} insights
          </p>
        </div>

        <div className="results-controls">
          <input
            type="text"
            placeholder="Search insights..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(
                event.target.value as "asc" | "desc"
              )
            }
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
      </div>

      <div className="insights">
        {filteredAndSortedInsights.map((insight) => (
          <article
            className="insight-card"
            key={insight.id}
          >
            <h3>{insight.title}</h3>

            <p>{insight.text}</p>

            <div className="metadata">
              <span>
                Category: {insight.metadata.category}
              </span>

              <span>
                Source: {insight.metadata.source}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ResultsList;