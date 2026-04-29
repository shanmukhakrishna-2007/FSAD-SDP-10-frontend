import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, BookOpen, Code, Trophy, Briefcase,
  Users, Settings, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, Menu, X
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/admin/courses", label: "Courses", icon: BookOpen },
  { path: "/admin/problems", label: "Problems", icon: Code },
  { path: "/admin/contests", label: "Contests", icon: Trophy },
  { path: "/admin/students", label: "Students", icon: Users },
  { path: "/admin/jobs", label: "Jobs & Internships", icon: Briefcase },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (role !== "ADMIN") navigate("/");
  }, [role, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Logo size="sm" variant="icon" />
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col -space-y-0.5">
              <span className="text-sm font-black tracking-tight uppercase">Admin</span>
              <span className="text-[8px] font-black text-accent tracking-[0.3em] uppercase">Control Panel</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all group
              ${isActive
                ? "bg-accent/15 text-accent border border-accent/20 shadow-glow"
                : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-primary text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-white/5 bg-[#060606] transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
        <SidebarContent />
        <button onClick={() => setCollapsed(!collapsed)}
          className="p-3 border-t border-white/5 flex items-center justify-center text-white/30 hover:text-white transition">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-[#060606] border-r border-white/5 z-50 lg:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 flex items-center px-6 gap-4 shrink-0 bg-[#060606]/50 backdrop-blur-xl">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/60">Role-Based Access Control • Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
