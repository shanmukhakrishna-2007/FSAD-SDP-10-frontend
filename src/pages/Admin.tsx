import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ShieldCheck, BookOpen, Code, Trophy, Plus, Pencil, Trash2, X, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "courses" | "problems" | "contests";

interface Stats { totalUsers: number; totalCourses: number; totalProblems: number; totalContests: number; }

// ── Modal Shell ──
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black uppercase tracking-tight text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition"><X size={20} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ── Input Field ──
function Field({ label, value, onChange, type = "text", placeholder = "", textarea = false, required = false }: any) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition";
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/50">{label}</label>
      {textarea ? <textarea className={cls + " min-h-[100px]"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />
        : <input className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />}
    </div>
  );
}

// ── Toast ──
function Toast({ msg, type, onDone }: { msg: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
      className={`fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border text-sm font-bold shadow-2xl ${type === "success" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" : "bg-red-500/20 border-red-500/30 text-red-300"}`}>
      {type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />} {msg}
    </motion.div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("courses");
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalCourses: 0, totalProblems: 0, totalContests: 0 });
  const [courses, setCourses] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [modal, setModal] = useState<{ type: "create" | "edit" | "delete"; tab: Tab; item?: any } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState<any>({});

  useEffect(() => { if (role !== "ADMIN") { navigate("/"); return; } loadAll(); }, [role, navigate]);

  async function loadAll() {
    setLoading(true);
    try {
      const [s, c, p, ct] = await Promise.all([
        apiGet<Stats>("/api/admin/stats"), apiGet<any[]>("/api/admin/courses"),
        apiGet<any[]>("/api/admin/problems"), apiGet<any[]>("/api/admin/contests")
      ]);
      setStats(s); setCourses(c); setProblems(p); setContests(ct);
    } catch { /* ignore */ }
    setLoading(false);
  }

  function openCreate(t: Tab) {
    if (t === "courses") setForm({ title: "", description: "", difficulty: "Beginner", durationHours: 10, topics: "", trending: false, careerPathId: null });
    else if (t === "problems") setForm({ title: "", description: "", difficulty: "EASY", tags: "", baseCode: "", xpReward: 100, testCases: [{ input: "", expectedOutput: "", hidden: false }] });
    else setForm({ name: "", difficulty: "MEDIUM", startTime: "", endTime: "", problemIds: [], weekly: false });
    setModal({ type: "create", tab: t });
  }

  function openEdit(t: Tab, item: any) {
    if (t === "courses") setForm({ ...item });
    else if (t === "problems") setForm({ ...item, testCases: [{ input: "", expectedOutput: "", hidden: false }] });
    else setForm({ ...item, problemIds: item.problemIds || [], startTime: item.startTime?.slice(0, 16) || "", endTime: item.endTime?.slice(0, 16) || "" });
    setModal({ type: "edit", tab: t, item });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const isEdit = modal?.type === "edit";
      const t = modal!.tab;
      const endpoint = `/api/admin/${t}`;
      if (t === "courses") {
        if (isEdit) await apiPut(`${endpoint}/${modal!.item.id}`, form);
        else await apiPost(endpoint, form);
      } else if (t === "problems") {
        if (isEdit) await apiPut(`${endpoint}/${modal!.item.id}`, form);
        else await apiPost(endpoint, form);
      } else {
        if (isEdit) await apiPut(`${endpoint}/${modal!.item.id}`, form);
        else await apiPost(endpoint, form);
      }
      setToast({ msg: `${t.slice(0, -1)} ${isEdit ? "updated" : "created"} successfully!`, type: "success" });
      setModal(null);
      await loadAll();
    } catch (e: any) {
      setToast({ msg: e.message || "Operation failed", type: "error" });
    }
    setSaving(false);
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await apiDelete(`/api/admin/${modal!.tab}/${modal!.item.id}`);
      setToast({ msg: "Deleted successfully", type: "success" });
      setModal(null);
      await loadAll();
    } catch (e: any) { setToast({ msg: e.message || "Delete failed", type: "error" }); }
    setSaving(false);
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-2 border-white/5 border-t-accent rounded-full" />
      <p className="text-xs font-black uppercase tracking-[0.3em] text-accent/60">Loading Admin Panel...</p>
    </div>
  );

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "courses", label: "Courses", icon: BookOpen, count: stats.totalCourses },
    { key: "problems", label: "Problems", icon: Code, count: stats.totalProblems },
    { key: "contests", label: "Contests", icon: Trophy, count: stats.totalContests },
  ];

  const currentData = tab === "courses" ? courses : tab === "problems" ? problems : contests;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center shadow-glow">
              <ShieldCheck size={28} className="text-accent" />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-accent/40">Role-Based Access Control</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">Admin <span className="accent-gradient">Panel.</span></h2>
            </div>
          </div>
          <p className="text-text-secondary text-lg max-w-xl">Manage courses, problems, and contests across the platform.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <Users size={18} className="text-blue-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Users</span>
              <span className="text-sm font-black text-white">{stats.totalUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tab === t.key ? "bg-accent/20 text-accent border border-accent/30" : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"}`}>
            <t.icon size={16} /> {t.label}
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${tab === t.key ? "bg-accent/30 text-accent" : "bg-white/10 text-white/40"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <button onClick={() => openCreate(tab)} className="btn-premium px-8 py-3.5 text-xs font-black uppercase tracking-widest">
          <Plus size={16} /> Create {tab.slice(0, -1)}
        </button>
      </div>

      {/* Data Table */}
      <div className="glass-card-plus overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {tab === "courses" && <><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Title</th><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Difficulty</th><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Duration</th><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Trending</th></>}
                {tab === "problems" && <><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Title</th><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Difficulty</th><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">XP</th><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Tests</th></>}
                {tab === "contests" && <><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Name</th><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Difficulty</th><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Problems</th><th className="text-left p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th></>}
                <th className="text-right p-5 text-[10px] font-black uppercase tracking-widest text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-white/30 text-sm font-bold">No {tab} found. Create one to get started.</td></tr>
              )}
              {currentData.map((item: any) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-5 font-bold text-white">{item.title || item.name}</td>
                  <td className="p-5">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${item.difficulty === "EASY" || item.difficulty === "Beginner" ? "bg-emerald-500/20 text-emerald-400" : item.difficulty === "MEDIUM" || item.difficulty === "Intermediate" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                      {item.difficulty}
                    </span>
                  </td>
                  <td className="p-5 text-white/60">
                    {tab === "courses" ? `${item.durationHours}h` : tab === "problems" ? `${item.xpReward} XP` : `${item.problemCount} problems`}
                  </td>
                  <td className="p-5">
                    {tab === "courses" && <span className={`text-xs font-bold ${item.trending ? "text-emerald-400" : "text-white/30"}`}>{item.trending ? "Yes" : "No"}</span>}
                    {tab === "problems" && <span className="text-xs text-white/50">{item.testCaseCount} cases</span>}
                    {tab === "contests" && <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>{item.active ? "Active" : "Ended"}</span>}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(tab, item)} className="p-2.5 rounded-xl bg-white/5 hover:bg-accent/20 hover:text-accent transition-all"><Pencil size={14} /></button>
                      <button onClick={() => { setModal({ type: "delete", tab, item }); }} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create/Edit Modal ── */}
      <Modal open={modal?.type === "create" || modal?.type === "edit"} onClose={() => setModal(null)} title={`${modal?.type === "edit" ? "Edit" : "Create"} ${modal?.tab?.slice(0, -1) || ""}`}>
        <div className="space-y-4">
          {modal?.tab === "courses" && <>
            <Field label="Title" value={form.title || ""} onChange={(v: string) => setForm({ ...form, title: v })} required />
            <Field label="Description" value={form.description || ""} onChange={(v: string) => setForm({ ...form, description: v })} textarea />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Difficulty</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50"
                  value={form.difficulty || "Beginner"} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
                </select>
              </div>
              <Field label="Duration (hours)" type="number" value={form.durationHours || 0} onChange={(v: string) => setForm({ ...form, durationHours: parseInt(v) || 0 })} />
            </div>
            <Field label="Topics (comma-separated)" value={form.topics || ""} onChange={(v: string) => setForm({ ...form, topics: v })} />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.trending || false} onChange={e => setForm({ ...form, trending: e.target.checked })} className="w-4 h-4 accent-[#C5A059]" />
              <span className="text-xs font-bold text-white/60">Mark as Trending</span>
            </label>
          </>}

          {modal?.tab === "problems" && <>
            <Field label="Title" value={form.title || ""} onChange={(v: string) => setForm({ ...form, title: v })} required />
            <Field label="Description" value={form.description || ""} onChange={(v: string) => setForm({ ...form, description: v })} textarea />
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Difficulty</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50"
                  value={form.difficulty || "EASY"} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                </select>
              </div>
              <Field label="Tags" value={form.tags || ""} onChange={(v: string) => setForm({ ...form, tags: v })} />
              <Field label="XP Reward" type="number" value={form.xpReward || 100} onChange={(v: string) => setForm({ ...form, xpReward: parseInt(v) || 100 })} />
            </div>
            <Field label="Base Code" value={form.baseCode || ""} onChange={(v: string) => setForm({ ...form, baseCode: v })} textarea />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Test Cases</span>
                <button onClick={() => setForm({ ...form, testCases: [...(form.testCases || []), { input: "", expectedOutput: "", hidden: false }] })}
                  className="text-xs font-bold text-accent hover:underline">+ Add Test Case</button>
              </div>
              {(form.testCases || []).map((tc: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
                  <Field label={`Input #${i + 1}`} value={tc.input} onChange={(v: string) => { const tcs = [...form.testCases]; tcs[i] = { ...tcs[i], input: v }; setForm({ ...form, testCases: tcs }); }} />
                  <Field label="Expected Output" value={tc.expectedOutput} onChange={(v: string) => { const tcs = [...form.testCases]; tcs[i] = { ...tcs[i], expectedOutput: v }; setForm({ ...form, testCases: tcs }); }} />
                  <label className="flex items-center gap-1 pb-1"><input type="checkbox" checked={tc.hidden} onChange={e => { const tcs = [...form.testCases]; tcs[i] = { ...tcs[i], hidden: e.target.checked }; setForm({ ...form, testCases: tcs }); }} className="accent-[#C5A059]" /><span className="text-[9px] text-white/40">Hidden</span></label>
                  <button onClick={() => { const tcs = form.testCases.filter((_: any, j: number) => j !== i); setForm({ ...form, testCases: tcs }); }}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition"><X size={14} /></button>
                </div>
              ))}
            </div>
          </>}

          {modal?.tab === "contests" && <>
            <Field label="Contest Name" value={form.name || ""} onChange={(v: string) => setForm({ ...form, name: v })} required />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Difficulty</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50"
                  value={form.difficulty || "MEDIUM"} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                </select>
              </div>
              <label className="flex items-center gap-3 pt-6 cursor-pointer">
                <input type="checkbox" checked={form.weekly || false} onChange={e => setForm({ ...form, weekly: e.target.checked })} className="w-4 h-4 accent-[#C5A059]" />
                <span className="text-xs font-bold text-white/60">Weekly Contest (auto 7-day duration)</span>
              </label>
            </div>
            {!form.weekly && <div className="grid grid-cols-2 gap-4">
              <Field label="Start Time" type="datetime-local" value={form.startTime || ""} onChange={(v: string) => setForm({ ...form, startTime: v })} />
              <Field label="End Time" type="datetime-local" value={form.endTime || ""} onChange={(v: string) => setForm({ ...form, endTime: v })} />
            </div>}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Attach Problems</span>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-white/[0.02] rounded-2xl p-3 border border-white/5">
                {problems.map((p: any) => (
                  <label key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition">
                    <input type="checkbox" checked={(form.problemIds || []).includes(p.id)}
                      onChange={e => { const ids = form.problemIds || []; setForm({ ...form, problemIds: e.target.checked ? [...ids, p.id] : ids.filter((x: number) => x !== p.id) }); }}
                      className="accent-[#C5A059]" />
                    <span className="text-xs text-white/80">{p.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ml-auto ${p.difficulty === "EASY" ? "bg-emerald-500/20 text-emerald-400" : p.difficulty === "MEDIUM" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>{p.difficulty}</span>
                  </label>
                ))}
                {problems.length === 0 && <p className="text-xs text-white/30 text-center py-4">No problems available. Create problems first.</p>}
              </div>
            </div>
          </>}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button onClick={() => setModal(null)} className="px-6 py-3 rounded-xl text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="btn-premium px-8 py-3 text-xs font-black uppercase tracking-widest disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : null} {modal?.type === "edit" ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={modal?.type === "delete"} onClose={() => setModal(null)} title="Confirm Delete">
        <p className="text-white/60 text-sm mb-6">Are you sure you want to delete <strong className="text-white">{modal?.item?.title || modal?.item?.name}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setModal(null)} className="px-6 py-3 rounded-xl text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition">Cancel</button>
          <button onClick={handleDelete} disabled={saving}
            className="px-8 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/30 disabled:opacity-50 transition flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={14} />} Delete
          </button>
        </div>
      </Modal>

      {/* Toast */}
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}</AnimatePresence>
    </motion.div>
  );
}
