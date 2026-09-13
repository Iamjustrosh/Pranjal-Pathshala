import { Link } from "react-router-dom";
import { ArrowLeft, Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "./PageHeader";

export default function UpcomingPage({ title, description, children }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center px-5 py-16 text-center sm:py-24">
          <span className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <Clock3 size={25} />
          </span>
          <span className="mb-3 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Upcoming · Not yet implemented
          </span>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
            {children}
          </p>
          <Link
            to="/admin"
            className="mt-7 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
