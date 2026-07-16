import { VALIDATION_FEATURES } from "@/lib/validation/config";
import ValidationDashboard from "@/components/admin/ValidationDashboard";

export const metadata = {
  title: "Validation Admin - Lire",
};

export default function ValidationAdminPage() {
  if (!VALIDATION_FEATURES.adminDashboardEnabled) {
    return (
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-extrabold text-ink">Validation admin</h1>
        <p className="mt-2 text-sm text-ink-muted">The validation dashboard is disabled for this build.</p>
      </div>
    );
  }

  return <ValidationDashboard />;
}
