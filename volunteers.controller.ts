import { Request, Response, NextFunction } from "express";
import * as volunteerService from "./volunteers.service.js";

const getParam = (params: Record<string, unknown>, key: string): string => {
  const value = params[key];
  return Array.isArray(value) ? value[0] : (value as string);
};

export const createShift = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shift = await volunteerService.createShiftInDb(req.body);
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

export const assignVolunteer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignedBy = (req as any).user?.id;
    const assignment = await volunteerService.assignVolunteerToShiftInDb(req.body, assignedBy);
    res.status(201).json({ success: true, data: assignment });
  } catch (error: any) {
    if (error.message === "SHIFT_NOT_FOUND") {
      return res.status(404).json({ success: false, error: { message: "Volunteer shift not found" } });
    }
    if (error.message === "SHIFT_FULL") {
      return res.status(400).json({ success: false, error: { message: "Shift capacity reached" } });
    }
    if (error.message === "SCHEDULE_CONFLICT") {
      return res.status(409).json({ success: false, error: { message: "Volunteer already assigned to an overlapping shift" } });
    }
    next(error);
  }
};

export const updateAssignmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignmentId = getParam(req.params, "assignmentId");
    const { status } = req.body;
    const updated = await volunteerService.updateAssignmentStatusInDb(assignmentId, status);
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