import { teamsRepository } from "./teams.repository.js";
import { participantsRepository } from "../participants/participants.repository.js";
import { NotFoundError, ConflictError, ValidationError, AuthorizationError } from "../../middleware/error.middleware.js";

export const teamsService = {
  async listTeams(eventId: string) {
    return teamsRepository.listByEvent(eventId);
  },

  async getTeam(eventId: string, teamId: string) {
    const team = await teamsRepository.findById(eventId, teamId);
    if (!team) throw new NotFoundError("Team not found");
    return team;
  },

  async createTeam(eventId: string, userId: string, name: string, description?: string, maxSize?: number) {
    if (!name || name.trim().length === 0) throw new ValidationError("Team name is required");
    if (maxSize !== undefined && maxSize < 1) throw new ValidationError("Max size must be at least 1");

    const hasTeam = await teamsRepository.hasTeamInEvent(eventId, userId);
    if (hasTeam) throw new ConflictError("You are already in a team for this event");

    const team = await teamsRepository.create(
      eventId,
      name.trim(),
      description || null,
      maxSize || 5,
      userId
    );
    return teamsRepository.findById(eventId, team.id);
  },

  async updateTeam(eventId: string, teamId: string, userId: string, fields: { name?: string; description?: string; max_size?: number; status?: string }) {
    const team = await teamsRepository.findById(eventId, teamId);
    if (!team) throw new NotFoundError("Team not found");

    const isOwner = await teamsRepository.isOwner(teamId, userId);
    if (!isOwner) throw new AuthorizationError("Only the team owner can update the team");

    if (fields.max_size !== undefined) {
      const memberCount = await teamsRepository.getMemberCount(teamId);
      if (fields.max_size < memberCount) {
        throw new ValidationError(`Cannot set max size to ${fields.max_size}: team already has ${memberCount} members`);
      }
    }

    const updated = await teamsRepository.update(eventId, teamId, fields);
    return teamsRepository.findById(eventId, teamId);
  },

  async deleteTeam(eventId: string, teamId: string, userId: string) {
    const team = await teamsRepository.findById(eventId, teamId);
    if (!team) throw new NotFoundError("Team not found");

    const isOwner = await teamsRepository.isOwner(teamId, userId);
    if (!isOwner) throw new AuthorizationError("Only the team owner can delete the team");

    return teamsRepository.delete(eventId, teamId);
  },

  async deleteTeamByOrganizer(eventId: string, teamId: string) {
    const team = await teamsRepository.findById(eventId, teamId);
    if (!team) throw new NotFoundError("Team not found");
    return teamsRepository.delete(eventId, teamId);
  },

  async forceJoinTeam(eventId: string, teamId: string, targetUserId: string) {
    const team = await teamsRepository.findById(eventId, teamId);
    if (!team) throw new NotFoundError("Team not found");
    if (team.status === "dissolved") throw new ValidationError("Cannot join a dissolved team");

    const alreadyMember = await teamsRepository.isMember(teamId, targetUserId);
    if (alreadyMember) throw new ConflictError("User is already a member of this team");

    const memberCount = await teamsRepository.getMemberCount(teamId);
    if (memberCount >= team.max_size) throw new ConflictError("Team is full");

    const member = await teamsRepository.addMember(teamId, targetUserId);

    if (memberCount + 1 >= team.max_size) {
      await teamsRepository.update(eventId, teamId, { status: "full" });
    }

    return member;
  },

  async joinTeam(eventId: string, teamId: string, userId: string) {
    const team = await teamsRepository.findById(eventId, teamId);
    if (!team) throw new NotFoundError("Team not found");
    if (team.status === "dissolved") throw new ValidationError("Cannot join a dissolved team");

    const alreadyMember = await teamsRepository.isMember(teamId, userId);
    if (alreadyMember) throw new ConflictError("You are already a member of this team");

    const hasOtherTeam = await teamsRepository.hasTeamInEvent(eventId, userId);
    if (hasOtherTeam) throw new ConflictError("You are already in a team for this event");

    const memberCount = await teamsRepository.getMemberCount(teamId);
    if (memberCount >= team.max_size) throw new ConflictError("Team is full");

    const member = await teamsRepository.addMember(teamId, userId);

    if (memberCount + 1 >= team.max_size) {
      await teamsRepository.update(eventId, teamId, { status: "full" });
    }

    return member;
  },

  async leaveTeam(eventId: string, teamId: string, userId: string) {
    const team = await teamsRepository.findById(eventId, teamId);
    if (!team) throw new NotFoundError("Team not found");

    const isMember = await teamsRepository.isMember(teamId, userId);
    if (!isMember) throw new ValidationError("You are not a member of this team");

    const isOwner = await teamsRepository.isOwner(teamId, userId);
    if (isOwner) throw new ValidationError("Team owners cannot leave. Transfer ownership or delete the team.");

    await teamsRepository.removeMember(teamId, userId);

    const memberCount = await teamsRepository.getMemberCount(teamId);
    if (memberCount < team.max_size && team.status === "full") {
      await teamsRepository.update(eventId, teamId, { status: "forming" });
    }

    return { message: "Left the team" };
  },

  async removeMember(eventId: string, teamId: string, targetUserId: string, requesterId: string) {
    const team = await teamsRepository.findById(eventId, teamId);
    if (!team) throw new NotFoundError("Team not found");

    const isOwner = await teamsRepository.isOwner(teamId, requesterId);
    if (!isOwner) throw new AuthorizationError("Only the team owner can remove members");

    if (targetUserId === requesterId) throw new ValidationError("Cannot remove yourself. Use leave team instead.");

    const removed = await teamsRepository.removeMember(teamId, targetUserId);
    if (!removed) throw new NotFoundError("User is not a member of this team");

    const memberCount = await teamsRepository.getMemberCount(teamId);
    if (memberCount < team.max_size && team.status === "full") {
      await teamsRepository.update(eventId, teamId, { status: "forming" });
    }

    return { message: "Member removed" };
  },

  async applyToTeam(eventId: string, teamId: string, userId: string, message?: string) {
    const team = await teamsRepository.findById(eventId, teamId);
    if (!team) throw new NotFoundError("Team not found");
    if (team.status === "dissolved") throw new ValidationError("Cannot apply to a dissolved team");

    const hasOtherTeam = await teamsRepository.hasTeamInEvent(eventId, userId);
    if (hasOtherTeam) throw new ConflictError("You are already in a team for this event");

    const profile = await participantsRepository.findProfileByEventAndUser(eventId, userId);
    if (!profile) throw new ValidationError("You must create a participant profile first");

    const memberCount = await teamsRepository.getMemberCount(teamId);
    if (memberCount >= team.max_size) throw new ConflictError("Team is full");

    const application = await teamsRepository.createApplication(teamId, profile.id, message || null);
    if (!application) throw new ConflictError("You already have a pending application to this team");

    return application;
  },

  async listApplications(teamId: string, userId: string) {
    const isMember = await teamsRepository.isMember(teamId, userId);
    if (!isMember) throw new AuthorizationError("Only team members can view applications");

    return teamsRepository.listApplications(teamId);
  },

  async reviewApplication(eventId: string, applicationId: string, status: string, reviewerId: string) {
    if (!["approved", "rejected"].includes(status)) {
      throw new ValidationError("Status must be 'approved' or 'rejected'");
    }

    const application = await teamsRepository.getApplicationById(applicationId);
    if (!application) throw new NotFoundError("Application not found");
    if (application.status !== "pending") throw new ConflictError("Application has already been reviewed");

    const isOwner = await teamsRepository.isOwner(application.team_id, reviewerId);
    if (!isOwner) throw new AuthorizationError("Only the team owner can review applications");

    const team = await teamsRepository.findById(eventId, application.team_id);
    if (!team) throw new NotFoundError("Team not found");

    if (status === "approved") {
      const memberCount = await teamsRepository.getMemberCount(application.team_id);
      if (memberCount >= team.max_size) throw new ConflictError("Team is full");

      const profile = await participantsRepository.findProfileByEventAndUser(eventId, application.user_id);
      if (!profile) throw new NotFoundError("Participant profile not found");

      await teamsRepository.addMember(application.team_id, profile.user_id, reviewerId);

      const newCount = memberCount + 1;
      if (newCount >= team.max_size) {
        await teamsRepository.update(eventId, application.team_id, { status: "full" });
      }
    }

    const updated = await teamsRepository.updateApplication(applicationId, status, reviewerId);
    return updated;
  },

  async autoAssign(eventId: string, maxSize: number = 5) {
    return teamsRepository.autoAssignSoloParticipants(eventId, maxSize);
  },
};
