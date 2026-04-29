import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Users, Search, TrendingUp, Award, Code } from "lucide-react";
import { motion } from "framer-motion";

interface Student { id: number; name: string; email: string; xp: number; level: number; role: string; }

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiGet<any>("/api/admin/stats").then(stats => {
      // The admin stats endpoint gives total users; we'll also fetch results for monitoring
      return apiGet<any[]>("/api/admin/results");
    }).then(results => {
      // Build student list from results (unique users)
      const userMap = new Map<string, any>();
      if (Array.isArray(results)) {
        results.forEach(r => {
          if (!userMap.has(r.userName)) {
            userMap.set(r.userName, { id: r.id, name: r.userName || "Student", email: r.userEmail || "", xp: 0, level: 1, totalScore: r.totalScore, assessments: 1 });
          } else {
            const existing = userMap.get(r.userName)!;
            existing.assessments++;
            existing.totalScore = Math.max(existing.totalScore, r.totalScore);
          }
        });
      }
      setStudents(Array.from(userMap.values()));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-2 border-white/5 border-t-accent rounded-full" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tighter">Student <span className="accent-gradient">Monitoring.</span></h1>
        <p className="text-text-secondary text-sm mt-1">Real-time student performance data from database</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><Users size={22} className="text-blue-400" /></div>
          <div><p className="text-[9px] font-black uppercase tracking-widest text-white/40">Total Students</p><p className="text-2xl font-black">{students.length}</p></div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><TrendingUp size={22} className="text-emerald-400" /></div>
          <div><p className="text-[9px] font-black uppercase tracking-widest text-white/40">Avg Top Score</p><p className="text-2xl font-black">{students.length ? Math.round(students.reduce((a, s) => a + (s as any).totalScore, 0) / students.length) : 0}%</p></div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center"><Award size={22} className="text-purple-400" /></div>
          <div><p className="text-[9px] font-black uppercase tracking-widest text-white/40">High Performers</p><p className="text-2xl font-black">{students.filter((s: any) => s.totalScore >= 70).length}</p></div>
        </div>
      </div>

      <div className="relative max-w-md"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/40 transition" /></div>

      <div className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-white/10">
        <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Student</th>
        <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Top Score</th>
        <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Assessments</th>
        <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Performance</th>
      </tr></thead><tbody>
        {filtered.length === 0 && <tr><td colSpan={4} className="text-center py-16 text-white/30 text-sm font-bold">No students found.</td></tr>}
        {filtered.map((s: any, i) => (
          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition">
            <td className="p-5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-xs font-black text-accent">{s.name?.charAt(0)?.toUpperCase() || "?"}</div><span className="font-bold text-white">{s.name}</span></div></td>
            <td className="p-5"><span className={`font-black ${s.totalScore >= 70 ? "text-emerald-400" : s.totalScore >= 40 ? "text-amber-400" : "text-red-400"}`}>{s.totalScore}%</span></td>
            <td className="p-5 text-white/60">{s.assessments}</td>
            <td className="p-5">
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.totalScore >= 70 ? "bg-emerald-400" : s.totalScore >= 40 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${s.totalScore}%` }} /></div>
                {s.totalScore >= 70 && <span className="text-[9px] font-black text-emerald-400">★</span>}
              </div>
            </td>
          </tr>
        ))}
      </tbody></table></div></div>
    </motion.div>
  );
}
