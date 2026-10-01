import { useMemo, useState } from "react";

import { useSubmitPromptMutation } from "../api/insightsApi";
import { useAppSelector } from "../app/hooks";
import { LANGUAGES, PAGE_SIZE } from "../constants/languages";
import { selectInsights } from "../features/insights/insightsSlice";
import { promptSchema } from "../features/prompt/promptSchema";

interface FormState {
  prompt: string;
  targetLanguage: string;
}

function PromptForm() {
  const [formData, setFormData] = useState<FormState>({
    prompt: "",
    targetLanguage: "",
  });

  const [submitPrompt] = useSubmitPromptMutation();
  const { isLoading, contextId } = useAppSelector(selectInsights);

  const parsed = useMemo(() => promptSchema.safeParse(formData), [formData]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!parsed.success || isLoading) return;

    // Request/response are stored in Redux by insightsSlice (extraReducers).
    void submitPrompt({
      ...parsed.data,
      contextId: contextId ?? undefined,
      page: 1,
      pageSize: PAGE_SIZE,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="prompt">Prompt</label>
        <textarea
          id="prompt"
          value={formData.prompt}
          placeholder="Enter your prompt..."
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, prompt: e.target.value }))
          }
        />
      </div>

      <div>
        <label htmlFor="targetLanguage">Target Language</label>
        <select
          id="targetLanguage"
          value={formData.targetLanguage}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              targetLanguage: e.target.value,
            }))
          }
        >
          <option value="">Select language</option>
          {LANGUAGES.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={!parsed.success || isLoading}>
        {isLoading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export default PromptForm;
