export default function PageHeader({
  title,
  description,
  actions,
  children,
}) {
  const headerActions = actions ?? children;

  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1
          tabIndex={-1}
          data-page-heading
          className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl"
        >
          {title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      {headerActions && (
        <div className="flex shrink-0 flex-wrap gap-2">
          {headerActions}
        </div>
      )}
    </div>
  );
}