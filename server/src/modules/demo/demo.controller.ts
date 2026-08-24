import type { Request, Response, NextFunction } from "express";
import { demoService } from "./demo.service.js";

export const demoController = {
  async enable(_req: Request, res: Response, next: NextFunction) {
    try {
      const counts = await demoService.enable();
      res.json({ success: true, data: { enabled: true, counts } });
    } catch (err) {
      next(err);
    }
  },

  async disable(_req: Request, res: Response, next: NextFunction) {
    try {
      const removed = await demoService.disable();
      res.json({ success: true, data: { enabled: false, removed } });
    } catch (err) {
      next(err);
    }
  },

  async status(_req: Request, res: Response, next: NextFunction) {
    try {
      const status = await demoService.status();
      res.json({ success: true, data: status });
    } catch (err) {
      next(err);
    }
  },
};
