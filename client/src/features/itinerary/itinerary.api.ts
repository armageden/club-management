import { apiRequest } from "../../lib/api";
import type { ItineraryItem } from "./itinerary.types";

const EVENT_ID = "e0000000-0000-0000-0000-000000000001";

export async function listItinerary(eventId: string = EVENT_ID): Promise<ItineraryItem[]> {
  const res = await apiRequest<{ items: ItineraryItem[] }>(`/events/${eventId}/itinerary`);
  return res.items;
}

export async function createItinerary(
  eventId: string = EVENT_ID,
  data: { title: string; description?: string; location?: string; starts_at: string; ends_at: string; session_type: string }
): Promise<ItineraryItem> {
  const res = await apiRequest<{ item: ItineraryItem }>(`/events/${eventId}/itinerary`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.item;
}

export async function updateItinerary(
  eventId: string = EVENT_ID,
  itemId: string,
  data: Partial<Pick<ItineraryItem, "title" | "description" | "location" | "starts_at" | "ends_at" | "session_type" | "status">>
): Promise<ItineraryItem> {
  const res = await apiRequest<{ item: ItineraryItem }>(`/events/${eventId}/itinerary/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.item;
}

export async function deleteItinerary(
  eventId: string = EVENT_ID,
  itemId: string
): Promise<void> {
  await apiRequest<{ message: string }>(`/events/${eventId}/itinerary/${itemId}`, {
    method: "DELETE",
  });
}
