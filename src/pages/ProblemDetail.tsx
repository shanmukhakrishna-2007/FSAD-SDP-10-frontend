import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Zap, ChevronLeft, Bot, Sparkles, ShieldCheck, XCircle,
  CheckCircle, Play, Clock, Code2, History, ChevronDown
} from "lucide-react";

interface Problem {
  id: number; title: string; description: string; difficulty: string; baseCode: string; tags: string; xpReward: number;
}

interface TestCase {
  id: number; input: string; expectedOutput: string;
}

interface TestResult {
  input: string; expectedOutput: string; passed: boolean; hidden: boolean;
}

interface SubmissionResult {
  status: string; xpGained: number; analysis: string;
  testResults: TestResult[]; totalTests: number; passedTests: number;
}

interface SubmissionHistory {
  id: number; status: string; language: string; xpEarned: number; submittedAt: string;
}

const LANGUAGES = [
  { value: "java", label: "Java 17" },
  { value: "python", label: "Python 3" },
  { value: "cpp", label: "C++ 17" },
  { value: "javascript", label: "JavaScript" },
];

export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [history, setHistory] = useState<SubmissionHistory[]>([]);
  const [activeTab, setActiveTab] = useState<"description" | "testcases" | "history">("description");
  const [bottomTab, setBottomTab] = useState<"testcases" | "results">("testcases");

  useEffect(() => {
    Promise.all([
      apiGet<Problem>(`/api/problems/${id}`),
      apiGet<TestCase[]>(`/api/problems/${id}/testcases`).catch(() => []),
      apiGet<SubmissionHistory[]>(`/api/problems/${id}/submissions`).catch(() => []),
    ]).then(([prob, tc, hist]) => {
      setProblem(prob);
      setCode(prob.baseCode || "// Write your code here");
      setTestCases(tc);
      setHistory(hist);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await apiPost<SubmissionResult>(`/api/problems/${id}/submit`, { code, language });
      setResult(data);
      setBottomTab("results");
      // Refresh history
      apiGet<SubmissionHistory[]>(`/api/problems/${id}/submissions`).then(setHistory).catch(() => {});
    } catch (err: any) {
      setResult({ status: "ERROR", xpGained: 0, analysis: err.message || "Submission failed", testResults: [], totalTests: 0, passedTests: 0 });
      setBottomTab("results");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !problem) return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-2 border-white/5 border-t-accent rounded-full" />
    </div>
  );

  const diffColor = problem.difficulty === 'HARD' ? 'text-red-400 border-red-500/20 bg-red-500/5' :
                     problem.difficulty === 'MEDIUM' ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' :
                     'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-0 -mt-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-2 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/problems")}
            className="flex items-center gap-2 text-text-tertiary hover:text-white transition-colors">
            <ChevronLeft size={18} />
            <span className="text-[9px] font-black uppercase tracking-widest">Library</span>
          </button>
          <div className="w-[1px] h-6 bg-white/10" />
          <h2 className="text-lg font-black tracking-tight truncate max-w-[300px]">{problem.title}</h2>
          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${diffColor}`}>
            {problem.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Zap size={14} className="text-amber-400" />
            <span className="text-xs font-black text-amber-400">+{problem.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0">
        {/* LEFT: Description/TestCases/History Tabs */}
        <div className="flex flex-col min-h-0 glass-card overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-white/5 shrink-0">
            {([
              { key: "description" as const, label: "Description", icon: Code2 },
              { key: "testcases" as const, label: "Test Cases", icon: Play },
              { key: "history" as const, label: "History", icon: History },
            ]).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab.key ? 'border-accent text-accent bg-accent/5' : 'border-transparent text-text-tertiary hover:text-white'
                }`}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {activeTab === "description" && (
              <div className="space-y-6">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-text-secondary font-medium leading-relaxed text-sm">{problem.description}</div>
                </div>
                {problem.tags && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                    {problem.tags.split(',').map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-text-tertiary uppercase tracking-widest">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "testcases" && (
              <div className="space-y-4">
                {testCases.length === 0 ? (
                  <p className="text-text-tertiary text-sm italic">No visible test cases for this problem.</p>
                ) : testCases.map((tc, i) => (
                  <div key={tc.id} className="glass-card p-6 border-white/5">
                    <span className="text-[9px] font-black text-accent uppercase tracking-widest mb-4 block">Case {i + 1}</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-2 block">Input</span>
                        <div className="bg-primary/60 rounded-lg p-3 font-mono text-xs text-emerald-400 border border-white/5">{tc.input}</div>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest mb-2 block">Expected Output</span>
                        <div className="bg-primary/60 rounded-lg p-3 font-mono text-xs text-amber-400 border border-white/5">{tc.expectedOutput}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-text-tertiary text-sm italic">No submissions yet.</p>
                ) : history.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-5 glass-card border-white/5">
                    <div className="flex items-center gap-4">
                      {sub.status === "ACCEPTED" ? <CheckCircle size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-red-400" />}
                      <div>
                        <span className={`text-sm font-black ${sub.status === "ACCEPTED" ? 'text-emerald-400' : 'text-red-400'}`}>{sub.status}</span>
                        <span className="text-[10px] text-text-tertiary ml-3 font-bold">{sub.language}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black text-text-tertiary">
                      {sub.xpEarned > 0 && <span className="text-amber-400">+{sub.xpEarned} XP</span>}
                      <Clock size={12} />
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Code Editor + Results */}
        <div className="flex flex-col min-h-0 gap-2">
          {/* Code Editor */}
          <div className="flex-[3] glass-card flex flex-col overflow-hidden bg-primary/40 border-white/10">
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 shrink-0">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
              </div>
              {/* Language Selector */}
              <div className="relative">
                <select value={language} onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-8 text-[10px] font-black uppercase tracking-widest text-text-secondary focus:border-accent/40 outline-none cursor-pointer">
                  {LANGUAGES.map(l => <option key={l.value} value={l.value} className="bg-primary text-white">{l.label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-transparent p-6 font-mono text-sm text-accent focus:outline-none resize-none custom-scrollbar leading-relaxed"
              spellCheck={false}
              placeholder="// Write your solution here..."
            />
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3 shrink-0">
              <button onClick={handleSubmit} disabled={submitting}
                className="btn-premium px-10 py-3 uppercase tracking-[0.15em] font-black text-[10px] disabled:opacity-50">
                {submitting ? <><Sparkles size={14} className="animate-spin mr-2" /> Evaluating...</> :
                  <><Send size={14} className="mr-2" /> Submit</>}
              </button>
            </div>
          </div>

          {/* Bottom: Test Cases / Results */}
          <div className="flex-[2] glass-card flex flex-col overflow-hidden min-h-[180px]">
            <div className="flex border-b border-white/5 shrink-0">
              <button onClick={() => setBottomTab("testcases")}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                  bottomTab === "testcases" ? 'border-accent text-accent' : 'border-transparent text-text-tertiary hover:text-white'
                }`}>Test Cases</button>
              <button onClick={() => setBottomTab("results")}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                  bottomTab === "results" ? 'border-accent text-accent' : 'border-transparent text-text-tertiary hover:text-white'
                }`}>
                Results {result && (
                  <span className={`ml-2 px-2 py-0.5 rounded text-[8px] ${result.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {result.status}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {bottomTab === "testcases" && (
                <div className="space-y-3">
                  {testCases.map((tc, i) => (
                    <div key={tc.id} className="flex gap-4 text-xs">
                      <div className="flex-1">
                        <span className="text-[8px] font-black text-text-tertiary uppercase tracking-widest">Input {i+1}</span>
                        <div className="bg-primary/60 rounded-lg p-2 mt-1 font-mono text-emerald-400 border border-white/5 text-[11px]">{tc.input}</div>
                      </div>
                      <div className="flex-1">
                        <span className="text-[8px] font-black text-text-tertiary uppercase tracking-widest">Expected</span>
                        <div className="bg-primary/60 rounded-lg p-2 mt-1 font-mono text-amber-400 border border-white/5 text-[11px]">{tc.expectedOutput}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {bottomTab === "results" && (
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      {/* Status Header */}
                      <div className={`flex items-center justify-between p-4 rounded-xl border ${
                        result.status === 'ACCEPTED' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
                      }`}>
                        <div className="flex items-center gap-3">
                          {result.status === 'ACCEPTED' ? <ShieldCheck className="text-emerald-500" size={22} /> : <XCircle className="text-red-500" size={22} />}
                          <span className={`text-lg font-black uppercase tracking-tighter ${result.status === 'ACCEPTED' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {result.status}
                          </span>
                          <span className="text-[10px] text-text-tertiary font-black">
                            {result.passedTests}/{result.totalTests} tests passed
                          </span>
                        </div>
                        {result.xpGained > 0 && (
                          <span className="text-amber-400 text-sm font-black flex items-center gap-1">
                            <Zap size={14} /> +{result.xpGained} XP
                          </span>
                        )}
                      </div>

                      {/* Test Case Results */}
                      {result.testResults.length > 0 && (
                        <div className="space-y-2">
                          {result.testResults.map((tr, i) => (
                            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-xs ${
                              tr.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
                            }`}>
                              {tr.passed ? <CheckCircle size={14} className="text-emerald-400 shrink-0" /> : <XCircle size={14} className="text-red-400 shrink-0" />}
                              <span className="font-black text-[10px] uppercase tracking-widest text-text-tertiary">Case {i+1}</span>
                              <span className="font-mono text-[11px] text-text-secondary truncate">
                                {tr.hidden ? "Hidden test case" : tr.input}
                              </span>
                              <span className={`ml-auto text-[9px] font-black uppercase ${tr.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tr.passed ? "PASS" : "FAIL"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AI Analysis */}
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2 mb-2 text-accent">
                          <Bot size={14} />
                          <span className="text-[9px] font-black uppercase tracking-widest">AI Analysis</span>
                        </div>
                        <p className="text-xs font-medium leading-relaxed text-text-secondary italic">{result.analysis}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-tertiary gap-3">
                      <Sparkles size={24} className="opacity-30" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Submit your solution to see results</p>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
