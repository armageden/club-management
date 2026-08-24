import { Request, Response, NextFunction } from "express";
import * as submissionService from "./submissions.service.js";

const getParam = (params: Record<string, unknown>, key: string): string => {
  const value = params[key];
  return Array.isArray(value) ? value[0] : (value as string);
};

export const createSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = await submissionService.createSubmissionInDb(req.body);
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

export const submitScore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissionId = getParam(req.params, "submissionId");
    const judgeId = (req as any).user.id; 
    const score = await submissionService.submitScoreInDb(submissionId, judgeId, req.body);
    res.status(200).json({ success: true, data: score });
  } catch (error) {
    next(error);
  }
};

export const listSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.query.eventId as string;
    const submissions = await submissionService.listSubmissionsFromDb(eventId);
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};

export const listTeams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.query.eventId as string;
    const teams = await submissionService.listTeamsFromDb(eventId);
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createdBy = (req as any).user?.id;
    const team = await submissionService.createTeamInDb({
      eventId: req.body.eventId,
      name: req.body.name,
      createdBy,
    });
    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params, "eventId");
    const leaderboard = await submissionService.getLeaderboardFromDb(eventId);
    res.status(200).json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
};