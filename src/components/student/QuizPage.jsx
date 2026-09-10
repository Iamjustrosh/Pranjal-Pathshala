import {
  RiExternalLinkLine,
  RiQuestionAnswerLine,
} from 'react-icons/ri';

export default function QuizPage({
  quizzes,
  loading,
}) {
  return (
    <div className="space-y-5">

      <div>
        <div className="flex items-center gap-2">
          <RiQuestionAnswerLine
            size={21}
            className="text-violet-600"
          />

          <h2 className="text-xl font-bold text-slate-900">
            Quizzes
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-400">
          Practice and test what you've learned.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">
          Loading quizzes...
        </div>
      ) : quizzes.length === 0 ? (
        <div
          className="
            rounded-3xl border border-dashed
            border-slate-200 bg-white
            px-4 py-14 text-center
          "
        >
          <RiQuestionAnswerLine
            size={32}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-sm text-slate-400">
            No active quizzes currently.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <a
              key={quiz.id}
              href={quiz.url}
              target="_blank"
              rel="noreferrer"
              className="
                block rounded-3xl
                border border-slate-100
                bg-white p-4 shadow-sm
                transition active:scale-[0.98]
              "
            >
              <div className="flex items-center justify-between gap-4">

                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-800">
                    {quiz.title}
                  </p>

                  {quiz.chapter && (
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {quiz.chapter}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span
                      className="
                        rounded-lg bg-violet-50
                        px-2 py-1 text-[10px]
                        font-semibold text-violet-600
                      "
                    >
                      {quiz.subject}
                    </span>

                    <span
                      className="
                        rounded-lg bg-slate-100
                        px-2 py-1 text-[10px]
                        text-slate-500
                      "
                    >
                      Class {quiz.class}
                    </span>
                  </div>
                </div>

                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-2xl bg-violet-50
                    text-violet-600
                  "
                >
                  <RiExternalLinkLine size={18} />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}