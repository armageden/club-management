import { apiRequest } from "../../lib/api";
import type { Checkin, CheckinStats } from "./checkin.types";


const EVENT_ID = "e0000000-0000-0000-0000-000000000001";

export async function listCheckins(eventId: string = EVENT_ID): Promise<Checkin[]> {
  const res = await apiRequest<{ checkins: Checkin[] }>(`/events/${eventId}/checkin`);
  return res.checkins;
}

export async function manualCheckin(
  eventId: string = EVENT_ID,
  userId: string,
  itineraryItemId?: string
): Promise<Checkin> {
  const res = await apiRequest<{ checkin: Checkin }>(`/events/${eventId}/checkin/manual`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, itinerary_item_id: itineraryItemId || null }),
  });
  return res.checkin;
}

export async function qrCheckin(
  eventId: string = EVENT_ID,
  token: string
): Promise<Checkin> {
  const res = await apiRequest<{ checkin: Checkin }>(`/events/${eventId}/checkin/qr`, {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  return res.checkin;
}

export async function generateQRToken(
  eventId: string = EVENT_ID,
  userId?: string,
  expiresInMinutes?: number
): Promise<{ token: string }> {
  const res = await apiRequest<{ token: string }>(`/events/${eventId}/checkin/qr/generate`, {
    method: "POST",
    body: JSON.stringify({
      user_id: userId || null,
      expires_in_minutes: expiresInMinutes || 60,
    }),
  });
  return res;
}

export async function getCheckinStats(eventId: string = EVENT_ID): Promise<CheckinStats> {
  const res = await apiRequest<{ stats: CheckinStats }>(`/events/${eventId}/checkin/stats`);
  return res.stats;
}

