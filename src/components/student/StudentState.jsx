import {
  RiLoader4Line,
  RiInformationLine,
  RiErrorWarningLine,
  RiRefreshLine,
} from 'react-icons/ri';

export default function StudentState({
  type = 'empty',
  title,
  description,
  onRetry,
}) {
  const config = {
    loading: {
      icon: (
        <RiLoader4Line
          size={24}
          className="animate-spin text-indigo-500"
        />
      ),
      defaultTitle: 'Loading...',
    },

    empty: {
      icon: (
        <RiInformationLine
          size={24}
          className="text-slate-400"
        />
      ),
      defaultTitle: 'Nothing here yet',
    },

    error: {
      icon: (
        <RiErrorWarningLine
          size={24}
          className="text-red-500"
        />
      ),
      defaultTitle: 'Something went wrong',
    },
  };

  const current = config[type] ?? config.empty;

  return (
    <div
      className="
        flex min-h-[180px] w-full
        flex-col items-center justify-center
        rounded-3xl border border-dashed
        border-slate-200 bg-white
        px-6 py-8 text-center
      "
    >
      <div
        className="
          flex h-12 w-12 items-center justify-center
          rounded-2xl bg-slate-50
        "
      >
        {current.icon}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        {title || current.defaultTitle}
      </h3>

      {description && (
        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
          {description}
        </p>
      )}

      {type === 'error' && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="
            mt-4 flex items-center gap-2
            rounded-xl bg-slate-900
            px-4 py-2
            text-xs font-semibold text-white
            transition hover:bg-slate-800
          "
        >
          <RiRefreshLine size={15} />
          Retry
        </button>
      )}
    </div>
  );
}