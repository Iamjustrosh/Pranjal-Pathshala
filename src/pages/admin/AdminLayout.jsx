import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileSidebar from "@/components/admin/AdminMobileSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import "./admin.css";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { currentUser, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const content = useRef(null);
  useEffect(() => {
    content.current
      ?.querySelector("[data-page-heading]")
      ?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const close = () => {
      if (media.matches) setMobileOpen(false);
    };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  async function logout() {
    setLoggingOut(true);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }
  return (
    <TooltipProvider>
      <div
        className="admin-console min-h-screen bg-slate-50 text-slate-950"
        style={{ "--admin-sidebar-width": collapsed ? "72px" : "260px" }}
      >
        <a
          href="#admin-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-[100] focus:rounded focus:bg-white focus:p-3"
        >
          Skip to content
        </a>
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--admin-sidebar-width)] border-r border-slate-200 md:block">
          <AdminSidebar
            collapsed={collapsed}
            onCollapse={() => setCollapsed((value) => !value)}
            onLogout={logout}
            loggingOut={loggingOut}
          />
        </aside>
        <AdminMobileSidebar
          open={mobileOpen}
          onOpenChange={setMobileOpen}
          onLogout={logout}
          loggingOut={loggingOut}
        />
        <div className="min-w-0 md:pl-[var(--admin-sidebar-width)]">
          <AdminHeader
            onMenu={() => setMobileOpen(true)}
            currentUser={currentUser}
            role={role}
          />
          <div
            id="admin-content"
            ref={content}
            tabIndex={-1}
            className="mx-auto min-w-0 max-w-[1600px] p-4 py-7 sm:p-7 lg:p-9"
          >
            <Outlet />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
