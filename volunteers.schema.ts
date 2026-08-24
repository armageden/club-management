import { z } from "zod";

export const createShiftSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid Event ID format"),
    title: z.string().min(3).max(255),
    description: z.string().optional(),
    location: z.string().max(255).optional(),
    startsAt: z.string().datetime("Invalid start time ISO format"),
    endsAt: z.string().datetime("Invalid end time ISO format"),
    capacity: z.number().int().min(1).default(1),
    requiredSkills: z.string().optional(),
    status: z.enum(["open", "full", "cancelled"]).default("open"),
  }),
});

export const assignVolunteerSchema = z.object({
  body: z.object({
    shiftId: z.string().uuid("Invalid Shift ID format"),
    userId: z.string().uuid("Invalid User ID format"),
  }),
});

export const updateAssignmentStatusSchema = z.object({
  params: z.object({
    assignmentId: z.string().uuid("Invalid Assignment ID format"),
  }),
  body: z.object({
    status: z.enum(["assigned", "checked_in", "completed", "no_show"]),
  }),
});

export type CreateShiftInput = z.infer<typeof createShiftSchema>["body"];
export type AssignVolunteerInput = z.infer<typeof assignVolunteerSchema>["body"];
export type UpdateAssignmentStatusInput = z.infer<typeof updateAssignmentStatusSchema>["body"];