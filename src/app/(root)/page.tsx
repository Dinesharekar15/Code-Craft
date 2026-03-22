"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Blocks,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  CheckCircle,
  Terminal,
  Play,
} from "lucide-react";

const CPP_SNIPPET = `#include <iostream>
using namespace std;

int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n-1) 
       + fibonacci(n-2);
}

int main() {
  for (int i = 0; i < 8; i++)
    cout << fibonacci(i) 
         << " ";
  return 0;
}`;

const OUTPUT_LINES = ["0 1 1 2 3 5 8 13"];

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const WHY_US = [
  {
    icon: Zap,
    accent: "from-blue-500 to-cyan-400",
    ring: "ring-blue-500/20",
    glow: "from-blue-500/10 to-cyan-500/5",
    title: "Instant Compilation",
    desc: "No local setup. No installs. Paste your code, hit Run — get results in seconds directly in your browser, powered by Judge0 CE.",
    bullets: ["Zero configuration", "Runs in the cloud", "Results in < 3s"],
  },
  {
    icon: Shield,
    accent: "from-purple-500 to-pink-400",
    ring: "ring-purple-500/20",
    glow: "from-purple-500/10 to-pink-500/5",
    title: "Resource Safety",
    desc: "Every execution is sandboxed with hard limits on CPU time, memory, and output — protecting you and our infrastructure.",
    bullets: ["5s execution timeout", "256 MB memory cap", "Output size limit"],
  },
  {
    icon: Globe,
    accent: "from-emerald-500 to-teal-400",
    ring: "ring-emerald-500/20",
    glow: "from-emerald-500/10 to-teal-500/5",
    title: "Multi-Language Support",
    desc: "From systems languages to scripting — we cover the spectrum. C, C++, Python, Java, Go, Rust, JavaScript and more.",
    bullets: ["C & C++ (GCC 9.2)", "Python 3.8 · Java 13", "10+ languages"],
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-200">
      {/* ── Global background glows ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[100px]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 border-b border-white/[0.05] backdrop-blur-xl bg-[#0a0a0f]/70">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
            <Blocks className="size-5 text-blue-400 group-hover:rotate-6 transition-transform duration-300" />
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text">
            CodeCraft
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/snippets"
            className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
          >
            Snippets
          </Link>
          <Link
            href="/pricing"
            className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
          >
            Pricing
          </Link>
          <Link
            href="/editor"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            Launch IDE
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-24 pb-16 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={FADE_UP}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              No setup required · Run code instantly
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={FADE_UP}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Code.{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text">
                Run.
              </span>
              <br />
              Share.
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={FADE_UP}
              className="text-lg text-gray-400 max-w-md mb-10 leading-relaxed"
            >
              A professional browser-based IDE with instant compilation for C, C++, Python,
              Java, and 10+ languages. No install. No friction.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={FADE_UP}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                href="/editor"
                className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-all duration-200 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4" />
                Get Started — It&apos;s Free
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/snippets"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 font-medium text-gray-300 hover:text-white transition-all duration-200"
              >
                Browse Snippets
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={4}
              variants={FADE_UP}
              className="flex items-center gap-6 mt-10"
            >
              {["C & C++ supported", "stdin / stdout ready", "Share snippets"].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  {t}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Mini IDE preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-transparent rounded-3xl blur-2xl" />

            <div className="relative rounded-2xl border border-white/[0.07] bg-[#12121a]/90 backdrop-blur overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-[#0d0d15]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-4 text-xs text-gray-500 font-mono">main.cpp</span>
              </div>

              {/* Split: editor + output */}
              <div className="grid grid-cols-2 divide-x divide-white/[0.05]">
                {/* Code panel */}
                <div className="p-4 font-mono text-[11px] leading-relaxed text-gray-400 overflow-hidden">
                  {CPP_SNIPPET.split("\n").map((line, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="select-none text-gray-700 w-4 text-right shrink-0">
                        {i + 1}
                      </span>
                      <span
                        className={
                          line.startsWith("#")
                            ? "text-purple-400"
                            : line.includes("int ") || line.includes("return")
                            ? "text-blue-400"
                            : line.includes("//")
                            ? "text-gray-600"
                            : line.includes("cout")
                            ? "text-emerald-400"
                            : "text-gray-300"
                        }
                      >
                        {line || "\u00a0"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Output panel */}
                <div className="p-4 flex flex-col bg-[#0f0f1a]">
                  <div className="flex items-center gap-2 mb-3">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] text-gray-400 font-medium">Output</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Execution Successful
                    </span>
                  </div>
                  {OUTPUT_LINES.map((l, i) => (
                    <p key={i} className="font-mono text-[11px] text-gray-300">
                      {l}
                    </p>
                  ))}

                  <div className="mt-auto pt-4 border-t border-white/[0.05]">
                    <div className="text-[10px] text-gray-600 space-y-0.5">
                      <div>Language: C++ (GCC 9.2)</div>
                      <div>Runtime: 142 ms</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ── Why Us ── */}
      <section className="relative z-10 py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={0}
            variants={FADE_UP}
            className="text-center mb-16"
          >
            <p className="text-sm font-medium text-blue-400 tracking-widest uppercase mb-3">
              Why CodeCraft
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Built for developers,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                not beginners.
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {WHY_US.map((card, i) => (
              <motion.div
                key={card.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                custom={i + 1}
                variants={FADE_UP}
              >
                {/* Glassmorphism card */}
                <div className="group relative h-full rounded-2xl border border-white/[0.07] bg-[#12121a]/80 backdrop-blur-xl p-7 overflow-hidden hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1">
                  {/* Background glow on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />

                  {/* Icon */}
                  <div
                    className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.glow} ring-1 ${card.ring} mb-5`}
                  >
                    <card.icon
                      className={`w-5 h-5 bg-gradient-to-r ${card.accent} text-transparent`}
                      style={{ fill: "url(#grad)" }}
                    />
                    {/* Fallback solid colour */}
                    <card.icon className="w-5 h-5 text-white absolute" />
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 relative">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-5 relative">
                    {card.desc}
                  </p>

                  <ul className="space-y-2 relative">
                    {card.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 py-24 px-6 md:px-12 lg:px-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={FADE_UP}
          className="max-w-4xl mx-auto relative"
        >
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur" />
          <div className="relative rounded-2xl border border-white/[0.07] bg-[#12121a]/90 backdrop-blur-xl p-10 md:p-14 text-center">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to start coding?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Open the IDE right now — no sign-up needed to run your first program.
            </p>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-sm transition-all duration-200 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4" />
              Open the IDE — Free
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6 md:px-12 lg:px-20 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} CodeCraft · Built with Next.js, Convex &amp; Judge0 CE
      </footer>
    </div>
  );
}
