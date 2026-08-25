import { Request, Response, NextFunction } from "express";
import * as budgetService from "./budget.service.js";
import { createContributionSchema, createExpenditureSchema } from "./budget.schema.js";

export const listLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.params.eventId as string;
    const entries = await budgetService.listLedgerFromDb(eventId);
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

export const getBudgetSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.params.eventId as string;
    const summary = await budgetService.getBudgetSummaryFromDb(eventId);
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

export const createContribution = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createContributionSchema.parse({ body: req.body });
    const recordedBy = (req as any).user?.id;
    const contribution = await budgetService.createContributionInDb(validated.body, recordedBy);
    res.status(201).json({ success: true, data: contribution });
  } catch (error) {
    next(error);
  }
};

export const createExpenditure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createExpenditureSchema.parse({ body: req.body });
    const recordedBy = (req as any).user?.id;
    const expenditure = await budgetService.createExpenditureInDb(validated.body, recordedBy);
    res.status(201).json({ success: true, data: expenditure });
  } catch (error) {
    next(error);
  }
};
