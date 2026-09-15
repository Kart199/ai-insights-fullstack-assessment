
import { useState } from "react";
import { useDispatch } from "react-redux";

import {
  promptSchema,
  type PromptFormData,
} from "../features/prompt/promptSchema";

import {
  setRequest,
  setResponse,
} from "../features/insights/insightsSlice";

import { useSubmitPromptMutation } from "../api/insightsApi";

import type { Insight } from "../types/insight";

import ResultsList from "./ResultsList";

function PromptForm() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<PromptFormData>({
    prompt: "",
    targetLanguage: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof PromptFormData, string>>
  >({});

  const [page, setPage] = useState(1);
  const [allInsights, setAllInsights] = useState<Insight[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [message, setMessage] = useState("");

  const [submitPrompt, { isLoading, error }] =
    useSubmitPromptMutation();

  const validate = () => {
    const result = promptSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: typeof errors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof PromptFormData;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const isValid = promptSchema.safeParse(formData).success;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) return;

    setMessage("");
    setAllInsights([]);
    setHasNext(false);

    try {
      // Store the request in global Redux state
      dispatch(setRequest(formData));

      const response = await submitPrompt({
        ...formData,
        page: 1,
        pageSize: 10,
      }).unwrap();

      // Store the response in global Redux state
      dispatch(setResponse(response));

      setPage(1);

      if (response.status === "NEEDS_CLARIFICATION") {
        setMessage(
          response.message ?? "Please provide more details"
        );
        return;
      }

      setAllInsights(response.insights);
      setHasNext(response.pagination?.hasNext ?? false);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  const handleLoadMore = async () => {
    try {
      const nextPage = page + 1;

      const response = await submitPrompt({
        ...formData,
        page: nextPage,
        pageSize: 10,
      }).unwrap();

      dispatch(setResponse(response));

      setAllInsights((previous) => [
        ...previous,
        ...response.insights,
      ]);

      setPage(nextPage);
      setHasNext(response.pagination?.hasNext ?? false);
    } catch (err) {
      console.error("Load more error:", err);
    }
  };

  const apiErrorMessage =
    error &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data
      ? String(error.data.message)
      : "Something went wrong. Please try again.";

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="prompt">
          Prompt
        </label>

        <textarea
          id="prompt"
          value={formData.prompt}
          placeholder="Enter your prompt..."
          onChange={(event) =>
            setFormData((previous) => ({
              ...previous,
              prompt: event.target.value,
            }))
          }
        />

        {errors.prompt && (
          <p>{errors.prompt}</p>
        )}
      </div>

      <div>
        <label htmlFor="targetLanguage">
          Target Language
        </label>

        <select
          id="targetLanguage"
          value={formData.targetLanguage}
          onChange={(event) =>
            setFormData((previous) => ({
              ...previous,
              targetLanguage: event.target.value,
            }))
          }
        >
          <option value="">
            Select language
          </option>

          <option value="en">
            English
          </option>

          <option value="es">
            Spanish
          </option>

          <option value="fr">
            French
          </option>

          <option value="de">
            German
          </option>
        </select>

        {errors.targetLanguage && (
          <p>{errors.targetLanguage}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isValid || isLoading}
      >
        {isLoading
          ? "Submitting..."
          : "Submit"}
      </button>

      {message && (
        <p>{message}</p>
      )}

      {error && (
        <p>{apiErrorMessage}</p>
      )}

      {allInsights.length > 0 && (
        <>
          <ResultsList
            insights={allInsights}
          />

          {hasNext && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading
                ? "Loading..."
                : "Load More"}
            </button>
          )}
        </>
      )}
    </form>
  );
}

export default PromptForm;

