import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { motion } from "framer-motion";
import { Trophy, Timer, Users, Target, Zap, ArrowRight, ShieldCheck } from "lucide-react";

interface Contest {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  difficulty: string;
}

interface LeaderboardEntry {
    name: string;
    score: number;
}

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const active = await apiGet<Contest[]>("/api/contests/active");
            setContests(active);
            if (active.length > 0) {
                const lb = await apiGet<LeaderboardEntry[]>(`/api/contests/${active[0].id}/leaderboard`);
                setLeaderboard(lb);
            }
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-12 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-[2px] bg-accent" />
          <span className="section-label !mb-0">Competitive Arena / Global Nodes</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
          Weekly <span className="accent-gradient">Contests.</span>
        </h1>
        <p className="text-text-secondary text-xl font-medium leading-relaxed max-w-2xl">
          Test your cognitive throughput against the global developer network. Real-time ranking based on precision and efficiency.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Active Contests */}
        <div className="lg:col-span-2 space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Active Neural Challenges</h3>
           {contests.length === 0 ? (
               <div className="glass-card p-12 text-center opacity-30">
                   <Timer size={48} className="mx-auto mb-6" />
                   <p className="text-sm font-black uppercase tracking-widest">No active contests found. Next cycle starts in T-48h.</p>
               </div>
           ) : (
               contests.map(contest => (
                   <div key={contest.id} className="glass-card p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
                       <div className="flex-1">
                           <div className="flex items-center gap-4 mb-4">
                               <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                   <Zap className="text-accent" />
                               </div>
                               <div>
                                   <h4 className="text-3xl font-black">{contest.name}</h4>
                                   <span className="text-[9px] font-black text-accent uppercase tracking-widest">{contest.difficulty} DIFFICULTY</span>
                               </div>
                           </div>
                           <div className="flex items-center gap-6 mt-6">
                               <div className="flex items-center gap-2">
                                   <Timer size={14} className="text-text-tertiary" />
                                   <span className="text-xs font-bold text-text-secondary">Ends: {new Date(contest.endTime).toLocaleDateString()}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                   <Users size={14} className="text-text-tertiary" />
                                   <span className="text-xs font-bold text-text-secondary">1.2k Connected</span>
                               </div>
                           </div>
                       </div>
                       <button className="btn-premium px-12 h-16 uppercase tracking-[0.2em] font-black text-xs min-w-[240px]">
                           Enter Arena
                           <ArrowRight size={18} />
                       </button>
                   </div>
               ))
           )}
        </div>

        {/* Live Leaderboard */}
        <div className="space-y-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Live Global Census</h3>
           <div className="glass-card p-8 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10">
               <div className="flex items-center gap-3 mb-10">
                   <Trophy className="text-amber-400" size={24} />
                   <h4 className="text-xl font-black italic">Leaderboard</h4>
               </div>
               
               <div className="space-y-6">
                  {leaderboard.length === 0 ? (
                      <p className="text-xs font-black text-text-tertiary uppercase tracking-widest text-center py-10 opacity-40">Calculating throughput...</p>
                  ) : (
                    leaderboard.map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-accent/40 transition-all">
                          <div className="flex items-center gap-4">
                             <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${i < 3 ? 'bg-amber-400 text-primary' : 'bg-white/10 text-text-tertiary'}`}>
                                {i + 1}
                             </span>
                             <div>
                                <p className="text-sm font-black group-hover:text-accent transition-colors">{entry.name}</p>
                                <div className="flex items-center gap-1 opacity-40">
                                   <ShieldCheck size={8} />
                                   <span className="text-[8px] font-bold uppercase tracking-widest">Verified</span>
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-black">{entry.score}</p>
                             <span className="text-[8px] font-black text-text-tertiary uppercase tracking-widest">Aggregate XP</span>
                          </div>
                      </div>
                    ))
                  )}
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
