import type { ApiResponse, ApiError } from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    if (isJson) {
      try {
        const errorData = await response.json() as ApiError;
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // Ignore parse error
      }
    }
    throw new Error(errorMessage);
  }

  if (isJson) {
    return response.json() as Promise<ApiResponse<T>>;
  }

  return { success: true, data: undefined as unknown as T };
}

/**
 * Fetch-style helper for feature modules: same auth/base-URL handling as
 * `api`, but resolves to the envelope's inner `data` payload directly and
 * accepts a standard RequestInit (method/body).
 */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  const json = await handleResponse<unknown>(response);
  return (json.data !== undefined ? json.data : (json as unknown)) as T;
}

/**
 * Typed API client with automatic auth handling
 */
export const api = {
  async get<T>(path: string, params?: RequestOptions['params']): Promise<ApiResponse<T>> {
    const response = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(buildUrl(path), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(buildUrl(path), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const response = await fetch(buildUrl(path), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    const response = await fetch(buildUrl(path), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(response);
  },
};

/**
 * Query keys for TanStack Query
 */
export const queryKeys = {
  // Auth
  me: ['auth', 'me'] as const,
  
  // System
  health: ['health'] as const,
  healthDetailed: ['health', 'detailed'] as const,
  
  // Events
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  eventMembers: (eventId: string) => ['events', eventId, 'members'] as const,
  
  // Hardware
  hardwareItems: (eventId: string, params?: Record<string, unknown>) => 
    ['hardware', 'items', eventId, params] as const,
  hardwareCheckouts: (eventId: string) => 
    ['hardware', 'checkouts', eventId] as const,
  hardwareReturns: (eventId: string) => 
    ['hardware', 'returns', eventId] as const,
  hardwareDamageReports: (eventId: string) => 
    ['hardware', 'damage-reports', eventId] as const,
  hardwareAnalytics: (eventId: string) => 
    ['hardware', 'analytics', eventId] as const,
  
  // Venue
  venueLocations: (eventId: string) => 
    ['venue', 'locations', eventId] as const,
  venueAssignments: (eventId: string) => 
    ['venue', 'assignments', eventId] as const,
  venueScheduleGrid: (eventId: string) => 
    ['venue', 'schedule-grid', eventId] as const,
  
  // Projects
  projects: (eventId: string) => 
    ['projects', eventId] as const,
  project: (eventId: string, projectId: string) => 
    ['projects', eventId, projectId] as const,
  
  // Judging
  judgingProjects: (eventId: string) => 
    ['judging', 'projects', eventId] as const,
  judgingLeaderboard: (eventId: string) => 
    ['judging', 'leaderboard', eventId] as const,
  judgingAnalytics: (eventId: string) => 
    ['judging', 'analytics', eventId] as const,
};

/**
 * Mutation keys for TanStack Query
 */
export const mutationKeys = {
  // Hardware
  createHardwareItem: ['hardware', 'create'] as const,
  updateHardwareItem: ['hardware', 'update'] as const,
  deleteHardwareItem: ['hardware', 'delete'] as const,
  checkoutHardware: ['hardware', 'checkout'] as const,
  returnHardware: ['hardware', 'return'] as const,
  createDamageReport: ['hardware', 'damage-report', 'create'] as const,
  
  // Venue
  createVenueLocation: ['venue', 'location', 'create'] as const,
  updateVenueLocation: ['venue', 'location', 'update'] as const,
  deleteVenueLocation: ['venue', 'location', 'delete'] as const,
  createVenueAssignment: ['venue', 'assignment', 'create'] as const,
  updateVenueAssignment: ['venue', 'assignment', 'update'] as const,
  deleteVenueAssignment: ['venue', 'assignment', 'delete'] as const,
  
  // Projects
  createProject: ['projects', 'create'] as const,
  updateProject: ['projects', 'update'] as const,
  submitProject: ['projects', 'submit'] as const,
  
  // Judging
  submitScores: ['judging', 'scores', 'submit'] as const,
};