import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Plus, Pencil, Trash2, X, Loader2, Trophy, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminContests() {
  const { showToast } = useToast();
  const [contests, setContests] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", difficulty: "MEDIUM", startTime: "", endTime: "", problemIds: [] as number[], weekly: false });

  const load = () => { setLoading(true); Promise.all([apiGet<any[]>("/api/admin/contests"), apiGet<any[]>("/api/admin/problems")]).then(([c, p]) => { setContests(c); setProblems(p); }).catch(() => showToast("Failed to load", "error")).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = contests.filter(c => (c.name || "").toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setForm({ name: "", difficulty: "MEDIUM", startTime: "", endTime: "", problemIds: [], weekly: false }); setModal("create"); };
  const openEdit = (c: any) => { setForm({ ...c, problemIds: c.problemIds || [], startTime: c.startTime?.slice(0, 16) || "", endTime: c.endTime?.slice(0, 16) || "" }); setSelected(c); setModal("edit"); };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Name is required", "error"); return; }
    if (form.problemIds.length === 0) { showToast("Attach at least 1 problem", "error"); return; }
    setSaving(true);
    try {
      if (modal === "edit") await apiPut(`/api/admin/contests/${selected.id}`, form);
      else await apiPost("/api/admin/contests", form);
      showToast(`Contest ${modal === "edit" ? "updated" : "created"}`, "success");
      setModal(null); load();
    } catch (e: any) { showToast(e.message || "Failed", "error"); }
    setSaving(false);
  };

  const handleDelete = async () => { setSaving(true); try { await apiDelete(`/api/admin/contests/${selected.id}`); showToast("Deleted", "success"); setModal(null); load(); } catch (e: any) { showToast(e.message || "Failed", "error"); } setSaving(false); };

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-2 border-white/5 border-t-accent rounded-full" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h1 className="text-3xl font-black tracking-tighter">Contest <span className="accent-gradient">Management.</span></h1><p className="text-text-secondary text-sm mt-1">Create and manage coding contests</p></div>
        <button onClick={openCreate} className="btn-premium px-6 py-3 text-xs font-black uppercase tracking-widest"><Plus size={16} /> Add Contest</button>
      </div>
      <div className="relative max-w-md"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contests..." className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/40 transition" /></div>
      <div className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-white/10">
        <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Name</th>
        <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Difficulty</th>
        <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Problems</th>
        <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
        <th className="text-right p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Actions</th>
      </tr></thead><tbody>
        {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-16 text-white/30 text-sm font-bold">No contests found.</td></tr>}
        {filtered.map((c: any) => (
          <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
            <td className="p-5 font-bold text-white">{c.name}</td>
            <td className="p-5"><span className={`text-xs font-black px-3 py-1 rounded-full ${c.difficulty === "EASY" ? "bg-emerald-500/20 text-emerald-400" : c.difficulty === "MEDIUM" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>{c.difficulty}</span></td>
            <td className="p-5 text-white/60">{c.problemCount ?? 0}</td>
            <td className="p-5"><span className={`text-xs font-bold px-3 py-1 rounded-full ${c.active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>{c.active ? "Active" : "Ended"}</span></td>
            <td className="p-5 text-right"><div className="flex items-center justify-end gap-2">
              <button onClick={() => openEdit(c)} className="p-2.5 rounded-xl bg-white/5 hover:bg-accent/20 hover:text-accent transition"><Pencil size={14} /></button>
              <button onClick={() => { setSelected(c); setModal("delete"); }} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition"><Trash2 size={14} /></button>
            </div></td>
          </tr>
        ))}
      </tbody></table></div></div>

      {/* Create/Edit Modal */}
      <AnimatePresence>{(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-black uppercase">{modal === "edit" ? "Edit" : "Create"} Contest</h3><button onClick={() => setModal(null)} className="p-2 rounded-xl hover:bg-white/10"><X size={20} /></button></div>
            <div className="space-y-4">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-white/50">Name *</label><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-white/50">Difficulty</label><select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></div>
                <label className="flex items-center gap-3 pt-6 cursor-pointer"><input type="checkbox" checked={form.weekly} onChange={e => setForm({ ...form, weekly: e.target.checked })} className="w-4 h-4 accent-[#C5A059]" /><span className="text-xs font-bold text-white/60">Weekly (auto 7-day)</span></label>
              </div>
              {!form.weekly && <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-white/50">Start</label><input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-white/50">End</label><input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
              </div>}
              <div className="space-y-2"><span className="text-[10px] font-black uppercase tracking-widest text-white/50">Attach Problems *</span>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-white/[0.02] rounded-2xl p-3 border border-white/5">{problems.map((p: any) => (
                  <label key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition"><input type="checkbox" checked={form.problemIds.includes(p.id)} onChange={e => { const ids = form.problemIds; setForm({ ...form, problemIds: e.target.checked ? [...ids, p.id] : ids.filter(x => x !== p.id) }); }} className="accent-[#C5A059]" /><span className="text-xs text-white/80">{p.title}</span></label>
                ))}{problems.length === 0 && <p className="text-xs text-white/30 text-center py-4">Create problems first.</p>}</div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={() => setModal(null)} className="px-6 py-3 rounded-xl text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-premium px-8 py-3 text-xs font-black uppercase tracking-widest disabled:opacity-50">{saving && <Loader2 size={14} className="animate-spin" />} {modal === "edit" ? "Update" : "Create"}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}</AnimatePresence>

      {/* Delete */}
      <AnimatePresence>{modal === "delete" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black mb-4">Confirm Delete</h3><p className="text-white/60 text-sm mb-6">Delete <strong className="text-white">{selected?.name}</strong>?</p>
            <div className="flex justify-end gap-3"><button onClick={() => setModal(null)} className="px-6 py-3 rounded-xl text-xs font-bold text-white/50 hover:text-white transition">Cancel</button><button onClick={handleDelete} disabled={saving} className="px-8 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase hover:bg-red-500/30 disabled:opacity-50 transition flex items-center gap-2">{saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete</button></div>
          </motion.div>
        </div>
      )}</AnimatePresence>
    </motion.div>
  );
}
