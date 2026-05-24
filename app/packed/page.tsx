import { Sidebar } from "@/components/sidebar";
import { PackagesTable } from "@/components/packages-table";

export default function PackedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-[280px] min-h-screen p-4 lg:p-8 pt-16 lg:pt-8">
        <PackagesTable />
      </main>
    </div>
  );
}
