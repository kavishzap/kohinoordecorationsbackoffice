import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { SectionImageTable } from "@/components/section-image-table";
import {
  DECOR_SECTIONS,
  getDecorSection,
} from "@/lib/sections/decor-sections";

export function generateStaticParams() {
  return DECOR_SECTIONS.map((section) => ({ section: section.slug }));
}

export default async function DecorSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;
  const config = getDecorSection(slug);

  if (!config) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-[280px] min-h-screen p-4 lg:p-8 pt-16 lg:pt-8">
        <SectionImageTable section={config.slug} title={config.title} />
      </main>
    </div>
  );
}
