import { Link, useLocation } from "react-router-dom";
import { Menu, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigation } from "./navigation";

export default function AdminHeader({ onMenu, currentUser, role }) {
  const { pathname } = useLocation();
  const title =
    navigation
      .flatMap((group) => group.items)
      .find((item) => item.path === pathname.replace(/\/$/, ""))?.title ||
    "Dashboard";
  const name =
    currentUser?.user_metadata?.full_name ||
    currentUser?.email ||
    "Administrator";
  return (
    <header className="flex h-20 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenu}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </Button>
        <span className="hidden text-sm text-slate-400 sm:inline">
          Admin Console
        </span>
        <ChevronRight size={14} className="hidden text-slate-300 sm:block" />
        <span className="truncate text-sm font-medium">{title}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Link
          to="/admin/notifications"
          aria-label="Notifications"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <Bell size={18} />
        </Link>
        <div className="hidden max-w-48 text-right lg:block">
          <p className="truncate text-xs font-medium">{name}</p>
          <p className="mt-1 text-[11px] capitalize text-slate-500">
            {role?.replaceAll("_", " ") || "Admin"}
          </p>
        </div>
        <Link
          to="/admin/settings"
          aria-label="Account settings"
          title={name}
          className="flex size-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
        >
          {name.slice(0, 1).toUpperCase()}
        </Link>
      </div>
    </header>
  );
}
