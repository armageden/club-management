'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Select } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';
import { Users, Plus, UserPlus, Clock } from 'lucide-react';
import { volunteersApi, volunteersQueryKeys } from '../api';
import type { VolunteerShiftRow, AssignmentStatus } from '../types';
import { CreateShiftModal } from '../components/CreateShiftModal';
import { AssignVolunteerModal } from '../components/AssignVolunteerModal';
import { formatDateTimeRange } from './formatShiftTime';

export default function VolunteersPage({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [assignShift, setAssignShift] = useState<VolunteerShiftRow | null>(null);

  const { data: shiftsData, isLoading: shiftsLoading } = useQuery({
    queryKey: volunteersQueryKeys.shifts(eventId),
    queryFn: () => volunteersApi.listShifts(eventId),
  });

  const { data: assignmentsData } = useQuery({
    queryKey: volunteersQueryKeys.assignments(eventId),
    queryFn: () => volunteersApi.listAssignments(eventId),
  });

  const { data: usersData } = useQuery({
    queryKey: volunteersQueryKeys.users(),
    queryFn: () => volunteersApi.listUsers(),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: volunteersQueryKeys.shifts(eventId) });
    queryClient.invalidateQueries({ queryKey: volunteersQueryKeys.assignments(eventId) });
  };

  const createShiftMutation = useMutation({
    mutationFn: (payload: { title: string; description?: string; location?: string; startsAtIso: string; endsAtIso: string; capacity: number; requiredSkills?: string }) =>
      volunteersApi.createShift({
        eventId,
        title: payload.title,
        description: payload.description,
        location: payload.location,
        requiredSkills: payload.requiredSkills,
        capacity: payload.capacity,
        startsAt: payload.startsAtIso,
        endsAt: payload.endsAtIso,
        status: 'open',
      }),
    onSuccess: () => {
      toast.success('Shift created');
      invalidateAll();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const assignMutation = useMutation({
    mutationFn: (userId: string) => volunteersApi.assignVolunteer({ shiftId: assignShift!.id, userId }),
    onSuccess: () => {
      toast.success('Volunteer assigned');
      invalidateAll();
    },
    onError: (error: Error) => {
      if (error.message.includes('SHIFT_FULL') || error.message.includes('full')) toast.error('This shift is already full');
      else if (error.message.includes('SCHEDULE_CONFLICT')) toast.error('Volunteer has an overlapping shift');
      else if (error.message.includes('not found')) toast.error('Shift not found');
      else toast.error(error.message);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ assignmentId, status }: { assignmentId: string; status: AssignmentStatus }) =>
      volunteersApi.updateAssignmentStatus(assignmentId, status),
    onSuccess: () => {
      toast.success('Assignment updated');
      invalidateAll();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const shifts: VolunteerShiftRow[] = shiftsData?.data ?? [];
  const assignments = assignmentsData?.data ?? [];
  const users = usersData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-400" /> Volunteers
          </h1>
          <p className="text-sm text-gray-400">Manage volunteer shifts and assignments for this event.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Shift
        </Button>
      </div>

      {/* Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {shiftsLoading ? (
            <p className="py-8 text-center text-sm text-gray-400">Loading shifts...</p>
          ) : shifts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No shifts created yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {shifts.map((shift) => {
                const filled = Number(shift.filled_slots);
                const pct = Math.min(100, Math.round((filled / shift.capacity) * 100));
                return (
                  <div key={shift.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-medium text-white">{shift.title}</h3>
                      <StatusBadge status={shift.status} />
                    </div>
                    {shift.description && <p className="mb-2 line-clamp-2 text-xs text-gray-400">{shift.description}</p>}
                    <p className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5" /> {formatDateTimeRange(shift.starts_at, shift.ends_at)}
                    </p>
                    {shift.location && <p className="mb-1 text-xs text-gray-500">Location: {shift.location}</p>}
                    {shift.required_skills && <p className="mb-2 text-xs text-gray-500">Skills: {shift.required_skills}</p>}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{filled} / {shift.capacity} filled</span>
                        <span className="text-gray-500">{pct}%</span>
                      </div>
                      <Progress value={pct} />
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-3 w-full"
                      disabled={filled >= shift.capacity || shift.status === 'cancelled'}
                      onClick={() => setAssignShift(shift)}
                    >
                      <UserPlus className="mr-1.5 h-4 w-4" />
                      {filled >= shift.capacity ? 'Full' : 'Assign Volunteer'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No volunteers assigned yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Volunteer</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Update Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <p className="font-medium text-white">{assignment.volunteer_name}</p>
                      <p className="text-xs text-gray-500">{assignment.volunteer_email}</p>
                    </TableCell>
                    <TableCell><Badge variant="primary">{assignment.shift_title}</Badge></TableCell>
                    <TableCell className="text-gray-400">{formatDateTimeRange(assignment.shift_starts_at, assignment.shift_ends_at)}</TableCell>
                    <TableCell><StatusBadge status={assignment.status} /></TableCell>
                    <TableCell>
                      <Select
                        aria-label={`Update status for ${assignment.volunteer_name}`}
                        value={assignment.status}
                        onChange={(e) =>
                          statusMutation.mutate({
                            assignmentId: assignment.id,
                            status: e.target.value as AssignmentStatus,
                          })
                        }
                        disabled={statusMutation.isPending}
                        className="w-36"
                        options={[
                          { value: 'assigned', label: 'Assigned' },
                          { value: 'checked_in', label: 'Checked In' },
                          { value: 'completed', label: 'Completed' },
                          { value: 'no_show', label: 'No Show' },
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

      <CreateShiftModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(payload) => createShiftMutation.mutateAsync(payload).then(() => undefined)}
        isLoading={createShiftMutation.isPending}
      />

      <AssignVolunteerModal
        open={assignShift !== null}
        onOpenChange={(open) => !open && setAssignShift(null)}
        shift={assignShift}
        users={users}
        onSubmit={(userId) => assignMutation.mutateAsync(userId).then(() => undefined)}
        isLoading={assignMutation.isPending}
      />
    </div>
  );
}
