import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Plus, Pencil, Trash2, X, Loader2, Code, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TestCase { input: string; expectedOutput: string; hidden: boolean; }

export default function AdminProblems() {
  const { showToast } = useToast();
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ title: "", description: "", difficulty: "EASY", tags: "", baseCode: "", xpReward: 100, testCases: [{ input: "", expectedOutput: "", hidden: false }] as TestCase[] });

  const load = () => { setLoading(true); apiGet<any[]>("/api/admin/problems").then(setProblems).catch(() => showToast("Failed to load", "error")).finally(() => setLoading(false)); };
  useEffect(load, []);

  const filtered = problems.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setForm({ title: "", description: "", difficulty: "EASY", tags: "", baseCode: "", xpReward: 100, testCases: [{ input: "", expectedOutput: "", hidden: false }] }); setModal("create"); };
  const openEdit = (p: any) => { setForm({ ...p, testCases: [{ input: "", expectedOutput: "", hidden: false }] }); setSelected(p); setModal("edit"); };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    if (!form.description.trim()) { showToast("Description is required", "error"); return; }
    if (form.testCases.some(tc => !tc.input.trim() || !tc.expectedOutput.trim())) { showToast("All test cases need input & expected output", "error"); return; }
    setSaving(true);
    try {
      if (modal === "edit") await apiPut(`/api/admin/problems/${selected.id}`, form);
      else await apiPost("/api/admin/problems", form);
      showToast(`Problem ${modal === "edit" ? "updated" : "created"}`, "success");
      setModal(null); load();
    } catch (e: any) { showToast(e.message || "Failed", "error"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await apiDelete(`/api/admin/problems/${selected.id}`); showToast("Problem deleted", "success"); setModal(null); load(); }
    catch (e: any) { showToast(e.message || "Delete failed", "error"); }
    setSaving(false);
  };

  const addTestCase = () => setForm({ ...form, testCases: [...form.testCases, { input: "", expectedOutput: "", hidden: false }] });
  const removeTestCase = (i: number) => setForm({ ...form, testCases: form.testCases.filter((_, j) => j !== i) });
  const updateTestCase = (i: number, field: string, value: any) => { const tcs = [...form.testCases]; tcs[i] = { ...tcs[i], [field]: value }; setForm({ ...form, testCases: tcs }); };

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-2 border-white/5 border-t-accent rounded-full" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Problem <span className="accent-gradient">Management.</span></h1>
          <p className="text-text-secondary text-sm mt-1">Create coding problems with test cases for evaluation</p>
        </div>
        <button onClick={openCreate} className="btn-premium px-6 py-3 text-xs font-black uppercase tracking-widest"><Plus size={16} /> Add Problem</button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems..."
          className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/40 transition" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Title</th>
                <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Difficulty</th>
                <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">XP</th>
                <th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Test Cases</th>
                <th className="text-right p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-16 text-white/30 text-sm font-bold">No problems found.</td></tr>}
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                  <td className="p-5 font-bold text-white">{p.title}</td>
                  <td className="p-5"><span className={`text-xs font-black px-3 py-1 rounded-full ${p.difficulty === "EASY" ? "bg-emerald-500/20 text-emerald-400" : p.difficulty === "MEDIUM" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>{p.difficulty}</span></td>
                  <td className="p-5 text-white/60">{p.xpReward} XP</td>
                  <td className="p-5 text-white/50">{p.testCaseCount ?? 0} cases</td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-2.5 rounded-xl bg-white/5 hover:bg-accent/20 hover:text-accent transition"><Pencil size={14} /></button>
                      <button onClick={() => { setSelected(p); setModal("delete"); }} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(modal === "create" || modal === "edit") && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black uppercase">{modal === "edit" ? "Edit" : "Create"} Problem</h3>
                <button onClick={() => setModal(null)} className="p-2 rounded-xl hover:bg-white/10 transition"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Title *</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Description *</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white min-h-[120px] focus:outline-none focus:border-accent/50"
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Difficulty</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50"
                      value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                      <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Tags</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50"
                      value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="arrays, dp" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50">XP Reward</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50"
                      value={form.xpReward} onChange={e => setForm({ ...form, xpReward: parseInt(e.target.value) || 100 })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Base Code Template</label>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono min-h-[80px] focus:outline-none focus:border-accent/50"
                    value={form.baseCode} onChange={e => setForm({ ...form, baseCode: e.target.value })} placeholder="// starter code..." />
                </div>

                {/* Test Cases */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Test Cases *</span>
                    <button onClick={addTestCase} className="text-xs font-bold text-accent hover:underline">+ Add Test Case</button>
                  </div>
                  {form.testCases.map((tc, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Input #{i + 1}</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent/50"
                          value={tc.input} onChange={e => updateTestCase(i, "input", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Expected Output</label>
                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent/50"
                          value={tc.expectedOutput} onChange={e => updateTestCase(i, "expectedOutput", e.target.value)} />
                      </div>
                      <label className="flex items-center gap-1 pb-1"><input type="checkbox" checked={tc.hidden} onChange={e => updateTestCase(i, "hidden", e.target.checked)} className="accent-[#C5A059]" /><span className="text-[9px] text-white/40">Hidden</span></label>
                      <button onClick={() => removeTestCase(i)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition"><X size={14} /></button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button onClick={() => setModal(null)} className="px-6 py-3 rounded-xl text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-premium px-8 py-3 text-xs font-black uppercase tracking-widest disabled:opacity-50">
                    {saving && <Loader2 size={14} className="animate-spin" />} {modal === "edit" ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {modal === "delete" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-black mb-4">Confirm Delete</h3>
              <p className="text-white/60 text-sm mb-6">Delete <strong className="text-white">{selected?.title}</strong>?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setModal(null)} className="px-6 py-3 rounded-xl text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition">Cancel</button>
                <button onClick={handleDelete} disabled={saving} className="px-8 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase hover:bg-red-500/30 disabled:opacity-50 transition flex items-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
