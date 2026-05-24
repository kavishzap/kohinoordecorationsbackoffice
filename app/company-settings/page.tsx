import { Sidebar } from "@/components/sidebar";
import { CompanySettingsForm } from "@/components/company-settings-form";

export default function CompanySettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-[280px] min-h-screen p-4 lg:p-8 pt-16 lg:pt-8">
        <CompanySettingsForm />
      </main>
    </div>
  );
}
