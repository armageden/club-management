import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./projects.repository.js", () => ({
  projectsRepository: {
    listByEvent: vi.fn(),
    findById: vi.fn(),
    findLiveByTeam: vi.fn(),
    findTeamIdByUser: vi.fn(),
    isUserTeamMember: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

import { projectsService } from "./projects.service.js";
import { projectsRepository } from "./projects.repository.js";

const repo = projectsRepository as unknown as Record<string, ReturnType<typeof vi.fn>>;

const EVENT_ID = "evt-1";
const PROJECT_ID = "proj-1";
const TEAM_ID = "team-1";
const USER_ID = "user-1";

const baseProject = {
  id: PROJECT_ID,
  event_id: EVENT_ID,
  team_id: TEAM_ID,
  title: "Robot Arm",
  description: null,
  repo_url: null,
  demo_url: null,
  status: "draft",
  submitted_at: null,
  created_at: new Date(),
  updated_at: new Date(),
};

const viewer = (isOrganizer = false) => ({ id: USER_ID, isOrganizer });
const actor = (isOrganizer = false) => ({ id: USER_ID, isOrganizer });

describe("projectsService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a blank title", async () => {
    await expect(
      projectsService.create(EVENT_ID, { title: "  " }, { id: USER_ID })
    ).rejects.toThrow("Title is required");
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it("rejects a user who is not on any team", async () => {
    repo.findTeamIdByUser.mockResolvedValue(null);
    await expect(
      projectsService.create(EVENT_ID, { title: "X" }, { id: USER_ID })
    ).rejects.toThrow("team");
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it("rejects a second live submission for the same team", async () => {
    repo.findTeamIdByUser.mockResolvedValue(TEAM_ID);
    repo.findLiveByTeam.mockResolvedValue(baseProject);
    await expect(
      projectsService.create(EVENT_ID, { title: "X" }, { id: USER_ID })
    ).rejects.toThrow("already has");
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it("creates a draft with valid data", async () => {
    repo.findTeamIdByUser.mockResolvedValue(TEAM_ID);
    repo.findLiveByTeam.mockResolvedValue(null);
    repo.insert.mockResolvedValue(baseProject);
    const result = await projectsService.create(
      EVENT_ID,
      { title: "Robot Arm", description: "desc", repo_url: "https://github.com/x/y" },
      { id: USER_ID }
    );
    expect(repo.insert).toHaveBeenCalledWith(
      EVENT_ID,
      TEAM_ID,
      expect.objectContaining({ title: "Robot Arm", status: "draft" })
    );
    expect(result).toEqual(baseProject);
  });
});

describe("projectsService.update", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws NotFound when project does not exist", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(
      projectsService.update(EVENT_ID, "ghost", { title: "X" }, actor())
    ).rejects.toThrow("Project not found");
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("locks disqualified projects", async () => {
    repo.findById.mockResolvedValue({ ...baseProject, status: "disqualified" });
    await expect(
      projectsService.update(EVENT_ID, PROJECT_ID, { title: "X" }, actor(true))
    ).rejects.toThrow("locked");
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("lets a team member edit their draft", async () => {
    repo.findById.mockResolvedValue(baseProject);
    repo.isUserTeamMember.mockResolvedValue(true);
    repo.update.mockResolvedValue({ ...baseProject, title: "New" });
    const result = await projectsService.update(
      EVENT_ID,
      PROJECT_ID,
      { title: "New" },
      actor()
    );
    expect(result.title).toBe("New");
  });

  it("blocks a non-member from editing someone else's draft", async () => {
    repo.findById.mockResolvedValue(baseProject);
    repo.isUserTeamMember.mockResolvedValue(false);
    await expect(
      projectsService.update(EVENT_ID, PROJECT_ID, { title: "X" }, actor())
    ).rejects.toThrow("your team");
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("blocks non-organizer edits after submission", async () => {
    repo.findById.mockResolvedValue({ ...baseProject, status: "submitted" });
    repo.isUserTeamMember.mockResolvedValue(true);
    await expect(
      projectsService.update(EVENT_ID, PROJECT_ID, { title: "X" }, actor())
    ).rejects.toThrow("submitted");
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("allows an organizer to override edits after submission", async () => {
    repo.findById.mockResolvedValue({ ...baseProject, status: "submitted" });
    repo.update.mockResolvedValue({ ...baseProject, status: "submitted", title: "Fixed" });
    await projectsService.update(EVENT_ID, PROJECT_ID, { title: "Fixed" }, actor(true));
    expect(repo.update).toHaveBeenCalled();
  });
});

describe("projectsService.submit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws NotFound when project does not exist", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(projectsService.submit(EVENT_ID, "ghost", { id: USER_ID })).rejects.toThrow(
      "Project not found"
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("rejects a non-member submitter", async () => {
    repo.findById.mockResolvedValue(baseProject);
    repo.isUserTeamMember.mockResolvedValue(false);
    await expect(projectsService.submit(EVENT_ID, PROJECT_ID, { id: USER_ID })).rejects.toThrow(
      "your team"
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("rejects double submission", async () => {
    repo.findById.mockResolvedValue({
      ...baseProject,
      status: "submitted",
      submitted_at: new Date(),
    });
    await expect(projectsService.submit(EVENT_ID, PROJECT_ID, { id: USER_ID })).rejects.toThrow(
      "already been submitted"
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("submits a draft and stamps submitted_at", async () => {
    repo.findById.mockResolvedValue(baseProject);
    repo.isUserTeamMember.mockResolvedValue(true);
    repo.update.mockResolvedValue({ ...baseProject, status: "submitted" });
    await projectsService.submit(EVENT_ID, PROJECT_ID, { id: USER_ID });
    expect(repo.update).toHaveBeenCalledWith(
      EVENT_ID,
      PROJECT_ID,
      expect.objectContaining({ status: "submitted", submitted_at: expect.any(String) })
    );
  });
});

describe("projectsService.get / list / disqualify", () => {
  beforeEach(() => vi.clearAllMocks());

  it("hides drafts from non-members", async () => {
    repo.findById.mockResolvedValue(baseProject);
    repo.isUserTeamMember.mockResolvedValue(false);
    await expect(projectsService.get(EVENT_ID, PROJECT_ID, viewer())).rejects.toThrow(
      "Project not found"
    );
  });

  it("shows drafts to team members", async () => {
    repo.findById.mockResolvedValue(baseProject);
    repo.isUserTeamMember.mockResolvedValue(true);
    const result = await projectsService.get(EVENT_ID, PROJECT_ID, viewer());
    expect(result.id).toBe(PROJECT_ID);
  });

  it("shows submitted projects to everyone", async () => {
    repo.findById.mockResolvedValue({ ...baseProject, status: "submitted" });
    const result = await projectsService.get(EVENT_ID, PROJECT_ID, viewer());
    expect(result.id).toBe(PROJECT_ID);
    expect(repo.isUserTeamMember).not.toHaveBeenCalled();
  });

  it("shows disqualified projects to their own team", async () => {
    repo.findById.mockResolvedValue({ ...baseProject, status: "disqualified" });
    repo.isUserTeamMember.mockResolvedValue(true);
    const result = await projectsService.get(EVENT_ID, PROJECT_ID, viewer());
    expect(result.status).toBe("disqualified");
  });

  it("hides disqualified projects from non-members", async () => {
    repo.findById.mockResolvedValue({ ...baseProject, status: "disqualified" });
    repo.isUserTeamMember.mockResolvedValue(false);
    await expect(projectsService.get(EVENT_ID, PROJECT_ID, viewer())).rejects.toThrow(
      "Project not found"
    );
  });

  it("shows disqualified projects to organizers without membership", async () => {
    repo.findById.mockResolvedValue({ ...baseProject, status: "disqualified" });
    const result = await projectsService.get(EVENT_ID, PROJECT_ID, viewer(true));
    expect(result.status).toBe("disqualified");
  });

  it("passes the viewer to list for SQL-side visibility filtering", async () => {
    repo.listByEvent.mockResolvedValue([]);
    await projectsService.list(EVENT_ID, viewer(true));
    expect(repo.listByEvent).toHaveBeenCalledWith(EVENT_ID, USER_ID, true);
  });

  it("disqualifies a project by organizer action", async () => {
    repo.findById.mockResolvedValue({ ...baseProject, status: "submitted" });
    repo.update.mockResolvedValue({ ...baseProject, status: "disqualified" });
    await projectsService.disqualify(EVENT_ID, PROJECT_ID);
    expect(repo.update).toHaveBeenCalledWith(EVENT_ID, PROJECT_ID, {
      status: "disqualified",
    });
  });

  it("throws NotFound when disqualifying a missing project", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(projectsService.disqualify(EVENT_ID, "ghost")).rejects.toThrow(
      "Project not found"
    );
  });
});
