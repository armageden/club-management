import { z } from "zod";

export const createIncidentSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid Event ID format"),
    title: z.string().min(3).max(255),
    description: z.string().optional(),
    severity: z.enum(["low", "medium", "high", "critical"]).default("low"),
    status: z.enum(["open", "investigating", "resolved"]).default("open"),
    location: z.string().max(255).optional(),
    occurredAt: z.string().datetime().optional(),
  }),
});

export const updateIncidentStatusSchema = z.object({
  params: z.object({
    incidentId: z.string().uuid("Invalid Incident ID format"),
  }),
  body: z.object({
    status: z.enum(["open", "investigating", "resolved"]),
    assignedTo: z.string().uuid("Invalid User ID format").optional(),
  }),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>["body"];
export type UpdateIncidentStatusInput = z.infer<typeof updateIncidentStatusSchema>["body"];