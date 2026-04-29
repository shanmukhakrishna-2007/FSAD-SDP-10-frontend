import { motion } from "framer-motion";
import { ShieldAlert, LogIn } from "lucide-react";

interface SessionExpiredModalProps {
  open: boolean;
  onLogin: () => void;
}

export default function SessionExpiredModal({ open, onLogin }: SessionExpiredModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md p-10 shadow-[0_0_100px_-20px_rgba(197,160,89,0.15)] text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8"
        >
          <ShieldAlert size={36} className="text-amber-400" />
        </motion.div>

        <h3 className="text-2xl font-black tracking-tight text-white mb-3">
          Session Expired
        </h3>
        <p className="text-text-secondary text-sm font-medium leading-relaxed mb-10 max-w-xs mx-auto">
          Your secure session has timed out due to inactivity. Please authenticate again to continue.
        </p>

        <button
          onClick={onLogin}
          className="btn-premium w-full h-14 text-xs uppercase tracking-[0.3em] font-black shadow-glow group"
        >
          <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
          Re-Authenticate
        </button>

        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-tertiary mt-6">
          Tier-4 Secure Protocol • Auto-Lock Active
        </p>
      </motion.div>
    </div>
  );
}
