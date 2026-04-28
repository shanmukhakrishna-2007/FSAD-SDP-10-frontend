import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";
import { motion } from "framer-motion";
import { Code2, Target, Zap, ArrowRight, Filter, CheckCircle, Search } from "lucide-react";

interface Problem {
  id: number; title: string; description: string; difficulty: string;
  tags: string; xpReward: number; solved: boolean;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [diffFilter, setDiffFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiGet<Problem[]>("/api/problems")
      .then(setProblems)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = problems;
    if (diffFilter !== "ALL") result = result.filter(p => p.difficulty === diffFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tags?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [problems, diffFilter, search]);

  const solvedCount = problems.filter(p => p.solved).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-2 border-white/5 border-t-accent rounded-full" />
      <p className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary">Loading Problem Library...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-[2px] bg-accent" />
          <span className="section-label !mb-0">Coding Arena / Neural Calibrations</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
          Problem <span className="accent-gradient">Library.</span>
        </h1>
        <p className="text-text-secondary text-xl font-medium leading-relaxed max-w-2xl">
          Master the algorithmic foundations. Every solution fuels your XP progress.
        </p>
      </motion.div>

      {/* Stats + Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-8 flex flex-col xl:flex-row gap-8">
        {/* Search */}
        <div className="relative group flex-1">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent transition-colors" />
          <input type="text" placeholder="Search problems or tags..."
            className="w-full h-14 bg-white/[0.03] border border-glass-border rounded-xl pl-14 pr-6 text-sm font-bold text-text-primary focus:border-accent/40 outline-none transition-all placeholder:text-text-tertiary/50"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 mr-4 text-text-tertiary">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Difficulty:</span>
          </div>
          {["ALL", "EASY", "MEDIUM", "HARD"].map(d => (
            <button key={d} onClick={() => setDiffFilter(d)}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                diffFilter === d ? 'bg-accent text-primary border-accent shadow-glow' :
                'text-text-secondary bg-white/5 border-white/5 hover:border-white/20 hover:text-white'
              }`}>
              {d === "ALL" ? "All" : d}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 px-5 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <CheckCircle size={16} className="text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            {solvedCount}/{problems.length} Solved
          </span>
        </div>
      </motion.div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((problem, i) => (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ y: -8 }}
            className={`glass-card p-8 group cursor-pointer border transition-all flex flex-col justify-between ${
              problem.solved ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-white/5 hover:border-accent/30'
            }`}
            onClick={() => navigate(`/problem/${problem.id}`)}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 relative">
                  <Code2 className="text-accent" size={24} />
                  {problem.solved && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-primary">
                      <CheckCircle size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 ${
                    problem.difficulty === 'HARD' ? 'text-red-400' : 
                    problem.difficulty === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
              <h3 className="text-2xl font-black mb-3 group-hover:text-accent transition-colors">{problem.title}</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {problem.tags?.split(',').map(tag => (
                   <span key={tag} className="text-[10px] font-bold text-text-tertiary bg-white/5 px-2 py-0.5 rounded-md truncate max-w-[100px]">
                     {tag.trim()}
                   </span>
                ))}
              </div>
              <p className="text-text-secondary line-clamp-2 text-sm leading-relaxed mb-6">
                {problem.description?.split('\n')[0]}
              </p>
            </div>
            
            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Zap size={14} className="text-amber-400" />
                 <span className="text-xs font-black">+{problem.xpReward} XP</span>
               </div>
               {problem.solved ? (
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Solved ✓</span>
               ) : (
                 <div className="text-accent group-hover:translate-x-1 transition-transform">
                   <ArrowRight size={20} />
                 </div>
               )}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card py-24 text-center border-dashed border-white/10">
          <p className="text-text-secondary text-xl font-bold">No problems match your filters.</p>
          <button onClick={() => { setSearch(""); setDiffFilter("ALL"); }} className="btn-premium px-12 h-14 mt-6 uppercase tracking-widest text-xs font-black">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
