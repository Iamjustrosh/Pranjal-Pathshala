import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import {
  RiBarChartLine,
  RiTableLine,
  RiTrophyLine,
} from 'react-icons/ri';

function PerformanceTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  const data = payload[0]?.payload;

  if (!data) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold text-slate-900">
        {data.title}
      </p>

      {data.subject && (
        <p className="mt-0.5 text-[10px] text-slate-500">
          {data.subject}
        </p>
      )}

      <p className="mt-2 text-xs text-slate-600">
        Score:{' '}
        <span className="font-semibold text-slate-900">
          {data.marks} / {data.max}
        </span>
      </p>

      <p className="mt-1 text-xs text-slate-600">
        Percentage:{' '}
        <span className="font-semibold text-slate-900">
          {data.percentage}%
        </span>
      </p>

      {data.displayDate && (
        <p className="mt-1 text-[10px] text-slate-400">
          {data.displayDate}
        </p>
      )}
    </div>
  );
}

function PerformancePanel({
  title,
  accentColor,
  marks,
  viewType,
  onViewChange,
  toGraphData,
}) {
  const graphData = toGraphData(marks);
  const isEmpty = marks.length === 0;

  return (
    <div
      className="
        w-full min-w-0 overflow-hidden
        rounded-3xl border border-slate-100
        bg-white p-4 shadow-sm
      "
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="min-w-0 truncate font-bold text-slate-800">
          {title}
        </h3>

        <div className="flex shrink-0 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => onViewChange('chart')}
            aria-label={`Show ${title} chart`}
            className={`
              rounded-lg p-2 transition
              ${viewType === 'chart'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
              }
            `}
          >
            <RiBarChartLine size={16} />
          </button>

          <button
            type="button"
            onClick={() => onViewChange('table')}
            aria-label={`Show ${title} table`}
            className={`
              rounded-lg p-2 transition
              ${viewType === 'table'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
              }
            `}
          >
            <RiTableLine size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[250px] w-full min-w-0">
        {isEmpty ? (
          <div
            className="
              flex h-full items-center justify-center
              rounded-2xl border border-dashed
              border-slate-200
              px-4 text-center
              text-sm text-slate-400
            "
          >
            <div className="text-center">
              <p className="font-medium text-slate-500">
                No {title.toLowerCase()} available
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Results will appear here once they are added.
              </p>
            </div>
          </div>
        ) : viewType === 'chart' ? (
          <LineChart
            data={graphData}
            responsive
            style={{
              width: '100%',
              height: '100%',
              minWidth: 0,
              minHeight: 0,
            }}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />

            <XAxis
              dataKey="displayDate"
              tick={{
                fontSize: 9,
                fill: '#64748B',
              }}
              interval={0}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{
                fontSize: 10,
                fill: '#64748B',
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={<PerformanceTooltip />}
            />

            <Line
              type="monotone"
              dataKey="percentage"
              stroke={accentColor}
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: accentColor,
                stroke: '#fff',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
              }}
            />
          </LineChart>
        ) : (
          <div className="h-full w-full overflow-auto">
            <table className="w-full min-w-[320px] text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-2">
                    Assessment
                  </th>

                  <th className="p-2">
                    Date
                  </th>

                  <th className="p-2 text-right">
                    Score
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {[...marks]
                  .reverse()
                  .map((mark) => (
                    <tr key={mark.id}>
                      <td className="p-2 font-medium text-slate-700">
                        <div>{mark.title}</div>

                        {mark.subject && (
                          <div className="mt-0.5 text-[10px] font-normal text-slate-400">
                            {mark.subject}
                          </div>
                        )}
                      </td>

                      <td className="p-2 text-slate-400">
                        {mark.exam_date}
                      </td>

                      <td className="p-2 text-right">
                        <span className="font-bold">
                          {mark.marks}
                        </span>

                        <span className="text-slate-400">
                          /{mark.max_marks}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PerformancePage({
  testMarks,
  quizMarks,
  testView,
  setTestView,
  quizView,
  setQuizView,
  toGraphData,
  performanceSummary,
  assessmentTypePerformance,
  subjectPerformance,
  academicYearPerformance,
}) {
  const yearComparisonData = (academicYearPerformance || [])
    .filter(
      (item) =>
        item.overallPercentage !== null &&
        item.assessmentCount > 0
    )
    .map((item) => ({
      ...item,
      label: String(item.academicYear),
    }));
  return (
    <div className="w-full min-w-0 space-y-5">
      {/* Page heading */}
      <div>
        <div className="flex items-center gap-2">
          <RiTrophyLine
            className="text-amber-500"
            size={21}
          />

          <h2 className="text-xl font-bold text-slate-900">
            Performance
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-400">
          Track your academic progress.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Overall Performance
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {performanceSummary?.overallPercentage !== null
              ? `${performanceSummary.overallPercentage}%`
              : '—'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Assessments
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {performanceSummary?.assessmentCount ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Marks Scored
          </p>

          <p className="mt-2 text-lg font-bold text-slate-900">
            {performanceSummary?.totalMarksObtained ?? 0}
            <span className="text-sm font-medium text-slate-400">
              {' '}
              / {performanceSummary?.totalMaxMarks ?? 0}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">
            Best Category
          </p>

          <p className="mt-2 text-lg font-bold capitalize text-slate-900">
            {assessmentTypePerformance?.length
              ? (() => {
                const best =
                  assessmentTypePerformance.reduce(
                    (bestItem, current) =>
                      current.percentage > bestItem.percentage
                        ? current
                        : bestItem
                  );

                if (best.type === 'test') return 'Tests';
                if (best.type === 'quiz') return 'Quizzes';

                return best.type;
              })()
              : '—'}
          </p>
        </div>
      </div>
      {subjectPerformance?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Subject Performance
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Performance from subject-specific assessments
            </p>
          </div>

          <div className="space-y-4">
            {subjectPerformance.map((subject) => (
              <div key={subject.subject}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {subject.subject}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {subject.assessmentCount}{' '}
                      {subject.assessmentCount === 1
                        ? 'assessment'
                        : 'assessments'}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {subject.percentage}%
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {subject.totalMarksObtained} /{' '}
                      {subject.totalMaxMarks}
                    </p>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.max(subject.percentage ?? 0, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {assessmentTypePerformance?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Assessment Breakdown
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Compare performance across assessment types
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {assessmentTypePerformance.map((item) => {
              const label =
                item.type === 'test'
                  ? 'Tests'
                  : item.type === 'quiz'
                    ? 'Quizzes'
                    : item.type;

              return (
                <div
                  key={item.type}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-800">
                        {label}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {item.assessmentCount}{' '}
                        {item.assessmentCount === 1
                          ? 'assessment'
                          : 'assessments'}
                      </p>
                    </div>

                    <p className="text-lg font-bold text-slate-900">
                      {item.percentage}%
                    </p>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          Math.max(item.percentage ?? 0, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-slate-500">
                    {item.totalMarksObtained} /{' '}
                    {item.totalMaxMarks} marks
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {yearComparisonData.length > 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Academic Year Comparison
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Compare your overall performance across academic years
            </p>
          </div>

          <div className="space-y-3">
            {yearComparisonData.map((year) => (
              <div
                key={year.academicRecordId}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {year.academicYear}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Class {year.class}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {year.overallPercentage}%
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {year.assessmentCount}{' '}
                      {year.assessmentCount === 1
                        ? 'assessment'
                        : 'assessments'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          year.overallPercentage ?? 0,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    {year.totalMarksObtained} /{' '}
                    {year.totalMaxMarks} marks
                  </span>

                  <span className="capitalize">
                    {year.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <PerformancePanel
        title="Test Perfromance"
        accentColor="#4F46E5"
        marks={testMarks ?? []}
        viewType={testView}
        onViewChange={setTestView}
        toGraphData={toGraphData}
      />

      <PerformancePanel
        title="Quiz Performance"
        accentColor="#8B5CF6"
        marks={quizMarks ?? []}
        viewType={quizView}
        onViewChange={setQuizView}
        toGraphData={toGraphData}
      />
    </div>
  );
}