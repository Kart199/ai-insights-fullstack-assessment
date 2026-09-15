import { useState } from "react";
import { promptSchema, type PromptFormData } from "../features/prompt/promptSchema";

function PromptForm() {
  const [formData, setFormData] = useState<PromptFormData>({
    prompt: "",
    targetLanguage: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PromptFormData, string>>>({});

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    console.log("Submitting:", formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Prompt</label>

        <textarea
          value={formData.prompt}
          onChange={(event) =>
            setFormData((previous) => ({
              ...previous,
              prompt: event.target.value,
            }))
          }
        />

        {errors.prompt && <p>{errors.prompt}</p>}
      </div>

      <div>
        <label>Target Language</label>

        <select
          value={formData.targetLanguage}
          onChange={(event) =>
            setFormData((previous) => ({
              ...previous,
              targetLanguage: event.target.value,
            }))
          }
        >
          <option value="">Select language</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>

        {errors.targetLanguage && (
          <p>{errors.targetLanguage}</p>
        )}
      </div>

      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
}

export default PromptForm;