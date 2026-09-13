import Module from "@/components/LiveQuizForm";
import PageHeader from "@/components/admin/PageHeader";

export default function QuizzesPage() {
  return (
    <div>
      <PageHeader
        title="Quizzes"
        description="Create and manage your live quizzes."
      />
      <div className="admin-module">
        <Module />
      </div>
    </div>
  );
}
