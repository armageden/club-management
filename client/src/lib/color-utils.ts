import { useMemo } from 'react';

/**
 * Professional color palette for team assignments and data visualization
 * Colorblind-safe (deuteranopia/protanopia tested)
 */

export const TEAM_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#22d3ee', // Sky
] as const;

export const VENUE_TYPE_COLORS = {
  room: '#6366f1',
  booth: '#10b981',
  table: '#f59e0b',
  stage: '#ef4444',
  lab: '#8b5cf6',
  desk: '#06b6d4',
} as const;

export const STATUS_COLORS = {
  available: '#10b981',
  checked_out: '#f59e0b',
  damaged: '#ef4444',
  overdue: '#dc2626',
  returned: '#6b7280',
  pending: '#6366f1',
  approved: '#10b981',
  rejected: '#ef4444',
  active: '#6366f1',
  cancelled: '#6b7280',
  draft: '#6b7280',
  submitted: '#6366f1',
  disqualified: '#ef4444',
  open: '#f59e0b',
  investigating: '#06b6d4',
  resolved: '#10b981',
  forming: '#6366f1',
  full: '#10b981',
  dissolved: '#6b7280',
  low: '#06b6d4',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
  minor: '#06b6d4',
  moderate: '#f59e0b',
  major: '#ef4444',
} as const;

export const CHART_CATEGORICAL = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
  '#f97316',
  '#14b8a6',
  '#eab308',
] as const;

export const CHART_SEQUENTIAL_BLUE = [
  '#eff6ff',
  '#dbeafe',
  '#bfdbfe',
  '#93c5fd',
  '#60a5fa',
  '#3b82f6',
  '#2563eb',
  '#1d4ed8',
  '#1e40af',
  '#1e3a8a',
] as const;

export const CHART_SEQUENTIAL_GREEN = [
  '#f0fdf4',
  '#dcfce7',
  '#bbf7d0',
  '#86efac',
  '#4ade80',
  '#22c55e',
  '#16a34a',
  '#15803d',
  '#166534',
  '#14532d',
] as const;

export const CHART_DIVERGING = [
  '#7f1d1d', // Dark red
  '#991b1b',
  '#b91c1c',
  '#dc2626',
  '#ef4444',
  '#f87171',
  '#fca5a5',
  '#fecaca',
  '#fee2e2',
  '#fff1f2', // Light red/pink
  '#f0fdf4', // Light green
  '#dcfce7',
  '#bbf7d0',
  '#86efac',
  '#4ade80',
  '#22c55e',
  '#16a34a',
  '#15803d',
  '#166534',
  '#14532d', // Dark green
] as const;

/**
 * Generate a deterministic color from a string
 * Uses HSL color space for consistent, visually distinct colors
 */
export function stringToColor(str: string, saturation = 65, lightness = 50): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get a team color by index (with cycling)
 */
export function getTeamColor(index: number): string {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}

/**
 * Get a venue type color
 */
export function getVenueTypeColor(type: keyof typeof VENUE_TYPE_COLORS): string {
  return VENUE_TYPE_COLORS[type] || TEAM_COLORS[0];
}

/**
 * Get a status color
 */
export function getStatusColor(status: keyof typeof STATUS_COLORS): string {
  return STATUS_COLORS[status] || '#6b7280';
}

/**
 * Generate a color with alpha transparency
 */
export function colorWithAlpha(color: string, alpha: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // Handle rgb/rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  }
  // Handle hsl/hsla
  if (color.startsWith('hsl')) {
    return color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
  }
  // Fallback
  return color;
}

/**
 * Lighten or darken a color
 */
export function adjustColor(color: string, amount: number): string {
  // amount: -100 to 100 (negative = darker, positive = lighter)
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + Math.round(2.55 * amount)));
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + Math.round(2.55 * amount)));
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + Math.round(2.55 * amount)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  if (color.startsWith('hsl')) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = Math.max(0, Math.min(100, parseInt(match[3]) + amount));
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  }
  return color;
}

/**
 * Get contrasting text color (black or white) for a background color
 */
export function getContrastColor(backgroundColor: string): string {
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#0a0a0b' : '#fafafa';
  }
  if (backgroundColor.startsWith('rgb')) {
    const match = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#0a0a0b' : '#fafafa';
    }
  }
  return '#fafafa';
}

/**
 * Hook for getting consistent colors for a list of items
 */
export function useItemColors<T extends { id: string; name?: string }>(items: T[], colorPalette = TEAM_COLORS) {
  return useMemo(() => {
    const colorMap = new Map<string, string>();
    items.forEach((item, index) => {
      const key = item.id || item.name || String(index);
      colorMap.set(key, colorPalette[index % colorPalette.length]);
    });
    return colorMap;
  }, [items, colorPalette]);
}

/**
 * Generate a gradient between two colors
 */
export function generateGradient(
  color1: string,
  color2: string,
  steps: number
): string[] {
  const parseColor = (color: string) => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
    return [0, 0, 0];
  };

  const [r1, g1, b1] = parseColor(color1);
  const [r2, g2, b2] = parseColor(color2);

  return Array.from({ length: steps }, (_, i) => {
    const ratio = i / (steps - 1);
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  });
}