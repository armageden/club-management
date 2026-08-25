'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';
import { AlertTriangle, ShieldAlert, CheckCircle2, Users, ClipboardList, UserCheck } from 'lucide-react';
import { incidentsApi, incidentsQueryKeys } from '../api';
import type { IncidentRow, IncidentSeverity } from '../types';
import { ReportIncidentModal } from '../components/ReportIncidentModal';
import { formatDateTime } from '@/lib/formatters';

const severityVariant: Record<string, 'neutral' | 'info' | 'warning' | 'danger'> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
};

export default function IncidentsPage({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [reportOpen, setReportOpen] = useState(false);

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: incidentsQueryKeys.list(eventId),
    queryFn: () => incidentsApi.list(eventId),
  });

  const { data: analyticsData } = useQuery({
    queryKey: incidentsQueryKeys.analytics(eventId),
    queryFn: () => incidentsApi.analytics(eventId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description?: string; severity: IncidentSeverity; location?: string }) =>
      incidentsApi.create({ eventId, status: 'open', ...payload }),
    onSuccess: () => {
      toast.success('Incident reported');
      queryClient.invalidateQueries({ queryKey: incidentsQueryKeys.list(eventId) });
      queryClient.invalidateQueries({ queryKey: incidentsQueryKeys.analytics(eventId) });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ incidentId, status }: { incidentId: string; status: 'open' | 'investigating' | 'resolved' }) =>
      incidentsApi.updateStatus(incidentId, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: incidentsQueryKeys.list(eventId) });
      queryClient.invalidateQueries({ queryKey: incidentsQueryKeys.analytics(eventId) });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const incidents: IncidentRow[] = listData?.data ?? [];
  const analytics = analyticsData?.data;
  const bySeverity = new Map((analytics?.incidentsBySeverity ?? []).map((r) => [r.severity, r.count]));
  const byStatus = new Map((analytics?.incidentsByStatus ?? []).map((r) => [r.status, r.count]));
  const volunteerStats = analytics?.volunteerOverview ?? {};
  const openCount = (byStatus.get('open') ?? 0) + (byStatus.get('investigating') ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-400" /> Incidents
          </h1>
          <p className="text-sm text-gray-400">Operational overview and incident log for this event.</p>
        </div>
        <Button onClick={() => setReportOpen(true)}>
          <ClipboardList className="mr-2 h-4 w-4" /> Report Incident
        </Button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <ShieldAlert className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-xs text-gray-400">Critical / High</p>
              <p className="text-xl font-bold text-white">{(bySeverity.get('critical') ?? 0) + (bySeverity.get('high') ?? 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-xs text-gray-400">Open / Investigating</p>
              <p className="text-xl font-bold text-white">{openCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-xs text-gray-400">Resolved</p>
              <p className="text-xl font-bold text-white">{byStatus.get('resolved') ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <Users className="h-8 w-8 text-indigo-400" />
            <div>
              <p className="text-xs text-gray-400">Volunteers Assigned</p>
              <p className="text-xl font-bold text-white">{volunteerStats.total_volunteers_assigned ?? 0} <span className="text-sm text-gray-500">/ {volunteerStats.total_capacity_needed ?? 0} needed</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Volunteer Fulfillment</CardTitle>
          <span className="flex items-center gap-2 text-xs text-gray-400">
            <UserCheck className="h-4 w-4" /> {volunteerStats.total_attended ?? 0} attended of {volunteerStats.total_volunteers_assigned ?? 0} assigned across {volunteerStats.total_shifts ?? 0} shifts
          </span>
        </CardHeader>
      </Card>

      {/* Incidents table */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Log</CardTitle>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <p className="py-8 text-center text-sm text-gray-400">Loading incidents...</p>
          ) : incidents.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No incidents reported yet. This event is running smoothly.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Occurred At</TableHead>
                  <TableHead>Update Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <p className="font-medium text-white">{incident.title}</p>
                      {incident.description && <p className="max-w-xs truncate text-xs text-gray-500">{incident.description}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={severityVariant[incident.severity] ?? 'neutral'}>{incident.severity}</Badge>
                    </TableCell>
                    <TableCell><StatusBadge status={incident.status} /></TableCell>
                    <TableCell className="text-gray-300">{incident.location ?? '-'}</TableCell>
                    <TableCell className="text-gray-300">{incident.reporter_name ?? '-'}</TableCell>
                    <TableCell className="text-gray-400">{formatDateTime(incident.occurred_at)}</TableCell>
                    <TableCell>
                      <Select
                        aria-label={`Update status for ${incident.title}`}
                        value={incident.status}
                        onChange={(e) =>
                          statusMutation.mutate({
                            incidentId: incident.id,
                            status: e.target.value as 'open' | 'investigating' | 'resolved',
                          })
                        }
                        disabled={statusMutation.isPending}
                        className="w-36"
                        options={[
                          { value: 'open', label: 'Open' },
                          { value: 'investigating', label: 'Investigating' },
                          { value: 'resolved', label: 'Resolved' },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ReportIncidentModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        eventId={eventId}
        onSubmit={(payload) => createMutation.mutateAsync(payload).then(() => undefined)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
