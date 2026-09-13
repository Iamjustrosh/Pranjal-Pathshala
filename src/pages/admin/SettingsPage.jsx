import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/admin/PageHeader";

export default function SettingsPage() {
  const { currentUser, role } = useAuth();
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Your account and application information."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-5 text-sm">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-1 break-all font-medium">
                  {currentUser?.email || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Role</dt>
                <dd className="mt-1 capitalize">
                  {role?.replaceAll("_", " ")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="font-medium">Pranjal Pathshala V2 · Admin Console</p>
            <p className="leading-6 text-slate-500">
              Phase 7.7 introduces the new admin workspace. Appearance uses a
              light theme; the desktop sidebar can be collapsed.
            </p>
            <p className="rounded-lg bg-slate-50 p-3 text-slate-500">
              Additional settings are upcoming. Account and appearance editing
              are not yet implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
