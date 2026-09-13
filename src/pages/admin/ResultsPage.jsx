import Module from "@/components/ResultsManager";
import PageHeader from "@/components/admin/PageHeader";

export default function ResultsPage() {
  return (
    <div>
      <PageHeader
        title="Results"
        description="Review assessments, update marks, and add student results."
      />
      <div className="admin-module">
        <Module />
      </div>
    </div>
  );
}
