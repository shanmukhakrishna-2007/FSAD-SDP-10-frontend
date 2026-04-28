import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, BookOpen, Clock, Award, Sparkles, CheckCircle, XCircle,
  ArrowRight, Target, Zap, Lock, BrainCircuit, Trophy, RotateCcw, Play
} from "lucide-react";

interface CourseData {
  id: number; title: string; description: string; difficulty: string;
  durationHours: number; topics: string; trending: boolean; pathName: string | null;
}

interface QuizQuestion {
  questionText: string; optionA: string; optionB: string;
  optionC: string; optionD: string; correctOption: string; explanation: string;
}

type Phase = "overview" | "materials" | "quiz" | "results";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("overview");

  // Materials tracking
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const modules: string[] = course?.topics?.split(",").map(t => t.trim()).filter(Boolean) || [];

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);

  // Completion state
  const [completing, setCompleting] = useState(false);
  const [certId, setCertId] = useState<number | null>(null);

  useEffect(() => {
    apiGet<CourseData>(`/api/courses/${id}`)
      .then(setCourse)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const allModulesComplete = modules.length > 0 && completedModules.size >= modules.length;

  const toggleModule = (idx: number) => {
    setCompletedModules(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const startQuiz = async () => {
    setQuizLoading(true);
    try {
      const data = await apiPost<{ questions: QuizQuestion[]; courseTitle: string }>(`/api/courses/${id}/generate-quiz`, {});
      setQuizQuestions(data.questions || []);
      setCurrentQ(0);
      setScore(0);
      setSelected(null);
      setShowAnswer(false);
      setPhase("quiz");
    } catch {
      // fallback handled
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelect = (key: string) => {
    if (showAnswer) return;
    setSelected(key);
    setShowAnswer(true);
    if (key === quizQuestions[currentQ].correctOption) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setPhase("results");
    }
  };

  const quizPct = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;
  const passed = quizPct >= 70;

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const data = await apiPost<{ certificateId: number; message: string }>(`/api/courses/${id}/complete`, { quizScore: quizPct });
      setCertId(data.certificateId);
    } catch { } finally {
      setCompleting(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-6 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-2 border-white/5 border-t-accent rounded-full" />
        <p className="text-sm font-black uppercase tracking-[0.2em] text-text-tertiary">Loading Course Intelligence...</p>
      </div>
    );
  }

  // ─── OVERVIEW PHASE ───
  if (phase === "overview") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-24 max-w-5xl mx-auto">
        <button onClick={() => navigate("/courses")}
          className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-accent transition-all group">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-all">
            <ChevronLeft size={14} />
          </div>
          Back to Courses
        </button>

        {/* Course Header */}
        <div className="glass-card p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-accent" />
              <span className="section-label !mb-0">{course.pathName || "Career Path"} / Course</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-text-primary leading-tight">{course.title}</h1>
            <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-3xl mb-10">{course.description}</p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                <Clock size={18} className="text-accent" />
                <span className="text-sm font-black">{course.durationHours} Hours</span>
              </div>
              <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${
                course.difficulty === 'Beginner' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' :
                course.difficulty === 'Intermediate' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' :
                'border-purple-500/20 text-purple-400 bg-purple-500/5'
              }`}>
                <Target size={18} />
                <span className="text-sm font-black">{course.difficulty}</span>
              </div>
              {course.trending && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-amber-500/20 text-amber-400 bg-amber-500/5">
                  <Sparkles size={18} />
                  <span className="text-sm font-black">Trending</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "01", label: "Study Materials", desc: "Review all course modules and mark them complete", icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
            { step: "02", label: "Take the Exam", desc: "Pass the AI-generated quiz with ≥70% score", icon: BrainCircuit, color: "text-purple-400", bg: "bg-purple-500/10" },
            { step: "03", label: "Earn Certificate", desc: "Download your verified professional credential", icon: Award, color: "text-accent", bg: "bg-accent/10" },
          ].map((s, i) => (
            <div key={i} className="glass-card p-8 text-center">
              <div className={`w-14 h-14 rounded-2xl ${s.bg} border border-white/10 flex items-center justify-center mx-auto mb-6`}>
                <s.icon size={24} className={s.color} />
              </div>
              <span className="text-[10px] font-black text-accent uppercase tracking-widest">{s.step}</span>
              <h4 className="text-xl font-black mt-2 mb-3">{s.label}</h4>
              <p className="text-text-secondary text-sm font-medium">{s.desc}</p>
            </div>
          ))}
        </div>

        <button onClick={() => setPhase("materials")} className="btn-premium w-full h-16 uppercase tracking-[0.2em] font-black text-xs">
          Begin Course <ArrowRight size={18} className="ml-2" />
        </button>
      </motion.div>
    );
  }

  // ─── MATERIALS PHASE ───
  if (phase === "materials") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pb-24 max-w-5xl mx-auto">
        <button onClick={() => setPhase("overview")}
          className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-text-tertiary hover:text-accent transition-all group">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-all">
            <ChevronLeft size={14} />
          </div>
          Course Overview
        </button>

        <div>
          <span className="section-label">Course Modules / {course.title}</span>
          <h2 className="text-4xl font-black tracking-tight">Study <span className="accent-gradient">Materials.</span></h2>
          <p className="text-text-secondary mt-4 text-lg font-medium">Complete all modules below, then proceed to the certification exam.</p>
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Module Progress</span>
            <span className="text-sm font-black text-accent">{completedModules.size} / {modules.length}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${modules.length > 0 ? (completedModules.size / modules.length) * 100 : 0}%` }}
              className="h-full bg-accent rounded-full shadow-glow shadow-accent/30" transition={{ duration: 0.5 }} />
          </div>
        </div>

        {/* Module List */}
        <div className="space-y-4">
          {modules.map((module, idx) => {
            const done = completedModules.has(idx);
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card p-8 flex items-start gap-6 cursor-pointer group transition-all ${done ? 'border-emerald-500/20' : 'hover:border-accent/20'}`}
                onClick={() => toggleModule(idx)}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                  done ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-white/5 border-white/10 group-hover:border-accent/30'}`}>
                  {done ? <CheckCircle size={22} className="text-emerald-400" /> :
                    <span className="text-sm font-black text-text-tertiary">{String(idx + 1).padStart(2, '0')}</span>}
                </div>
                <div className="flex-1">
                  <h4 className={`text-xl font-black mb-2 transition-colors ${done ? 'text-emerald-400' : 'group-hover:text-accent'}`}>{module}</h4>
                  <p className="text-text-secondary text-sm font-medium">
                    Study this topic thoroughly. Covers key concepts, best practices, and real-world applications.
                    Click to mark as {done ? "incomplete" : "complete"}.
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                  done ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-white/10 text-text-tertiary bg-white/5'
                }`}>
                  {done ? "Completed" : "Pending"}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Take Exam Button */}
        <div className="glass-card p-10 text-center relative overflow-hidden">
          {!allModulesComplete && <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="flex items-center gap-3 text-text-tertiary">
              <Lock size={20} />
              <span className="text-sm font-black uppercase tracking-widest">Complete all modules to unlock exam</span>
            </div>
          </div>}
          <BrainCircuit size={40} className="text-purple-400 mx-auto mb-6" />
          <h3 className="text-2xl font-black mb-3">Certification Exam</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">5 AI-generated questions based on course content. You need ≥70% to pass and earn your certificate.</p>
          <button onClick={startQuiz} disabled={!allModulesComplete || quizLoading}
            className="btn-premium px-16 h-16 uppercase tracking-[0.2em] font-black text-xs disabled:opacity-50">
            {quizLoading ? <><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Generating Exam...</> :
              <><Play size={18} /> Start Exam</>}
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── QUIZ PHASE ───
  if (phase === "quiz" && quizQuestions.length > 0) {
    const q = quizQuestions[currentQ];
    const options = [
      { key: "A", text: q.optionA }, { key: "B", text: q.optionB },
      { key: "C", text: q.optionC }, { key: "D", text: q.optionD },
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-10 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <BrainCircuit size={28} className="text-purple-400" />
            </div>
            <div>
              <span className="section-label !mb-0 text-purple-400">Certification Exam</span>
              <h3 className="text-2xl font-black tracking-tighter">{course.title}</h3>
            </div>
          </div>
          <div className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-tertiary">
            Q <span className="text-accent">{currentQ + 1}</span> / {quizQuestions.length}
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${((currentQ + 1) / quizQuestions.length) * 100}%` }}
            className="h-full bg-purple-500 shadow-glow shadow-purple-500/30" transition={{ duration: 0.5 }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="glass-card p-10 md:p-14">
              <h3 className="text-xl md:text-2xl font-black text-white mb-12 leading-relaxed text-center italic">
                "{q.questionText}"
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {options.map(opt => {
                  let cls = "border-white/5 bg-white/[0.02]";
                  if (showAnswer) {
                    if (opt.key === q.correctOption) cls = "border-emerald-500/40 bg-emerald-500/10";
                    else if (opt.key === selected) cls = "border-red-500/40 bg-red-500/10";
                    else cls = "opacity-40 border-white/5";
                  } else if (opt.key === selected) cls = "border-purple-500/40 bg-purple-500/10";

                  return (
                    <button key={opt.key} onClick={() => handleSelect(opt.key)}
                      className={`flex items-center p-6 rounded-2xl border transition-all ${cls} text-left group/opt`}>
                      <div className="mr-5 shrink-0">
                        {showAnswer && opt.key === q.correctOption ? <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-primary"><CheckCircle size={20} /></div> :
                         showAnswer && opt.key === selected ? <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-primary"><XCircle size={20} /></div> :
                         <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 font-black text-[10px]">{opt.key}</span>}
                      </div>
                      <span className="text-sm font-bold">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {showAnswer && q.explanation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-12 p-8 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-6 max-w-3xl mx-auto">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                    <BrainCircuit size={22} className="text-purple-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Explanation</span>
                    <p className="text-text-secondary text-sm font-medium leading-relaxed mt-1 italic">"{q.explanation}"</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end">
          {showAnswer && (
            <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              onClick={handleNext} className="btn-premium h-16 px-16 text-xs uppercase tracking-[0.3em] font-black group">
              {currentQ < quizQuestions.length - 1 ?
                <span className="flex items-center gap-3">Next <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span> :
                <span className="flex items-center gap-3">Finish Exam <CheckCircle size={18} /></span>}
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  // ─── RESULTS PHASE ───
  if (phase === "results") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-12 pb-24 text-center">
        <div className="glass-card p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full" />

          <div className={`w-24 h-24 rounded-[32px] mx-auto mb-10 flex items-center justify-center border ${
            passed ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/20 shadow-glow' : 'bg-red-500/10 border-red-500/20'
          }`}>
            <Trophy size={44} className={passed ? 'text-emerald-400' : 'text-red-400'} />
          </div>

          <h2 className="text-4xl font-black tracking-tighter mb-4 italic">
            Exam <span className={passed ? 'text-emerald-400' : 'text-red-400'}>{passed ? "Passed!" : "Failed."}</span>
          </h2>
          <p className="section-label !mb-8">{course.title}</p>

          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }}
            className={`text-7xl font-black tracking-tighter leading-none mb-8 ${passed ? 'accent-gradient' : 'text-red-400'}`}>
            {quizPct}%
          </motion.div>

          <div className="flex items-center justify-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-10 mx-auto w-fit">
            <Zap size={14} className="text-accent" />
            {score} / {quizQuestions.length} Correct — {passed ? "Certification Unlocked" : "70% required to pass"}
          </div>

          {passed ? (
            <div className="space-y-4">
              {certId ? (
                <button onClick={() => navigate(`/certificate/${certId}`)}
                  className="btn-premium w-full h-16 uppercase tracking-[0.2em] font-black text-xs">
                  <Award size={18} className="mr-2" /> View Certificate
                </button>
              ) : (
                <button onClick={handleComplete} disabled={completing}
                  className="btn-premium w-full h-16 uppercase tracking-[0.2em] font-black text-xs disabled:opacity-50">
                  {completing ? <><div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" /> Generating Certificate...</> :
                    <><Award size={18} className="mr-2" /> Claim Certificate</>}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <button onClick={() => { setPhase("materials"); setScore(0); setCurrentQ(0); setSelected(null); setShowAnswer(false); }}
                className="btn-premium w-full h-16 uppercase tracking-[0.2em] font-black text-xs">
                <RotateCcw size={18} className="mr-2" /> Review Materials & Retry
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return null;
}
