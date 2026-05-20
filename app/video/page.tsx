import { Sidebar } from "@/components/sidebar";
import { VideoLinksTable } from "@/components/video-links-table";

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-[280px] min-h-screen p-4 lg:p-8 pt-16 lg:pt-8">
        <VideoLinksTable />
      </main>
    </div>
  );
}
