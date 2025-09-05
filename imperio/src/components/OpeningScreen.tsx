import { motion } from "framer-motion";
import { Play, FolderOpen } from "lucide-react";

// Props allow your app to wire up handlers later
type OpeningScreenProps = {
  onNewGame?: () => void;
  onLoadGame?: () => void;
  className?: string;
};

// Minimal, clean, and centered splash with two primary actions
export default function OpeningScreen({
  onNewGame,
  onLoadGame,
  className = "",
}: OpeningScreenProps) {
  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 grid place-items-center p-6 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide drop-shadow-sm">
            Imperio
          </h1>
          <p className="mt-2 text-slate-300">Turn‑based strategy in your browser</p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={onNewGame}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl w-full px-6 py-4 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 transition shadow-lg shadow-sky-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 focus:ring-offset-slate-950"
          >
            <Play className="h-5 w-5" />
            <span className="text-lg font-semibold">New Game</span>
          </button>

          <button
            onClick={onLoadGame}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 transition shadow-lg shadow-black/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 focus:ring-offset-slate-950"
          >
            <FolderOpen className="h-5 w-5" />
            <span className="text-lg font-semibold">Load Game</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          v0.1 • © {new Date().getFullYear()} Imperio
        </div>
      </motion.div>
    </div>
  );
}
