import { createElement } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  ClipboardCheck,
  CalendarDays,
  ArrowUpRight,
  BookOpen,
  CircleHelp,
} from "lucide-react";
import { supabase } from "@/supabaseClient";
import { CURRENT_ACADEMIC_YEAR } from "@/config/academicYear";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/admin/PageHeader";
import AdminStatCard from "@/components/admin/AdminStatCard";

const actions = [
  {
    title: "Review Admissions",
    description: "Review requests and enroll students.",
    path: "admissions",
    icon: UserPlus,
  },
  {
    title: "Open Class Manager",
    description: "Manage academic records and progression.",
    path: "students",
    icon: Users,
  },
  {
    title: "Open Results",
    description: "Review assessments and update marks.",
    path: "results",
    icon: ClipboardCheck,
  },
  {
    title: "Upload Study Material",
    description: "Share resources with your classes.",
    path: "materials",
    icon: BookOpen,
  },
  {
    title: "Open Quizzes",
    description: "Create and manage live quizzes.",
    path: "quizzes",
    icon: CircleHelp,
  },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase
        .from("student_academic_records")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .eq("academic_year", CURRENT_ACADEMIC_YEAR),
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .or("status.neq.enrolled,status.is.null"),
    ])
      .then((results) => {
        if (cancelled) return;
        const failed = results.find((result) => result.error);
        if (failed) throw failed.error;
        setCounts(results.map((result) => result.count));
      })
      .catch((err) => {
        if (!cancelled) {
          setCounts(null);
          setError(err.message || "Unable to load overview counts.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [revision]);




  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here’s your admin workspace at a glance."
        actions={
          <Button
            variant="outline"
            onClick={() => setRevision((value) => value + 1)}
            disabled={loading}
          >
            Refresh overview
          </Button>
        }
      />
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Overview unavailable: {error} Use Refresh overview to retry. Your
          admin tools are still available below.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Total Students"
          value={counts?.[0] ?? "—"}
          loading={loading}
          description="All student records, including inquiries"
          icon={Users}
        />
        <AdminStatCard
          title="Active Academic Records"
          value={counts?.[1] ?? "—"}
          loading={loading}
          description={`Active enrollments in ${CURRENT_ACADEMIC_YEAR}`}
          icon={ClipboardCheck}
        />
        <AdminStatCard
          title="Pending Admissions"
          value={counts?.[2] ?? "—"}
          loading={loading}
          description="Requests not yet marked enrolled"
          icon={UserPlus}
        />
        <AdminStatCard
          title="Current Academic Year"
          value={CURRENT_ACADEMIC_YEAR}
          description="Configured academic year"
          icon={CalendarDays}
        />
      </div>
      <Card className="mt-7">
        <CardHeader className="px-6 pt-2">
          <CardTitle>Quick actions</CardTitle>
          <p className="text-sm text-slate-500">
            Pick up where you need to work.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 px-6 pb-2 sm:grid-cols-2 xl:grid-cols-3">
          {actions.map(({ title, description, path, icon: Icon }) => (
            <Link
              key={path}
              to={`/admin/${path}`}
              className="group flex gap-4 rounded-xl border border-slate-200 p-5 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                {createElement(Icon, { size: 20 })}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-start justify-between gap-2 text-sm font-semibold">
                  {title}
                  <ArrowUpRight size={16} className="shrink-0 text-slate-400" />
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
      <div className="mt-6 flex flex-col justify-between gap-3 rounded-xl border border-dashed border-slate-300 p-5 text-sm sm:flex-row sm:items-center">
        <div>
          <p className="font-medium">More insights are on the way</p>
          <p className="mt-1 text-slate-500">
            Performance analytics will arrive in Phase 7.8.
          </p>
        </div>
        <Link
          to="/admin/analytics"
          className="shrink-0 font-medium text-indigo-600 hover:underline"
        >
          View upcoming analytics →
        </Link>
      </div>

    </div>
  );
}
