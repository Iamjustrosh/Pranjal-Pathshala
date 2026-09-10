import {
  RiCalendarCheckLine,
  RiExternalLinkLine,
  RiRefreshLine,
} from 'react-icons/ri';

export default function AttendancePage({
  sheetUrl,
  iframeKey,
  onRefresh,
}) {
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
          View your current attendance record.
        </p>
      </div>

      <section
        className="
          overflow-hidden rounded-3xl
          border border-slate-100
          bg-white shadow-sm
        "
      >
        <div
          className="
            flex items-center justify-between
            border-b border-slate-100
            px-4 py-3
          "
        >
          <div>
            <p className="text-sm font-bold text-slate-800">
              Attendance Register
            </p>

            <p className="text-[10px] text-slate-400">
              Live Google Sheet
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="
              flex h-9 w-9 items-center
              justify-center rounded-xl
              bg-emerald-50 text-emerald-600
            "
          >
            <RiRefreshLine />
          </button>
        </div>

        <div className="h-[62vh] min-h-[460px]">
          <iframe
            key={iframeKey}
            src={sheetUrl}
            title="Attendance Sheet"
            width="100%"
            height="100%"
            frameBorder="0"
            loading="lazy"
          />
        </div>

        <div
          className="
            flex items-center justify-between
            border-t border-slate-100
            bg-slate-50 px-4 py-3
          "
        >
          <p className="text-[10px] text-slate-400">
            Refresh if the sheet looks outdated.
          </p>

          <a
            href={sheetUrl}
            target="_blank"
            rel="noreferrer"
            className="
              flex items-center gap-1
              text-[11px] font-semibold
              text-emerald-600
            "
          >
            Open
            <RiExternalLinkLine />
          </a>
        </div>
      </section>
    </div>
  );
}