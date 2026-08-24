import { apiRequest } from "../../lib/api";
import type {
  VenueLocation,
  VenueAssignment,
  CreateVenueLocationRequest,
  UpdateVenueLocationRequest,
  CreateVenueAssignmentRequest,
  UpdateVenueAssignmentRequest,
} from "@/types/api";

const EVENT_ID = "e0000000-0000-0000-0000-000000000001";

export async function listLocations(eventId: string = EVENT_ID): Promise<VenueLocation[]> {
  const res = await apiRequest<{ locations: VenueLocation[] }>(
    `/events/${eventId}/venue/locations`
  );
  return res.locations;
}

export async function createLocation(
  eventId: string = EVENT_ID,
  data: CreateVenueLocationRequest
): Promise<VenueLocation> {
  const res = await apiRequest<{ location: VenueLocation }>(
    `/events/${eventId}/venue/locations`,
    { method: "POST", body: JSON.stringify(data) }
  );
  return res.location;
}

export async function updateLocation(
  eventId: string = EVENT_ID,
  locationId: string,
  data: UpdateVenueLocationRequest
): Promise<VenueLocation> {
  const res = await apiRequest<{ location: VenueLocation }>(
    `/events/${eventId}/venue/locations/${locationId}`,
    { method: "PUT", body: JSON.stringify(data) }
  );
  return res.location;
}

export async function listAssignments(
  eventId: string = EVENT_ID,
  locationId?: string
): Promise<VenueAssignment[]> {
  const query = locationId ? `?location_id=${encodeURIComponent(locationId)}` : "";
  const res = await apiRequest<{ assignments: VenueAssignment[] }>(
    `/events/${eventId}/venue/assignments${query}`
  );
  return res.assignments;
}

export async function createAssignment(
  eventId: string = EVENT_ID,
  data: CreateVenueAssignmentRequest
): Promise<VenueAssignment> {
  const res = await apiRequest<{ assignment: VenueAssignment }>(
    `/events/${eventId}/venue/assignments`,
    { method: "POST", body: JSON.stringify(data) }
  );
  return res.assignment;
}

export async function updateAssignment(
  eventId: string = EVENT_ID,
  assignmentId: string,
  data: UpdateVenueAssignmentRequest
): Promise<VenueAssignment> {
  const res = await apiRequest<{ assignment: VenueAssignment }>(
    `/events/${eventId}/venue/assignments/${assignmentId}`,
    { method: "PUT", body: JSON.stringify(data) }
  );
  return res.assignment;
}

export async function cancelAssignment(
  eventId: string = EVENT_ID,
  assignmentId: string
): Promise<void> {
  await apiRequest(`/events/${eventId}/venue/assignments/${assignmentId}`, {
    method: "DELETE",
  });
}
