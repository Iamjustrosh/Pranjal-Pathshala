import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  RiCalendarCheckLine,
  RiRefreshLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiCalendarEventLine,
} from 'react-icons/ri';

import { supabase } from '@/supabaseClient';

import {
  loadStudentAttendance,
} from '@/services/attendance';

const CURRENT_DATE = new Date();
const CURRENT_YEAR = CURRENT_DATE.getFullYear();
const CURRENT_MONTH = CURRENT_DATE.getMonth() + 1;

const STATUS_META = {
  present: {
    label: 'Present',
    short: 'P',
    icon: RiCheckboxCircleLine,
    className:
      'bg-emerald-50 text-emerald-600',
  },

  absent: {
    label: 'Absent',
    short: 'A',
    icon: RiCloseCircleLine,
    className:
      'bg-red-50 text-red-500',
  },

  late: {
    label: 'Late',
    short: 'L',
    icon: RiTimeLine,
    className:
      'bg-amber-50 text-amber-600',
  },

  leave: {
    label: 'Leave',
    short: 'Lv',
    icon: RiCalendarEventLine,
    className:
      'bg-blue-50 text-blue-600',
  },
};

function pad(value) {
  return String(value).padStart(
    2,
    '0'
  );
}

function getDateString(
  year,
  month,
  day
) {
  return `${year}-${pad(
    month
  )}-${pad(day)}`;
}

function getDaysInMonth(
  year,
  month
) {
  return new Date(
    year,
    month,
    0
  ).getDate();
}

function getMonthName(month) {
  return new Intl.DateTimeFormat(
    undefined,
    {
      month: 'long',
    }
  ).format(
    new Date(
      2026,
      month - 1,
      1
    )
  );
}

function formatDate(date) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );
}

export default function AttendancePage({
  academicRecordId,
  academicYear,
}) {
  const initialYear = Number(academicYear);

  const [month, setMonth] =
    useState(
      initialYear === CURRENT_YEAR
        ? CURRENT_MONTH
        : 1
    );

  const [attendance, setAttendance] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const recordId = Number(academicRecordId);
  const year = Number(academicYear);

  const hasValidAcademicRecord =
    Number.isInteger(recordId) &&
    recordId > 0 &&
    Number.isInteger(year) &&
    year > 0;

  useEffect(() => {
    if (!Number.isInteger(year) || year <= 0) {
      return;
    }

    setMonth(
      year === CURRENT_YEAR
        ? CURRENT_MONTH
        : 1
    );
  }, [year]);

  const loadAttendance =
    useCallback(async () => {
      if (!hasValidAcademicRecord) {
        setAttendance([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const rows =
          await loadStudentAttendance(
            supabase,
            {
              academicRecordId: recordId,
              year,
              month,
            }
          );

        setAttendance(rows);
      } catch (err) {
        console.error(err);

        setError(
          err?.message ||
          'Unable to load attendance.'
        );
      } finally {
        setLoading(false);
      }
    }, [
      hasValidAcademicRecord,
      recordId,
      year,
      month,
    ]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const attendanceMap =
    useMemo(() => {
      const map = new Map();

      for (const row of attendance) {
        map.set(
          row.date,
          row
        );
      }

      return map;
    }, [attendance]);

  const summary =
    useMemo(() => {
      const present =
        attendance.filter(
          (row) =>
            row.status ===
            'present'
        ).length;

      const absent =
        attendance.filter(
          (row) =>
            row.status ===
            'absent'
        ).length;

      const late =
        attendance.filter(
          (row) =>
            row.status ===
            'late'
        ).length;

      const leave =
        attendance.filter(
          (row) =>
            row.status ===
            'leave'
        ).length;

      const considered =
        present +
        absent +
        late +
        leave;

      const percentage =
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

        total: considered,

        percentage:
          percentage != null
            ? Number(
              percentage.toFixed(
                1
              )
            )
            : null,
      };
    }, [attendance]);

  const daysInMonth =
    hasValidAcademicRecord
      ? getDaysInMonth(
          year,
          month
        )
      : 0;

  const days = Array.from(
    {
      length:
        daysInMonth,
    },
    (_, index) =>
      index + 1
  );

  function moveMonth(offset) {
    const next =
      new Date(
        year,
        month - 1 + offset,
        1
      );

    if (
      next.getFullYear() !==
      year
    ) {
      return;
    }

    setMonth(
      next.getMonth() + 1
    );
  }
  if (!hasValidAcademicRecord) {
    return (
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <RiCalendarCheckLine
              size={21}
              className="text-emerald-600"
            />

            <h2 className="text-xl font-bold text-slate-900">
              Attendance
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Attendance is unavailable for
            the selected academic year.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-5">

      {/* Header */}

      <div>
        <div className="flex items-center gap-2">
          <RiCalendarCheckLine
            size={21}
            className="text-emerald-600"
          />

          <h2 className="text-xl font-bold text-slate-900">
            Attendance
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-400">
          View your attendance for{' '}
          {year}.
        </p>
      </div>

      {/* Summary */}

      <section className="grid grid-cols-2 gap-3">

        <div
          className="
            col-span-2 rounded-3xl
            bg-slate-900 p-5
            text-white
          "
        >
          <p className="text-xs font-medium text-slate-400">
            Attendance Rate
          </p>

          <div className="mt-2 flex items-end justify-between">
            <p className="text-4xl font-bold">
              {summary.percentage !=
                null
                ? `${summary.percentage}%`
                : '—'}
            </p>

            <p className="text-xs text-slate-400">
              {summary.total}{' '}
              marked days
            </p>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{
                width: `${summary.percentage ??
                  0
                  }%`,
              }}
            />
          </div>
        </div>

        <SummaryCard
          label="Present"
          value={summary.present}
          icon={
            RiCheckboxCircleLine
          }
          className="text-emerald-600"
        />

        <SummaryCard
          label="Absent"
          value={summary.absent}
          icon={
            RiCloseCircleLine
          }
          className="text-red-500"
        />

        <SummaryCard
          label="Late"
          value={summary.late}
          icon={RiTimeLine}
          className="text-amber-600"
        />

        <SummaryCard
          label="Leave"
          value={summary.leave}
          icon={
            RiCalendarEventLine
          }
          className="text-blue-600"
        />
      </section>

      {/* Month navigation */}

      <section
        className="
          overflow-hidden rounded-3xl
          border border-slate-100
          bg-white shadow-sm
        "
      >
        <div
          className="
            flex items-center
            justify-between
            border-b border-slate-100
            px-4 py-3
          "
        >
          <button
            type="button"
            disabled={month === 1}
            onClick={() =>
              moveMonth(-1)
            }
            className="
              rounded-xl px-3 py-2
              text-xs font-semibold
              text-slate-500
              disabled:opacity-30
            "
          >
            Previous
          </button>

          <div className="text-center">
            <p className="text-sm font-bold text-slate-800">
              {getMonthName(
                month
              )}
            </p>

            <p className="text-[10px] text-slate-400">
              {year}
            </p>
          </div>

          <button
            type="button"
            disabled={month === 12}
            onClick={() =>
              moveMonth(1)
            }
            className="
              rounded-xl px-3 py-2
              text-xs font-semibold
              text-slate-500
              disabled:opacity-30
            "
          >
            Next
          </button>
        </div>

        {error && (
          <div className="m-4 rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-52 items-center justify-center">
            <RiRefreshLine
              size={24}
              className="animate-spin text-emerald-600"
            />
          </div>
        ) : (
          <div className="p-4">

            {/* Calendar */}

            <div className="grid grid-cols-7 gap-2">

              {[
                'S',
                'M',
                'T',
                'W',
                'T',
                'F',
                'S',
              ].map(
                (
                  label,
                  index
                ) => (
                  <div
                    key={`${label}-${index}`}
                    className="py-1 text-center text-[10px] font-semibold text-slate-400"
                  >
                    {label}
                  </div>
                )
              )}

              {Array.from({
                length:
                  new Date(
                    year,
                    month - 1,
                    1
                  ).getDay(),
              }).map(
                (_, index) => (
                  <div
                    key={`empty-${index}`}
                  />
                )
              )}

              {days.map(
                (day) => {
                  const date =
                    getDateString(
                      year,
                      month,
                      day
                    );

                  const row =
                    attendanceMap.get(
                      date
                    );

                  const meta =
                    row
                      ? STATUS_META[
                      row.status
                      ]
                      : null;

                  return (
                    <div
                      key={day}
                      title={
                        row?.remarks ||
                        meta?.label ||
                        'Not marked'
                      }
                      className={`
                        flex aspect-square
                        flex-col items-center
                        justify-center
                        rounded-2xl
                        border
                        text-center
                        ${meta
                          ? `${meta.className} border-transparent`
                          : 'border-slate-100 bg-slate-50 text-slate-400'
                        }
                      `}
                    >
                      <span className="text-[10px]">
                        {day}
                      </span>

                      <span className="mt-0.5 text-xs font-bold">
                        {meta?.short ||
                          '—'}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
      </section>

      {/* Legend */}

      <div className="flex flex-wrap gap-2">
        {Object.entries(
          STATUS_META
        ).map(
          ([
            status,
            meta,
          ]) => (
            <div
              key={status}
              className="
                flex items-center
                gap-1.5 rounded-full
                border border-slate-100
                bg-white px-3 py-1.5
                text-[10px]
                text-slate-500
              "
            >
              <span
                className={`font-bold ${meta.className}`}
              >
                {meta.short}
              </span>

              {meta.label}
            </div>
          )
        )}
      </div>

      {/* Recent records */}

      <section
        className="
          overflow-hidden rounded-3xl
          border border-slate-100
          bg-white shadow-sm
        "
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-bold text-slate-800">
            Recent Attendance
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            {getMonthName(
              month
            )}{' '}
            {year}
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading...
          </div>
        ) : attendance.length ? (
          <div className="divide-y divide-slate-100">
            {attendance.map(
              (row) => {
                const meta =
                  STATUS_META[
                  row.status
                  ];

                const Icon =
                  meta.icon;

                return (
                  <div
                    key={row.id}
                    className="flex gap-3 px-4 py-3.5"
                  >
                    <div
                      className={`
                        flex h-10 w-10
                        shrink-0 items-center
                        justify-center
                        rounded-2xl
                        ${meta.className}
                      `}
                    >
                      <Icon
                        size={18}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {
                            meta.label
                          }
                        </p>

                        <p className="text-[10px] text-slate-400">
                          {formatDate(
                            row.date
                          )}
                        </p>
                      </div>

                      {row.remarks && (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {
                            row.remarks
                          }
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <RiCalendarCheckLine
              size={30}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No attendance yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              No attendance has
              been marked for{' '}
              {getMonthName(
                month
              )}{' '}
              {year}.
            </p>
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={
          loadAttendance
        }
        disabled={loading}
        className="
          flex w-full items-center
          justify-center gap-2
          rounded-2xl border
          border-slate-100
          bg-white py-3
          text-xs font-semibold
          text-slate-500
          shadow-sm
        "
      >
        <RiRefreshLine
          className={
            loading
              ? 'animate-spin'
              : ''
          }
        />

        Refresh Attendance
      </button>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  className,
}) {
  return (
    <div
      className="
        rounded-3xl
        border border-slate-100
        bg-white p-4
        shadow-sm
      "
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <Icon
          size={17}
          className={className}
        />
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}