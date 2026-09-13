import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { supabase } from '@/supabaseClient';

import {
  clearAttendance,
  clearBulkAttendance,
  loadMonthlyAttendance,
  saveAttendance,
  saveBulkAttendance,

} from '@/services/attendance';





const STATUS_META = {
  present: {
    short: 'P',
    label: 'Present',
    className:
      'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  },

  absent: {
    short: 'A',
    label: 'Absent',
    className:
      'bg-red-100 text-red-700 hover:bg-red-200',
  },

  late: {
    short: 'L',
    label: 'Late',
    className:
      'bg-amber-100 text-amber-700 hover:bg-amber-200',
  },

  leave: {
    short: 'Lv',
    label: 'Leave',
    className:
      'bg-blue-100 text-blue-700 hover:bg-blue-200',
  },
};

const STATUS_ORDER = [
  'present',
  'absent',
  'late',
  'leave',
];

function pad(value) {
  return String(value).padStart(2, '0');
}

function getDateString(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getMonthName(month) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
  }).format(new Date(2026, month - 1, 1));
}



export default function AttendancePage() {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [classNumber, setClassNumber] = useState(6);
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [error, setError] = useState('');

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [bulkSaving, setBulkSaving] =
    useState(false);


  const [editingCell, setEditingCell] =
    useState(null);

  const [editStatus, setEditStatus] =
    useState('present');

  const [editRemarks, setEditRemarks] =
    useState('');

  const [editSaving, setEditSaving] =
    useState(false);


  const daysInMonth = useMemo(
    () => getDaysInMonth(year, month),
    [year, month]
  );

  const days = useMemo(
    () =>
      Array.from(
        { length: daysInMonth },
        (_, index) => index + 1
      ),
    [daysInMonth]
  );

  const attendanceMap = useMemo(() => {
    const map = new Map();

    for (const row of dataset?.attendance ?? []) {
      map.set(
        `${row.academicRecordId}:${row.date}`,
        row
      );
    }

    return map;
  }, [dataset]);

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const result = await loadMonthlyAttendance(
        supabase,
        {
          year,
          classNumber,
          month,
        }
      );

      setDataset(result);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
        'Unable to load attendance.'
      );
    } finally {
      setLoading(false);
    }
  }, [year, classNumber, month]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);


  function openAttendanceEditor(
    student,
    day
  ) {
    const date = getDateString(
      year,
      month,
      day
    );

    const key =
      `${student.academicRecordId}:${date}`;

    const existing =
      attendanceMap.get(key);

    setEditingCell({
      student,
      day,
      date,
      existing,
    });

    setEditStatus(
      existing?.status ?? 'present'
    );

    setEditRemarks(
      existing?.remarks ?? ''
    );
  }

  async function saveAttendanceEdit() {
  if (!editingCell) return;

  try {
    setEditSaving(true);
    setError('');

    await saveAttendance(
      supabase,
      {
        academicRecordId:
          editingCell.student
            .academicRecordId,

        date: editingCell.date,

        status: editStatus,

        remarks: editRemarks,
      }
    );

    await loadAttendance();

    setEditingCell(null);
  } catch (err) {
    console.error(err);

    setError(
      err?.message ||
        'Unable to save attendance.'
    );
  } finally {
    setEditSaving(false);
  }
}

async function deleteAttendanceEdit() {
  if (!editingCell) return;

  try {
    setEditSaving(true);
    setError('');

    await clearAttendance(
      supabase,
      {
        academicRecordId:
          editingCell.student
            .academicRecordId,

        date: editingCell.date,
      }
    );

    await loadAttendance();

    setEditingCell(null);
  } catch (err) {
    console.error(err);

    setError(
      err?.message ||
        'Unable to clear attendance.'
    );
  } finally {
    setEditSaving(false);
  }
}


  async function handleAttendanceClick(
    student,
    day
  ) {
    const date = getDateString(
      year,
      month,
      day
    );

    const key = `${student.academicRecordId}:${date}`;

    const existing = attendanceMap.get(key);

    let nextStatus;

    if (!existing) {
      nextStatus = 'present';
    } else {
      const currentIndex = STATUS_ORDER.indexOf(
        existing.status
      );

      if (
        currentIndex ===
        STATUS_ORDER.length - 1
      ) {
        nextStatus = null;
      } else {
        nextStatus =
          STATUS_ORDER[currentIndex + 1];
      }
    }

    try {
      setSavingKey(key);
      setError('');

      if (nextStatus === null) {
        await clearAttendance(
          supabase,
          {
            academicRecordId:
              student.academicRecordId,
            date,
          }
        );
      } else {
        await saveAttendance(
          supabase,
          {
            academicRecordId:
              student.academicRecordId,

            date,
            status: nextStatus,
          }
        );
      }

      await loadAttendance();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
        'Unable to update attendance.'
      );
    } finally {
      setSavingKey(null);
    }
  }
  async function markRemainingPresent() {
    if (
      !selectedDay ||
      !dataset?.students?.length
    ) {
      return;
    }

    const date = getDateString(
      year,
      month,
      selectedDay
    );

    const unmarkedStudents =
      dataset.students.filter(
        (student) => {
          const key =
            `${student.academicRecordId}:${date}`;

          return !attendanceMap.has(key);
        }
      );

    if (unmarkedStudents.length === 0) {
      return;
    }

    try {
      setBulkSaving(true);
      setError('');

      await saveBulkAttendance(
        supabase,
        {
          academicRecordIds:
            unmarkedStudents.map(
              (student) =>
                student.academicRecordId
            ),

          date,
          status: 'present',
        }
      );

      await loadAttendance();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
        'Unable to mark remaining students.'
      );
    } finally {
      setBulkSaving(false);
    }
  }
  function getStudentSummary(student) {
    const rows = (
      dataset?.attendance ?? []
    ).filter(
      (row) =>
        String(row.academicRecordId) ===
        String(student.academicRecordId)
    );

    const present = rows.filter(
      (row) => row.status === 'present'
    ).length;

    const absent = rows.filter(
      (row) => row.status === 'absent'
    ).length;

    const late = rows.filter(
      (row) => row.status === 'late'
    ).length;

    const leave = rows.filter(
      (row) => row.status === 'leave'
    ).length;

    const considered =
      present + absent + late + leave;

    const attendancePercentage =
      considered > 0
        ? ((present + late) /
          considered) *
        100
        : null;

    return {
      present,
      absent,
      late,
      leave,

      percentage:
        attendancePercentage != null
          ? Number(
            attendancePercentage.toFixed(
              2
            )
          )
          : null,
    };
  }

  function moveMonth(offset) {
    const date = new Date(
      year,
      month - 1 + offset,
      1
    );

    setYear(date.getFullYear());
    setMonth(date.getMonth() + 1);
  }

  async function handleBulkAttendance(
    status
  ) {
    if (
      !selectedDay ||
      !dataset?.students?.length
    ) {
      return;
    }

    const date = getDateString(
      year,
      month,
      selectedDay
    );

    const academicRecordIds =
      dataset.students.map(
        (student) =>
          student.academicRecordId
      );

    try {
      setBulkSaving(true);
      setError('');

      if (status === 'clear') {
        await clearBulkAttendance(
          supabase,
          {
            academicRecordIds,
            date,
          }
        );
      } else {
        await saveBulkAttendance(
          supabase,
          {
            academicRecordIds,
            date,
            status,
          }
        );
      }

      await loadAttendance();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
        'Unable to update attendance.'
      );
    } finally {
      setBulkSaving(false);
    }
  }


  function getDaySummary(day) {
    if (!dataset?.students?.length) {
      return {
        totalStudents: 0,
        marked: 0,
        unmarked: 0,
        complete: false,
      };
    }

    const date = getDateString(
      year,
      month,
      day
    );

    let marked = 0;

    for (const student of dataset.students) {
      const key =
        `${student.academicRecordId}:${date}`;

      if (attendanceMap.has(key)) {
        marked += 1;
      }
    }

    const totalStudents =
      dataset.students.length;

    return {
      totalStudents,
      marked,
      unmarked:
        totalStudents - marked,
      complete:
        marked === totalStudents,
    };
  }

  function isFutureDate(
    year,
    month,
    day
  ) {
    const selected = new Date(
      year,
      month - 1,
      day
    );

    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selected > today;
  }
useEffect(() => {
    setSelectedDay(null);
  }, [year, classNumber, month]);

  const selectedDaySummary =
    selectedDay
      ? getDaySummary(selectedDay)
      : null;

  const selectedDayIsFuture =
    selectedDay
      ? isFutureDate(
        year,
        month,
        selectedDay
      )
      : false;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Manage monthly class attendance."
      />

      {/* Filters */}
      <section className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Academic Year
            </span>

            <input
              type="number"
              value={year}
              onChange={(event) =>
                setYear(
                  Number(
                    event.target.value
                  )
                )
              }
              className="block h-10 w-32 rounded-md border bg-background px-3 text-sm"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Class
            </span>

            <select
              value={classNumber}
              onChange={(event) =>
                setClassNumber(
                  Number(
                    event.target.value
                  )
                )
              }
              className="block h-10 w-32 rounded-md border bg-background px-3 text-sm"
            >
              {Array.from(
                { length: 12 },
                (_, index) =>
                  index + 1
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  Class {value}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Month
            </span>

            <div className="flex h-10 items-center overflow-hidden rounded-md border bg-background">
              <button
                type="button"
                onClick={() =>
                  moveMonth(-1)
                }
                className="flex h-full w-10 items-center justify-center hover:bg-muted"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="min-w-[130px] px-3 text-center text-sm font-medium">
                {getMonthName(month)}
              </div>

              <button
                type="button"
                onClick={() =>
                  moveMonth(1)
                }
                className="flex h-full w-10 items-center justify-center hover:bg-muted"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={loadAttendance}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? 'animate-spin'
                  : ''
              }
            />

            Refresh
          </Button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(
          STATUS_META
        ).map(([status, meta]) => (
          <div
            key={status}
            className="flex items-center gap-1.5 rounded-md border bg-card px-2 py-1"
          >
            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded px-1 font-semibold ${meta.className}`}
            >
              {meta.short}
            </span>

            {meta.label}
          </div>
        ))}

        <div className="rounded-md border bg-card px-2 py-1 text-muted-foreground">
          Click a cell to edit its status and remarks
        </div>
      </div>

      {selectedDay && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
          <div>
            <p className="text-sm font-medium">
              {getMonthName(month)}{' '}
              {selectedDay}, {year}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {selectedDaySummary?.complete
                ? 'Attendance is complete for this day.'
                : `${selectedDaySummary?.marked ?? 0} of ${selectedDaySummary?.totalStudents ?? 0} students marked.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <Button
              type="button"
              disabled={
                bulkSaving ||
                selectedDaySummary?.complete ||
                selectedDayIsFuture
              }
              onClick={markRemainingPresent}
            >
              Mark Remaining Present
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={bulkSaving || selectedDayIsFuture}
              onClick={() =>
                handleBulkAttendance(
                  'present'
                )
              }
            >
              Mark all Present
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={bulkSaving || selectedDayIsFuture}
              onClick={() =>
                handleBulkAttendance(
                  'absent'
                )
              }
            >
              Mark all Absent
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={bulkSaving || selectedDayIsFuture}
              onClick={() =>
                handleBulkAttendance(
                  'late'
                )
              }
            >
              Mark all Late
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={bulkSaving || selectedDayIsFuture}
              onClick={() =>
                handleBulkAttendance(
                  'leave'
                )
              }
            >
              Mark all Leave
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={bulkSaving || selectedDayIsFuture}
              onClick={() =>
                handleBulkAttendance(
                  'clear'
                )
              }
            >
              Clear day
            </Button>
          </div>
        </section>
      )}

      {selectedDayIsFuture && (
        <p className="mt-1 text-xs text-muted-foreground">
          Future attendance cannot be marked.
        </p>
      )}
      {/* Register */}
      <section className="overflow-hidden rounded-xl border bg-card">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : dataset?.students?.length ? (
          <div className="overflow-auto">
            <table className="min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="sticky left-0 z-20 min-w-[220px] border-r bg-muted px-4 py-3 text-left font-medium">
                    Student
                  </th>

                  {days.map((day) => {
                    const daySummary =
                      getDaySummary(day);

                    return (
                      <th
                        key={day}
                        className="h-14 min-w-[44px] border-r p-1 text-center font-medium"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDay(day)
                          }
                          className={`relative flex h-11 w-full flex-col items-center justify-center rounded-md text-xs transition ${selectedDay === day
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                          <span>
                            {day}
                          </span>

                          <span
                            className={`mt-0.5 text-[9px] ${selectedDay === day
                              ? 'text-primary-foreground/80'
                              : daySummary.complete
                                ? 'text-emerald-600'
                                : 'text-muted-foreground'
                              }`}
                          >
                            {daySummary.complete
                              ? 'Done'
                              : `${daySummary.marked}/${daySummary.totalStudents}`}
                          </span>
                        </button>
                      </th>
                    );
                  })}

                  <th className="min-w-[52px] border-r px-2 text-center">
                    P
                  </th>

                  <th className="min-w-[52px] border-r px-2 text-center">
                    A
                  </th>

                  <th className="min-w-[52px] border-r px-2 text-center">
                    L
                  </th>

                  <th className="min-w-[52px] border-r px-2 text-center">
                    Lv
                  </th>

                  <th className="min-w-[80px] px-2 text-center">
                    %
                  </th>
                </tr>
              </thead>

              <tbody>
                {dataset.students.map(
                  (student) => {
                    const summary =
                      getStudentSummary(
                        student
                      );

                    return (
                      <tr
                        key={
                          student.academicRecordId
                        }
                        className="border-b last:border-0"
                      >
                        <td className="sticky left-0 z-10 border-r bg-card px-4 py-3">
                          <p className="font-medium">
                            {
                              student.studentName
                            }
                          </p>

                          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                            {student.uid}
                          </p>
                        </td>

                        {days.map(
                          (day) => {
                            const date =
                              getDateString(
                                year,
                                month,
                                day
                              );

                            const key = `${student.academicRecordId}:${date}`;

                            const attendance =
                              attendanceMap.get(
                                key
                              );

                            const meta =
                              attendance
                                ? STATUS_META[
                                attendance
                                  .status
                                ]
                                : null;

                            const saving =
                              savingKey ===
                              key;

                            const future =
                              isFutureDate(
                                year,
                                month,
                                day
                              );

                            return (
                              <td
                                key={day}
                                className="border-r p-1 text-center"
                              >
                                <button
                                  type="button"
                                  disabled={
                                    saving ||
                                    future
                                  }
                                  title={
                                    future
                                      ? 'Future attendance cannot be marked'
                                      : attendance?.remarks
                                        ? `${meta?.label} — ${attendance.remarks}`
                                        : `${meta?.label || 'Not marked'} — click to edit attendance`
                                  }
                                  onClick={() => {
                                    if (!future) {
                                      openAttendanceEditor(
                                        student,
                                        day
                                      );
                                    }
                                  }}
                                  className={`relative flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition ${future
                                    ? 'cursor-not-allowed opacity-30'
                                    : meta
                                      ? meta.className
                                      : 'text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                  {saving ? (
                                    <Loader2
                                      size={13}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    meta?.short || '—'
                                  )}

                                  {attendance?.remarks && !saving && (
                                    <span
                                      className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-current"
                                      aria-label="Has remark"
                                    />
                                  )}
                                </button>
                              </td>
                            );
                          }
                        )}

                        <td className="border-r text-center font-medium">
                          {
                            summary.present
                          }
                        </td>

                        <td className="border-r text-center font-medium">
                          {
                            summary.absent
                          }
                        </td>

                        <td className="border-r text-center font-medium">
                          {summary.late}
                        </td>

                        <td className="border-r text-center font-medium">
                          {summary.leave}
                        </td>

                        <td className="text-center font-semibold">
                          {summary.percentage !=
                            null
                            ? `${summary.percentage.toFixed(
                              2
                            )}%`
                            : '—'}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <h3 className="font-medium">
              No students found
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              There are no academic
              records for Class{' '}
              {classNumber} in {year}.
            </p>
          </div>
        )}
      </section>

      {editingCell && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() => {
            if (!editSaving) {
              setEditingCell(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-background p-5 shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div>
              <h2 className="font-semibold">
                Edit Attendance
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {editingCell.student.studentName}
                {' · '}
                {editingCell.student.uid}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(
                  `${editingCell.date}T00:00:00`
                ).toLocaleDateString(
                  undefined,
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">
                  Status
                </span>

                <select
                  value={editStatus}
                  onChange={(event) =>
                    setEditStatus(
                      event.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="leave">Leave</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">
                  Remarks
                </span>

                <textarea
                  value={editRemarks}
                  onChange={(event) =>
                    setEditRemarks(
                      event.target.value
                    )
                  }
                  rows={4}
                  maxLength={500}
                  placeholder="Optional note, e.g. Medical leave"
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                <p className="text-right text-xs text-muted-foreground">
                  {editRemarks.length}/500
                </p>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={editSaving}
                onClick={deleteAttendanceEdit}
              >
                Clear Attendance
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={editSaving}
                  onClick={() =>
                    setEditingCell(null)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={editSaving}
                  onClick={saveAttendanceEdit}
                >
                  {editSaving && (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}