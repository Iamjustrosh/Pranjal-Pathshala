import {
  RiBarChartLine,
  RiCalendarCheckLine,
  RiSparklingLine,
  RiBookOpenLine,
  RiQuestionAnswerLine,
} from 'react-icons/ri';

const items = [
  {
    id: 'performance',
    label: 'Performance',
    shortLabel: 'Performance',
    icon: RiBarChartLine,
  },
  {
    id: 'attendance',
    label: 'Attendance',
    shortLabel: 'Attendance',
    icon: RiCalendarCheckLine,
  },
  {
    id: 'ai',
    label: 'AI',
    shortLabel: 'AI',
    icon: RiSparklingLine,
    primary: true,
  },
  {
    id: 'study',
    label: 'Study',
    shortLabel: 'Study',
    icon: RiBookOpenLine,
  },
  {
    id: 'quiz',
    label: 'Quiz',
    shortLabel: 'Quiz',
    icon: RiQuestionAnswerLine,
  },
];

export default function StudentBottomNav({
  activePage,
  onChange,
}) {
  return (
    <nav
      className="
        absolute bottom-0 left-0 right-0 z-50
        border-t border-slate-200/80
        bg-white/95 backdrop-blur-xl
        px-2 pb-[max(8px,env(safe-area-inset-bottom))]
        pt-2
      "
    >
      <div className="grid grid-cols-5 items-end">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;

          if (item.primary) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className="flex flex-col items-center justify-end gap-1"
              >
                <div
                  className={`
                    -mt-7 flex h-14 w-14 items-center justify-center
                    rounded-2xl border-4 border-slate-50
                    shadow-lg transition
                    ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-white'
                    }
                  `}
                >
                  <Icon size={23} />
                </div>

                <span
                  className={`
                    text-[10px] font-semibold
                    ${
                      active
                        ? 'text-indigo-600'
                        : 'text-slate-500'
                    }
                  `}
                >
                  AI
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`
                flex min-h-[52px] flex-col
                items-center justify-center gap-1
                rounded-xl transition
                ${
                  active
                    ? 'text-indigo-600'
                    : 'text-slate-400'
                }
              `}
            >
              <Icon size={21} />

              <span className="text-[10px] font-semibold">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}