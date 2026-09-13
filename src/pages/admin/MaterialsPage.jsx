import Module from "@/components/StudyMaterialForm";
import PageHeader from "@/components/admin/PageHeader";

export default function MaterialsPage() {
  return (
    <div>
      <PageHeader
        title="Study Materials"
        description="Upload and manage learning resources for your classes."
      />
      <div className="admin-module">
        <Module />
      </div>
    </div>
  );
}
