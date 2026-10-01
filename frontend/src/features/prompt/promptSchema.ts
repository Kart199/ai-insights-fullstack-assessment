import { z } from "zod";
import { LANGUAGE_CODES } from "../../constants/languages";

export const promptSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required"),
  targetLanguage: z.enum(LANGUAGE_CODES, {
    error: "Please select a target language",
  }),
});

export type PromptFormData = z.infer<typeof promptSchema>;
