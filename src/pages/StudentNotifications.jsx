import {
  RiNotification3Line,
  RiArrowLeftLine,
} from 'react-icons/ri';

import { useNavigate } from 'react-router-dom';

export default function StudentNotifications() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-200 sm:flex sm:justify-center">
      <div
        className="
          min-h-[100dvh] w-full bg-slate-50
          sm:my-4
          sm:min-h-[calc(100dvh-32px)]
          sm:max-w-[500px]
          sm:rounded-[32px]
          sm:border
          sm:border-white/70
          sm:shadow-2xl
          sm:shadow-slate-400/20
          overflow-hidden
        "
      >
        <header
          className="
            flex items-center gap-3
            border-b border-slate-100
            bg-white px-4 py-3
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate('/student-dashboard')
            }
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl bg-slate-50 text-slate-600
            "
          >
            <RiArrowLeftLine size={20} />
          </button>

          <div>
            <h1 className="text-base font-bold text-slate-900">
              Notifications
            </h1>

            <p className="text-[11px] text-slate-400">
              Updates from Pranjal Pathshala
            </p>
          </div>
        </header>

        <main
          className="
            flex min-h-[70vh]
            flex-col items-center justify-center
            px-6 text-center
          "
        >
          <div
            className="
              flex h-16 w-16 items-center justify-center
              rounded-3xl bg-indigo-50
              text-indigo-600
            "
          >
            <RiNotification3Line size={28} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            No notifications yet
          </h2>

          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
            Updates about results, quizzes, study materials,
            announcements and other student activities will
            appear here.
          </p>
        </main>
      </div>
    </div>
  );
}