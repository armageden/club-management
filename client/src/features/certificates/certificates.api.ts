import { apiRequest } from "../../lib/api";
import type { Certificate, EligibilityEntry } from "./certificates.types";

const EVENT_ID = "e0000000-0000-0000-0000-000000000001";

export async function listCertificates(eventId: string = EVENT_ID): Promise<Certificate[]> {
  const res = await apiRequest<{ certificates: Certificate[] }>(`/events/${eventId}/certificates`);
  return res.certificates;
}

export async function checkEligibility(eventId: string = EVENT_ID): Promise<EligibilityEntry[]> {
  const res = await apiRequest<{ eligibility: EligibilityEntry[] }>(`/events/${eventId}/certificates/eligibility`);
  return res.eligibility;
}

export async function issueCertificate(
  userId: string,
  certificateType: string,
  metadata?: Record<string, any>,
  eventId: string = EVENT_ID
): Promise<Certificate> {
  const res = await apiRequest<{ certificate: Certificate }>(`/events/${eventId}/certificates/issue`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, certificate_type: certificateType, metadata }),
  });
  return res.certificate;
}

export async function revokeCertificate(
  certificateId: string,
  eventId: string = EVENT_ID
): Promise<Certificate> {
  const res = await apiRequest<{ certificate: Certificate }>(`/events/${eventId}/certificates/${certificateId}/revoke`, {
    method: "PUT",
  });
  return res.certificate;
}

export async function verifyCertificate(
  code: string,
  eventId: string = EVENT_ID
): Promise<Certificate> {
  const res = await apiRequest<{ certificate: Certificate }>(`/events/${eventId}/certificates/verify/${code}`);
  return res.certificate;
}

export async function bulkCreateAttendance(eventId: string = EVENT_ID): Promise<{ created: number }> {
  const res = await apiRequest<{ created: number }>(`/events/${eventId}/certificates/bulk-attendance`, {
    method: "POST",
  });
  return res;
}
