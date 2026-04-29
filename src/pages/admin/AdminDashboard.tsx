import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { Users, BookOpen, Code, Trophy, TrendingUp, BarChart3, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalProblems: number;
  totalContests: number;
  averageScores: { Analytical: number | null; Creative: number | null; Technical: number | null; Social: number | null };
}

interface RecentResult {
  id: number;
  userName: string;
  totalScore: number;
  completedAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [results, setResults] = useState<RecentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<AdminStats>("/api/admin/stats").catch(() => null),
      apiGet<RecentResult[]>("/api/admin/results").catch(() => []),
    ]).then(([s, r]) => {
      setStats(s);
      setResults(Array.isArray(r) ? r.slice(0, 10) : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-white/5 border-t-accent rounded-full" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Problems", value: stats?.totalProblems ?? 0, icon: Code, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Contests", value: stats?.totalContests ?? 0, icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const avgCards = [
    { label: "Analytical Avg", value: Math.round(stats?.averageScores?.Analytical ?? 0), icon: BarChart3, color: "text-blue-400" },
    { label: "Creative Avg", value: Math.round(stats?.averageScores?.Creative ?? 0), icon: Activity, color: "text-purple-400" },
    { label: "Technical Avg", value: Math.round(stats?.averageScores?.Technical ?? 0), icon: Zap, color: "text-emerald-400" },
    { label: "Social Avg", value: Math.round(stats?.averageScores?.Social ?? 0), icon: TrendingUp, color: "text-amber-400" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Admin <span className="accent-gradient">Dashboard.</span></h1>
        <p className="text-text-secondary mt-2 text-lg">Real-time platform overview from database</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-6 group hover:bg-white/[0.04] transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{s.label}</span>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={20} className={s.color} />
              </div>
            </div>
            <p className="text-4xl font-black tracking-tighter">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Performance Averages */}
      <div className="glass-card p-8">
        <h3 className="text-lg font-black uppercase tracking-tight mb-6">Student Performance Averages</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {avgCards.map((a, i) => (
            <div key={i} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${a.value}, 100`}
                    className={a.color} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{a.value}%</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{a.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Results */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-black uppercase tracking-tight">Recent Assessment Results</h3>
          <p className="text-xs text-white/40 mt-1">Live data from database</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Student</th>
                <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Score</th>
                <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-12 text-white/30 text-sm font-bold">No assessment results yet.</td></tr>
              ) : results.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                  <td className="p-4 font-bold">{r.userName || "Student"}</td>
                  <td className="p-4">
                    <span className={`font-black ${r.totalScore >= 70 ? "text-emerald-400" : r.totalScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                      {r.totalScore}%
                    </span>
                  </td>
                  <td className="p-4 text-white/40">{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Manage Courses", desc: "Add, edit, delete courses & exams", path: "/admin/courses", icon: BookOpen },
          { label: "Manage Problems", desc: "Create coding problems with test cases", path: "/admin/problems", icon: Code },
          { label: "Post Jobs", desc: "Post real job & internship opportunities", path: "/admin/jobs", icon: Trophy },
        ].map((a, i) => (
          <motion.button key={i} onClick={() => navigate(a.path)}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
            className="glass-card p-6 text-left group hover:bg-white/[0.04] transition-all">
            <a.icon size={24} className="text-accent mb-4" />
            <h4 className="text-lg font-black mb-1 group-hover:text-accent transition-colors">{a.label}</h4>
            <p className="text-xs text-white/40">{a.desc}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
