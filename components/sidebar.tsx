"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DECOR_SECTIONS } from "@/lib/sections/decor-sections";
import { cn } from "@/lib/utils";

type NavItemConfig = {
  name: string;
  href: string;
  icon: LucideIcon;
};

function SidebarNavItem({
  item,
  pathname,
  onNavigate,
  nested = false,
}: {
  item: NavItemConfig;
  pathname: string;
  onNavigate: () => void;
  nested?: boolean;
}) {
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link href={item.href} onClick={onNavigate}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 rounded-xl transition-colors",
          nested ? "px-3 py-2.5" : "px-4 py-3",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <Icon className={cn("shrink-0", nested ? "h-4 w-4" : "h-5 w-5")} />
        <span className={cn("font-medium", nested && "text-sm")}>{item.name}</span>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary-foreground"
          />
        )}
      </motion.div>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const topItems: NavItemConfig[] = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Packages", href: "/packed", icon: Package },
    {
      name: "Company Settings",
      href: "/company-settings",
      icon: Settings,
    },
  ];

  const galleryItems: NavItemConfig[] = DECOR_SECTIONS.map((section) => ({
    name: section.sidebarLabel,
    href: `/${section.slug}`,
    icon: section.icon,
  }));

  function closeMobile() {
    setIsMobileOpen(false);
  }

  async function confirmLogout() {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setLogoutOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-xl bg-sidebar p-2 text-sidebar-foreground shadow-lg lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="border-b border-sidebar-border p-6">
          <button
            onClick={closeMobile}
            className="absolute top-4 right-4 rounded-lg p-2 hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-5 w-5" />
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
              <h1 className="font-serif text-sm font-semibold leading-tight tracking-tight">
                Kohinoor Decorations
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Back Office</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {topItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={closeMobile}
            />
          ))}

          <div className="pt-4">
            <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/45">
              Gallery
            </p>
            <div className="ml-2 space-y-0.5 border-l border-sidebar-border/80 pl-2">
              {galleryItems.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={closeMobile}
                  nested
                />
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <motion.button
            type="button"
            onClick={() => setLogoutOpen(true)}
            disabled={isLoggingOut}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:opacity-50"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">
              {isLoggingOut ? "Signing out…" : "Logout"}
            </span>
          </motion.button>
        </div>
      </aside>

      <AlertDialog
        open={logoutOpen}
        onOpenChange={(open) => {
          if (!isLoggingOut) setLogoutOpen(open);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access the back office.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl"
              disabled={isLoggingOut}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              disabled={isLoggingOut}
              onClick={() => void confirmLogout()}
            >
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
