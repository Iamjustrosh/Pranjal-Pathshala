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
              dataKey="subject"
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
              formatter={(value) => [
                `${value}%`,
                'Percentage',
              ]}
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
                    Subject
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
                        {mark.subject}
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
}) {
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

      <PerformancePanel
        title="Tests & Exams"
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