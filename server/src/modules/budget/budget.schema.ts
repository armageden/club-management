import { z } from "zod";

export const expenditureCategories = [
  "venue",
  "catering",
  "swag",
  "prizes",
  "marketing",
  "other",
] as const;

export const sponsorTiers = [
  "title",
  "platinum",
  "gold",
  "silver",
  "bronze",
  "community",
] as const;

export const createContributionSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid Event ID format"),
    sponsorName: z.string().min(2, "Sponsor name must be at least 2 characters").max(255),
    contactName: z.string().max(255).optional(),
    contactEmail: z.string().email("Invalid email format").optional(),
    tier: z.enum(sponsorTiers).optional(),
    contributionType: z.enum(["cash", "in_kind"]),
    amount: z.number().nonnegative("Amount must be zero or positive"),
    description: z.string().max(2000).optional(),
    receivedAt: z.string().datetime().optional(),
  }),
});

export const createExpenditureSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid Event ID format"),
    category: z.enum(expenditureCategories),
    amount: z.number().nonnegative("Amount must be zero or positive"),
    vendor: z.string().max(255).optional(),
    description: z.string().max(2000).optional(),
    spentAt: z.string().datetime().optional(),
  }),
});

export const listLedgerSchema = z.object({
  params: z.object({
    eventId: z.string().uuid("Invalid Event ID format"),
  }),
});

export type CreateContributionInput = z.infer<typeof createContributionSchema>["body"];
export type CreateExpenditureInput = z.infer<typeof createExpenditureSchema>["body"];
