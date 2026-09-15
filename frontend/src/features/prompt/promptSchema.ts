import { z } from "zod";

export const promptSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required"),

  targetLanguage: z
    .string()
    .min(1, "Please select a target language"),
});

export type PromptFormData = z.infer<typeof promptSchema>;