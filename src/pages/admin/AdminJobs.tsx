import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Briefcase, Plus, Trash2, ExternalLink, Search } from "lucide-react";
import { motion } from "framer-motion";

interface JobPost { id: string; title: string; company: string; type: "Job" | "Internship"; link: string; location: string; description: string; }

export default function AdminJobs() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<JobPost[]>([
    { id: "1", title: "Software Engineer Intern", company: "Google", type: "Internship", link: "https://careers.google.com/jobs/results/", location: "Bangalore, India", description: "SWE internship for summer 2026" },
    { id: "2", title: "Full Stack Developer", company: "Microsoft", type: "Job", link: "https://careers.microsoft.com/", location: "Hyderabad, India", description: "Build cloud-native applications" },
    { id: "3", title: "ML Engineer Intern", company: "Amazon", type: "Internship", link: "https://www.amazon.jobs/en/", location: "Remote", description: "Machine learning research internship" },
  ]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", type: "Job" as "Job" | "Internship", link: "", location: "", description: "" });

  const filtered = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    if (!form.company.trim()) { showToast("Company is required", "error"); return; }
    if (!form.link.trim()) { showToast("Application link is required", "error"); return; }
    if (!form.link.startsWith("http")) { showToast("Link must start with http:// or https://", "error"); return; }
    setJobs([...jobs, { ...form, id: Date.now().toString() }]);
    setForm({ title: "", company: "", type: "Job", link: "", location: "", description: "" });
    setShowForm(false);
    showToast("Job posting added", "success");
  };

  const handleDelete = (id: string) => { setJobs(jobs.filter(j => j.id !== id)); showToast("Removed", "success"); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><h1 className="text-3xl font-black tracking-tighter">Jobs & <span className="accent-gradient">Internships.</span></h1><p className="text-text-secondary text-sm mt-1">Post real job opportunities with application links</p></div>
        <button onClick={() => setShowForm(!showForm)} className="btn-premium px-6 py-3 text-xs font-black uppercase tracking-widest"><Plus size={16} /> Post Opportunity</button>
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 space-y-4">
          <h3 className="text-lg font-black uppercase mb-2">New Job / Internship Posting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-white/50">Title *</label><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Software Engineer" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-white/50">Company *</label><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Google" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-white/50">Application Link *</label><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://careers.google.com/..." /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-white/50">Location</label><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Bangalore, India" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-white/50">Type</label><select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}><option value="Job">Job</option><option value="Internship">Internship</option></select></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-white/50">Description</label><input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/50" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition">Cancel</button>
            <button onClick={handleAdd} className="btn-premium px-8 py-3 text-xs font-black uppercase tracking-widest">Post</button>
          </div>
        </motion.div>
      )}

      <div className="relative max-w-md"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search postings..." className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/40 transition" /></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(j => (
          <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${j.type === "Internship" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>{j.type}</span>
                <h4 className="text-lg font-black mt-3">{j.title}</h4>
                <p className="text-sm text-white/60 font-bold">{j.company} • {j.location}</p>
              </div>
              <button onClick={() => handleDelete(j.id)} className="p-2 rounded-xl hover:bg-red-500/20 text-white/30 hover:text-red-400 transition"><Trash2 size={16} /></button>
            </div>
            {j.description && <p className="text-xs text-white/40">{j.description}</p>}
            <a href={j.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-black text-accent hover:underline uppercase tracking-widest">
              Apply Now <ExternalLink size={12} />
            </a>
          </motion.div>
        ))}
        {filtered.length === 0 && <div className="col-span-2 glass-card p-16 text-center text-white/30 text-sm font-bold">No postings found. Add one above.</div>}
      </div>
    </motion.div>
  );
}
