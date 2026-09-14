import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  RiLogoutBoxRLine,
  RiMore2Fill,
  RiUserLine,
  RiFlaskLine,
  RiNotification3Line,
  RiArrowDownSLine,
  RiHistoryLine,
} from 'react-icons/ri';

function formatAcademicYear(year) {
  const numericYear = Number(year);

  if (!Number.isFinite(numericYear)) {
    return String(year ?? '');
  }

  return `${numericYear}-${String(
    numericYear + 1
  ).slice(-2)}`;
}

export default function StudentHeader({
  student,
  academicRecords = [],
  selectedAcademicRecordId,
  onAcademicRecordChange,
  switchingAcademicYear = false,
  onLogout,
  unreadNotificationCount = 0,
  notificationLoading = false,

  pushPermission,
  pushEnabled,
  pushLoading,
  pushError,
  onEnablePush,
  onDisablePush,

}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const navigate = useNavigate();

  const firstName =
    student?.name?.split(' ')?.[0] ||
    'Student';

  const hasHistory =
    academicRecords.length > 1;

  return (
    <header
      className="
        sticky top-0 z-40
        border-b border-slate-100
        bg-white/95 backdrop-blur-xl
      "
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.name}
                className="
                  h-11 w-11 shrink-0
                  rounded-2xl object-cover
                  ring-2 ring-indigo-50
                "
              />
            ) : (
              <div
                className="
                  flex h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-2xl bg-indigo-50
                  text-lg font-bold
                  text-indigo-600
                "
              >
                {firstName[0]}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-400">
                Welcome back
              </p>

              <h1 className="truncate text-base font-bold text-slate-900">
                {firstName}
              </h1>

              <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 text-[10px] font-semibold text-indigo-600">
                  Class {student.class}
                </span>

                <span className="text-slate-300">
                  •
                </span>

                <span className="truncate text-[10px] text-slate-500">
                  {student.board}
                </span>

                <span className="text-slate-300">
                  •
                </span>

                <span className="max-w-[82px] truncate font-mono text-[10px] text-slate-500">
                  {student.username}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() =>
                navigate('/labs')
              }
              title="Labs"
              aria-label="Open Labs"
              className="
                flex h-9 w-9 items-center
                justify-center rounded-xl
                bg-slate-50 text-slate-600
                transition
                hover:bg-indigo-50
                hover:text-indigo-600
              "
            >
              <RiFlaskLine size={18} />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/student-dashboard/notifications'
                )
              }
              title="Notifications"
              aria-label="Open Notifications"
              className="
                relative flex h-9 w-9
                items-center justify-center
                rounded-xl bg-slate-50
                text-slate-600 transition
                hover:bg-indigo-50
                hover:text-indigo-600
              "
            >
              <RiNotification3Line
                size={18}
              />

              {!notificationLoading &&
                unreadNotificationCount > 0 && (
                  <span
                    className="
        absolute -right-1 -top-1
        flex min-h-4 min-w-4
        items-center justify-center
        rounded-full bg-red-500
        px-1 text-[9px] font-bold
        leading-none text-white
        ring-2 ring-white
      "
                  >
                    {unreadNotificationCount > 99
                      ? '99+'
                      : unreadNotificationCount}
                  </span>
                )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setMenuOpen(
                    (value) => !value
                  )
                }
                aria-label="Open student menu"
                className="
                  flex h-9 w-9 items-center
                  justify-center rounded-xl
                  bg-slate-50 text-slate-600
                  transition hover:bg-slate-100
                "
              >
                <RiMore2Fill size={19} />
              </button>

              {menuOpen && (
                <>
                  <button
                    aria-label="Close menu"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                  />

                  <div
                    className="
                      absolute right-0 top-11
                      z-50 w-56 overflow-hidden
                      rounded-2xl border
                      border-slate-100 bg-white
                      p-2 shadow-xl
                    "
                  >
                    <div className="px-3 py-2">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {student.name}
                      </p>

                      <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
                        {student.username}
                      </p>
                    </div>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      type="button"
                      className="
                        flex w-full items-center
                        gap-2 rounded-xl px-3
                        py-2 text-left text-sm
                        text-slate-600
                      "
                    >
                      <RiUserLine />
                      Profile
                    </button>


                    {/* PUSH NOTIFICATION */}

                    <div className="my-1 border-t border-slate-100" />

                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700">
                            Push Notifications
                          </p>

                          <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">
                            {pushPermission === 'denied'
                              ? 'Blocked by your browser'
                              : pushEnabled
                                ? 'Enabled on this device'
                                : 'Receive updates on this device'}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={
                            pushLoading ||
                            pushPermission === 'denied'
                          }
                          onClick={
                            pushEnabled
                              ? onDisablePush
                              : onEnablePush
                          }
                          className={`
        shrink-0 rounded-lg px-2.5 py-1.5
        text-[10px] font-semibold transition
        disabled:cursor-not-allowed
        disabled:opacity-50

        ${pushEnabled
                              ? 'bg-red-50 text-red-500 hover:bg-red-100'
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                            }
      `}
                        >
                          {pushLoading
                            ? 'Wait...'
                            : pushEnabled
                              ? 'Disable'
                              : pushPermission === 'denied'
                                ? 'Blocked'
                                : 'Enable'}
                        </button>
                      </div>

                      {pushError && (
                        <p className="mt-2 text-[10px] leading-relaxed text-red-500">
                          {pushError}
                        </p>
                      )}
                    </div>

                    <div className="my-1 border-t border-slate-100" />
                    
                    <button
                      type="button"
                      onClick={onLogout}
                      className="
                        flex w-full items-center
                        gap-2 rounded-xl px-3
                        py-2 text-left text-sm
                        font-medium text-red-500
                        hover:bg-red-50
                      "
                    >
                      <RiLogoutBoxRLine />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Academic-year selector */}
        <div className="mt-3">
          <div
            className="
              flex items-center gap-2
              rounded-2xl border
              border-slate-100
              bg-slate-50 p-2
            "
          >
            <div
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-xl bg-white
                text-indigo-600 shadow-sm
              "
            >
              <RiHistoryLine size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Academic year
              </p>

              <div className="relative mt-0.5">
                <select
                  value={
                    selectedAcademicRecordId ??
                    ''
                  }
                  disabled={
                    switchingAcademicYear ||
                    !hasHistory
                  }
                  onChange={(event) =>
                    onAcademicRecordChange?.(
                      event.target.value
                    )
                  }
                  className="
                    w-full appearance-none
                    bg-transparent pr-7
                    text-xs font-semibold
                    text-slate-700 outline-none
                    disabled:cursor-default
                  "
                >
                  {academicRecords.map(
                    (record) => (
                      <option
                        key={record.id}
                        value={record.id}
                      >
                        {formatAcademicYear(
                          record.academic_year
                        )}{' '}
                        • Class {record.class}
                        {record.status ===
                          'active'
                          ? ' • Current'
                          : ''}
                      </option>
                    )
                  )}
                </select>

                {hasHistory && (
                  <RiArrowDownSLine
                    size={16}
                    className="
                      pointer-events-none
                      absolute right-0 top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />
                )}
              </div>
            </div>

            {switchingAcademicYear && (
              <div
                className="
                  h-4 w-4 shrink-0
                  animate-spin rounded-full
                  border-2 border-slate-200
                  border-t-indigo-500
                "
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
