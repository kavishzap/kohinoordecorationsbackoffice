import { Sidebar } from "@/components/sidebar";
import { SectionImageTable } from "@/components/section-image-table";

export default function HaldiPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-[280px] min-h-screen p-4 lg:p-8 pt-16 lg:pt-8">
        <SectionImageTable section="haldi" title="Haldi Ceremony" />
      </main>
    </div>
  );
}
