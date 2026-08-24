import { useState, useEffect } from "react";
import { useAuth } from "../app/providers";
import { apiRequest } from "../lib/api";

const EVENT_ID = "e0000000-0000-0000-0000-000000000001";

type EventRole = "organizer" | "participant" | "volunteer" | "judge" | null;

export function useEventRole(eventId: string = EVENT_ID) {
  const { user } = useAuth();
  const [eventRole, setEventRole] = useState<EventRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEventRole(null);
      setLoading(false);
      return;
    }

    apiRequest<{ membership: { role: string; status: string } | null }>(
      `/events/${eventId}/members/me`
    )
      .then((res) => {
        if (res.membership && res.membership.status === "active") {
          setEventRole(res.membership.role as EventRole);
        } else {
          setEventRole(null);
        }
      })
      .catch(() => setEventRole(null))
      .finally(() => setLoading(false));
  }, [user, eventId]);

  const isOrganizer = eventRole === "organizer";
  const isVolunteer = eventRole === "volunteer";
  const isParticipant = eventRole === "participant";
  const isJudge = eventRole === "judge";
  const canManage = isOrganizer;
  const canCheckIn = isOrganizer || isVolunteer;

  return {
    eventRole,
    loading,
    isOrganizer,
    isVolunteer,
    isParticipant,
    isJudge,
    canManage,
    canCheckIn,
  };
}
