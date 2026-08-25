import { Request, Response, NextFunction } from "express";
import * as incidentService from "./incidents.service.js";
import { createIncidentSchema, updateIncidentStatusSchema } from "./incidents.schema.js";

export const createIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createIncidentSchema.parse({ body: req.body });
    const reportedBy = (req as any).user?.id;
    const incident = await incidentService.createIncidentInDb(validated.body, reportedBy);
    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
};

export const updateIncidentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = updateIncidentStatusSchema.parse({ params: req.params, body: req.body });
    const updated = await incidentService.updateIncidentStatusInDb(validated.params.incidentId, validated.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const listIncidents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.query.eventId as string;
    const incidents = await incidentService.listIncidentsFromDb(eventId);
    res.status(200).json({ success: true, data: incidents });
  } catch (error) {
    next(error);
  }
};

export const getOperationalAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.params.eventId as string;
    const analytics = await incidentService.getOperationalAnalyticsFromDb(eventId);
    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
};