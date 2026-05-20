"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sun,
  Palette,
  PartyPopper,
  Theater,
  DoorOpen,
  Heart,
  Lamp,
  Video,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Haldi", href: "/haldi", icon: Sun },
  { name: "Mehendi", href: "/mehendi", icon: Palette },
  { name: "Reception", href: "/reception", icon: PartyPopper },
  { name: "Wedding", href: "/wedding", icon: Heart },
  { name: "Stage", href: "/stage", icon: Theater },
  { name: "Entrance", href: "/entrance", icon: DoorOpen },
  { name: "Table Décor", href: "/table-decor", icon: Lamp },
  { name: "Video", href: "/video", icon: Video },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-sidebar text-sidebar-foreground lg:hidden shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[280px] bg-sidebar text-sidebar-foreground z-50 flex flex-col transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-sidebar-accent lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-sidebar-border">
              <Image
                src="/logo.png"
                alt="Kohinoor Decorations"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-serif font-semibold text-sm leading-tight tracking-tight">
                Kohinoor Decorations
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Back Office</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <motion.button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">
              {isLoggingOut ? "Signing out…" : "Logout"}
            </span>
          </motion.button>
        </div>
      </aside>
    </>
  );
}
