import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./judging.repository.js", () => ({
  judgingRepository: {
    listSubmittedProjects: vi.fn(),
    findProjectById: vi.fn(),
    findByProjectAndJudge: vi.fn(),
    insertScore: vi.fn(),
    getLeaderboard: vi.fn(),
  },
}));

import { judgingService } from "./judging.service.js";
import { judgingRepository } from "./judging.repository.js";

const repo = judgingRepository as unknown as Record<string, ReturnType<typeof vi.fn>>;

const EVENT_ID = "evt-1";
const PROJECT_ID = "proj-1";
const JUDGE_ID = "judge-1";

const submittedProject = {
  id: PROJECT_ID,
  event_id: EVENT_ID,
  team_id: "team-1",
  title: "Robot Arm",
  status: "submitted",
  submitted_at: new Date(),
};

const dims = {
  score_innovation: 80,
  score_technical: 70,
  score_presentation: 90,
  score_usefulness: 60,
};

describe("judgingService.score", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws NotFound for a missing project", async () => {
    repo.findProjectById.mockResolvedValue(null);
    await expect(judgingService.score(EVENT_ID, "ghost", dims, { id: JUDGE_ID })).rejects.toThrow(
      "Project not found"
    );
    expect(repo.insertScore).not.toHaveBeenCalled();
  });

  it("rejects scoring a project that is not submitted", async () => {
    repo.findProjectById.mockResolvedValue({ ...submittedProject, status: "draft" });
    await expect(judgingService.score(EVENT_ID, PROJECT_ID, dims, { id: JUDGE_ID })).rejects.toThrow(
      "not been submitted"
    );
    expect(repo.insertScore).not.toHaveBeenCalled();
  });

  it("rejects dimensions outside 0-100", async () => {
    repo.findProjectById.mockResolvedValue(submittedProject);
    await expect(
      judgingService.score(
        EVENT_ID,
        PROJECT_ID,
        { ...dims, score_innovation: 101 },
        { id: JUDGE_ID }
      )
    ).rejects.toThrow("between 0 and 100");
    await expect(
      judgingService.score(
        EVENT_ID,
        PROJECT_ID,
        { ...dims, score_technical: -1 },
        { id: JUDGE_ID }
      )
    ).rejects.toThrow("between 0 and 100");
    expect(repo.insertScore).not.toHaveBeenCalled();
  });

  it("rejects a second score from the same judge", async () => {
    repo.findProjectById.mockResolvedValue(submittedProject);
    repo.findByProjectAndJudge.mockResolvedValue({ id: "score-1" });
    await expect(judgingService.score(EVENT_ID, PROJECT_ID, dims, { id: JUDGE_ID })).rejects.toThrow(
      "already scored"
    );
    expect(repo.insertScore).not.toHaveBeenCalled();
  });

  it("computes a weighted score_total (innovation .3, technical .3, presentation .2, usefulness .2)", async () => {
    repo.findProjectById.mockResolvedValue(submittedProject);
    repo.findByProjectAndJudge.mockResolvedValue(null);
    repo.insertScore.mockResolvedValue({ id: "score-2", score_total: 75 });
    await judgingService.score(
      EVENT_ID,
      PROJECT_ID,
      { ...dims, feedback: "Nice" },
      { id: JUDGE_ID }
    );
    // 80(.3) + 70(.3) + 90(.2) + 60(.2) = 75
    expect(repo.insertScore).toHaveBeenCalledWith(
      EVENT_ID,
      PROJECT_ID,
      JUDGE_ID,
      expect.objectContaining({ ...dims, score_total: 75, feedback: "Nice" })
    );
  });

  it("weights technical-heavy scores higher than an even mean would", async () => {
    repo.findProjectById.mockResolvedValue(submittedProject);
    repo.findByProjectAndJudge.mockResolvedValue(null);
    repo.insertScore.mockResolvedValue({ id: "score-4", score_total: 30 });
    await judgingService.score(
      EVENT_ID,
      PROJECT_ID,
      { score_innovation: 0, score_technical: 100, score_presentation: 0, score_usefulness: 0 },
      { id: JUDGE_ID }
    );
    // 100(.3) = 30, not the even-mean 25
    expect(repo.insertScore).toHaveBeenCalledWith(
      EVENT_ID,
      PROJECT_ID,
      JUDGE_ID,
      expect.objectContaining({ score_total: 30 })
    );
  });

  it("accepts boundary scores of 0 and 100", async () => {
    repo.findProjectById.mockResolvedValue(submittedProject);
    repo.findByProjectAndJudge.mockResolvedValue(null);
    repo.insertScore.mockResolvedValue({ id: "score-3", score_total: 50 });
    await judgingService.score(
      EVENT_ID,
      PROJECT_ID,
      { score_innovation: 0, score_technical: 100, score_presentation: 0, score_usefulness: 100 },
      { id: JUDGE_ID }
    );
    expect(repo.insertScore).toHaveBeenCalled();
  });
});

describe("judgingService.listScorableProjects / leaderboard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists only submitted projects", async () => {
    repo.listSubmittedProjects.mockResolvedValue([submittedProject]);
    const result = await judgingService.listScorableProjects(EVENT_ID);
    expect(result).toEqual([submittedProject]);
    expect(repo.listSubmittedProjects).toHaveBeenCalledWith(EVENT_ID);
  });

  it("returns the SQL-computed leaderboard", async () => {
    const board = [
      {
        project_submission_id: PROJECT_ID,
        project_title: "Robot Arm",
        team_name: "Bits & Bots",
        team_id: "team-1",
        scores: { innovation: 80, technical: 70, presentation: 90, usefulness: 60, total: 75 },
        judge_count: 2,
        rank: 1,
      },
    ];
    repo.getLeaderboard.mockResolvedValue(board);
    const result = await judgingService.leaderboard(EVENT_ID);
    expect(result).toEqual(board);
  });
});
