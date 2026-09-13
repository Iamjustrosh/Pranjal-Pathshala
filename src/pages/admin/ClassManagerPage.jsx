import Module from "@/components/ClassManager";
import PageHeader from "@/components/admin/PageHeader";

export default function ClassManagerPage() {
  return (
    <div>
      <PageHeader
        title="Class Manager"
        description="Manage student academic records and progression."
      />
      <div className="admin-module">
        <Module active />
      </div>
    </div>
  );
}
