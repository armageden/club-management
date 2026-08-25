import { Request, Response, NextFunction } from "express";
import * as volunteerService from "./volunteers.service.js";
import { createShiftSchema, assignVolunteerSchema, updateAssignmentStatusSchema } from "./volunteers.schema.js";

const getParam = (params: Record<string, unknown>, key: string): string => {
  const value = params[key];
  return Array.isArray(value) ? value[0] : (value as string);
};

export const createShift = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createShiftSchema.parse({ body: req.body });
    const shift = await volunteerService.createShiftInDb(validated.body);
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

export const assignVolunteer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = assignVolunteerSchema.parse({ body: req.body });
    const assignedBy = (req as any).user?.id;
    const assignment = await volunteerService.assignVolunteerToShiftInDb(validated.body, assignedBy);
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const updateAssignmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = updateAssignmentStatusSchema.parse({ params: req.params, body: req.body });
    const updated = await volunteerService.updateAssignmentStatusInDb(validated.params.assignmentId, validated.body.status);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const getShiftsByEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params, "eventId");
    const shifts = await volunteerService.getShiftsByEventFromDb(eventId);
    res.status(200).json({ success: true, data: shifts });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await volunteerService.listUsersFromDb();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const listAssignmentsByEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params, "eventId");
    const assignments = await volunteerService.listAssignmentsByEventFromDb(eventId);
    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};