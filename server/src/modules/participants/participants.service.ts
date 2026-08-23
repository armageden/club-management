import { participantsRepository } from "./participants.repository.js";
import { NotFoundError, ValidationError } from "../../middleware/error.middleware.js";

export const participantsService = {
  async getMyProfile(eventId: string, userId: string) {
    return participantsRepository.findProfileByEventAndUser(eventId, userId);
  },

  async listParticipants(eventId: string, lookingForTeam?: boolean) {
    return participantsRepository.listByEvent(eventId, lookingForTeam);
  },

  async createOrUpdateProfile(
    eventId: string,
    userId: string,
    data: {
      bio?: string;
      experience_level?: string;
      preferred_role?: string;
      looking_for_team?: boolean;
      tech_stack_summary?: string;
      tech_stack_tag_ids?: string[];
    }
  ) {
    const profile = await participantsRepository.createProfile(
      eventId,
      userId,
      data.bio || null,
      data.experience_level || null,
      data.preferred_role || null,
      data.looking_for_team || false,
      data.tech_stack_summary || null
    );

    if (data.tech_stack_tag_ids && data.tech_stack_tag_ids.length > 0) {
      await participantsRepository.setTechStack(profile.id, data.tech_stack_tag_ids);
    }

    return participantsRepository.findProfileByEventAndUser(eventId, userId);
  },

  async updateProfile(eventId: string, userId: string, data: {
    bio?: string;
    experience_level?: string;
    preferred_role?: string;
    looking_for_team?: boolean;
    tech_stack_summary?: string;
  }) {
    const profile = await participantsRepository.updateProfile(eventId, userId, data);
    if (!profile) throw new NotFoundError("Profile not found");
    return profile;
  },

  async setTechStack(eventId: string, userId: string, tagIds: string[]) {
    const profile = await participantsRepository.findProfileByEventAndUser(eventId, userId);
    if (!profile) throw new NotFoundError("Profile not found. Create a profile first.");
    await participantsRepository.setTechStack(profile.id, tagIds);
    return participantsRepository.findProfileByEventAndUser(eventId, userId);
  },

  async getTechTags() {
    return participantsRepository.listTechTags();
  },

  async createTechTag(name: string, category?: string) {
    if (!name || name.trim().length === 0) throw new ValidationError("Tag name is required");
    return participantsRepository.createTechTag(name.trim(), category || null);
  },

  async checkHasTeam(eventId: string, userId: string) {
    return participantsRepository.hasTeamInEvent(eventId, userId);
  },
};
