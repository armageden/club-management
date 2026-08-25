import { z } from "zod";

export const createSubmissionSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid Event ID format"),
    teamId: z.string().uuid("Invalid Team ID format"),
    title: z.string().min(3, "Title must be at least 3 characters").max(255),
    description: z.string().optional(),
    repoUrl: z.string().url("Invalid repository URL").max(500).optional(),
    demoUrl: z.string().url("Invalid demo URL").max(500).optional(),
    status: z.enum(["draft", "submitted", "disqualified"]).default("draft"),
  }),
});

export const submitScoreSchema = z.object({
  params: z.object({
    submissionId: z.string().uuid("Invalid Submission ID format"),
  }),
  body: z.object({
    scoreInnovation: z.number().min(0).max(100),
    scoreTechnical: z.number().min(0).max(100),
    scorePresentation: z.number().min(0).max(100),
    scoreUsefulness: z.number().min(0).max(100),
    feedback: z.string().optional(),
  }),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>["body"];
export type SubmitScoreInput = z.infer<typeof submitScoreSchema>["body"];