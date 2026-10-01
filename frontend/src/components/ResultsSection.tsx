import { useSubmitPromptMutation } from "../api/insightsApi";
import { useAppSelector } from "../app/hooks";
import { PAGE_SIZE } from "../constants/languages";
import { selectInsights } from "../features/insights/insightsSlice";
import ResultsList from "./ResultsList";

/** Renders whatever the backend last told us: error, clarification or results. */
function ResultsSection() {
  const { request, contextId, status, message, items, pagination, isLoading, error } =
    useAppSelector(selectInsights);
  const [submitPrompt] = useSubmitPromptMutation();

  const handleLoadMore = () => {
    // Always paginate the request that produced the current results,
    // not whatever is currently typed in the form.
    if (!request || !pagination?.hasNext || isLoading) return;

    void submitPrompt({
      ...request,
      contextId: contextId ?? undefined,
      page: pagination.page + 1,
      pageSize: PAGE_SIZE,
    });
  };

  return (
    <>
      {error && (
        <p role="alert" data-code={error.code}>
          {error.message}
        </p>
      )}

      {status === "needs_clarification" && (
        <p role="status">{message ?? "Please provide more details"}</p>
      )}

      {status === "success" && items.length > 0 && (
        <>
          <ResultsList insights={items} total={pagination?.total ?? items.length} />

          {pagination?.hasNext && (
            <button type="button" onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? "Loading..." : "Load More"}
            </button>
          )}
        </>
      )}
    </>
  );
}

export default ResultsSection;
