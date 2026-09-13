import { createElement } from "react";
import { NavLink } from "react-router-dom";
import { GraduationCap, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { navigation } from "./navigation";
import { cn } from "@/lib/utils";

export default function AdminSidebar({
  collapsed = false,
  onCollapse,
  onNavigate,
  onLogout,
  loggingOut,
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div
        className={cn(
          "flex h-20 shrink-0 items-center gap-3 border-b border-slate-200 px-5",
          collapsed && "justify-center px-2",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <GraduationCap size={21} />
        </span>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold tracking-tight">
              Pranjal Pathshala
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Admin Console</p>
          </div>
        )}
      </div>
      <nav
        aria-label="Admin navigation"
        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-5"
      >
        {navigation.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map(({ title, path, icon: Icon }) => {
                const link = (
                  <NavLink
                    end
                    to={path}
                    onClick={onNavigate}
                    aria-label={collapsed ? title : undefined}
                    className={({ isActive }) =>
                      cn(
                        "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100",
                        collapsed && "justify-center px-0",
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600",
                      )
                    }
                  >
                    {createElement(Icon, { size: 18, className: "shrink-0" })}
                    {!collapsed && title}
                  </NavLink>
                );
                return collapsed ? (
                  <Tooltip key={path}>
                    <TooltipTrigger render={link} />
                    <TooltipContent side="right">{title}</TooltipContent>
                  </Tooltip>
                ) : (
                  <div key={path}>{link}</div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="space-y-2 border-t border-slate-200 p-3">
        <Button
          variant="ghost"
          className="w-full justify-center text-red-600"
          aria-label="Logout"
          title="Logout"
          disabled={loggingOut}
          onClick={onLogout}
        >
          <LogOut size={18} />
          {!collapsed && (loggingOut ? "Signing out..." : "Logout")}
        </Button>
        {onCollapse && (
          <Button
            variant="ghost"
            className="w-full text-slate-500"
            onClick={onCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                Collapse sidebar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
