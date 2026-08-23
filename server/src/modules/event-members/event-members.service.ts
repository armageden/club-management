import { eventMembersRepository } from "./event-members.repository.js";
import { NotFoundError } from "../../middleware/error.middleware.js";

export const eventMembersService = {
  async getMembers(eventId: string) {
    return eventMembersRepository.listByEvent(eventId);
  },

  async getMembership(eventId: string, userId: string) {
    return eventMembersRepository.findByEventAndUser(eventId, userId);
  },

  async addMember(eventId: string, userId: string, role: string) {
    return eventMembersRepository.addMember(eventId, userId, role);
  },

  async updateRole(eventId: string, userId: string, role: string) {
    const member = await eventMembersRepository.updateRole(eventId, userId, role);
    if (!member) throw new NotFoundError("Member not found in this event");
    return member;
  },

  async removeMember(eventId: string, userId: string) {
    const removed = await eventMembersRepository.removeMember(eventId, userId);
    if (!removed) throw new NotFoundError("Member not found in this event");
    return removed;
  },

  async getMyRole(eventId: string, userId: string) {
    return eventMembersRepository.getMyRole(eventId, userId);
  },
};
