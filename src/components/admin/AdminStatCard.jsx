import { createElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
export default function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {createElement(Icon, { size: 18, className: "text-indigo-500" })}
        </div>
        {loading ? (
          <div
            aria-label="Loading count"
            className="my-4 h-9 w-20 animate-pulse rounded bg-slate-100"
          />
        ) : (
          <p className="my-3 text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        )}
        <p className="text-xs leading-5 text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}
