import type { LucideIcon } from "lucide-react";
import {
  Cake,
  Camera,
  DoorOpen,
  Gem,
  Heart,
  Lamp,
  Palette,
  PartyPopper,
  Sparkles,
  Sun,
  Trees,
} from "lucide-react";

export type DecorSectionConfig = {
  slug: string;
  title: string;
  sidebarLabel: string;
  icon: LucideIcon;
};

/** Decoration sections shown in the sidebar (each uses the full groups table UI). */
export const DECOR_SECTIONS: DecorSectionConfig[] = [
  {
    slug: "mehendi",
    title: "Mehendi Night",
    sidebarLabel: "Mehendi",
    icon: Palette,
  },
  { slug: "haldi", title: "Haldi Ceremony", sidebarLabel: "Haldi", icon: Sun },
  { slug: "wedding", title: "Wedding", sidebarLabel: "Wedding", icon: Heart },
  {
    slug: "reception",
    title: "Reception",
    sidebarLabel: "Reception",
    icon: PartyPopper,
  },
  {
    slug: "nikka-decor",
    title: "Nikka Decor",
    sidebarLabel: "Nikka Decor",
    icon: Sparkles,
  },
  {
    slug: "entrance",
    title: "Entrance Décor",
    sidebarLabel: "Entrance",
    icon: DoorOpen,
  },
  {
    slug: "table-decor",
    title: "Table Décor",
    sidebarLabel: "Table Décor",
    icon: Lamp,
  },
  {
    slug: "cake-canopy",
    title: "Cake Canopy",
    sidebarLabel: "Cake Canopy",
    icon: Cake,
  },
  {
    slug: "outdoor-decor",
    title: "Outdoor Decor",
    sidebarLabel: "Outdoor Decor",
    icon: Trees,
  },
  {
    slug: "wedding-accessories",
    title: "Wedding Accessories",
    sidebarLabel: "Wedding Accessories",
    icon: Gem,
  },
  {
    slug: "photo-corner",
    title: "Photo Corner",
    sidebarLabel: "Photo Corner",
    icon: Camera,
  },
];

export const DECOR_SECTION_SLUGS = DECOR_SECTIONS.map((s) => s.slug);

const decorSectionBySlug = new Map(
  DECOR_SECTIONS.map((section) => [section.slug, section])
);

export function getDecorSection(slug: string): DecorSectionConfig | undefined {
  return decorSectionBySlug.get(slug);
}

export function isDecorSection(slug: string): boolean {
  return decorSectionBySlug.has(slug);
}
