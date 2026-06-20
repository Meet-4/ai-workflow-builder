"use client";

import Link from "next/link";

import { 
  ArrowRight, 
  Sparkles, 
  Workflow as FlowIcon, 
  Cpu, 
  Activity, 
  Zap,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-violet-600/30 overflow-hidden relative">
      
      {/* Background Decorative Gradients */}
      <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl"></div>
      <div className="absolute right-10 top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/5 blur-3xl"></div>
      <div className="absolute left-1/3 bottom-10 h-80 w-80 rounded-full bg-emerald-600/5 blur-3xl"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black,transparent)]"></div>

      {/* Navbar Header */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <FlowIcon size={18} className="text-white" />
            </div>
            <span className="font-bold text-white tracking-tight text-lg">FlowMind AI</span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button className="bg-violet-650 hover:bg-violet-750 text-white text-sm shadow-[0_0_15px_rgba(124,58,237,0.35)]">
                Go to Dashboard <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-24 pb-20 text-center max-w-4xl flex flex-col items-center">
        {/* Sparkle Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/10 px-4 py-1.5 text-xs font-semibold text-violet-400 mb-8 animate-pulse">
          <Sparkles size={13} />
          <span>FlowMind AI Foundation Live</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-450 bg-clip-text text-transparent leading-none">
          Automate Workflows using <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">Natural Language</span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
          Describe your automation tasks. Our AI engine processes natural language prompts, instantly generates interactive nodes, and coordinates multi-step agent actions.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="h-12 px-6 bg-violet-600 hover:bg-violet-750 text-white text-sm font-semibold shadow-[0_0_25px_rgba(124,58,237,0.4)]">
              Launch Dashboard <ArrowRight size={15} className="ml-2" />
            </Button>
          </Link>
          <Link href="https://github.com" target="_blank">
            <Button size="lg" variant="outline" className="h-12 px-6 border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-350 hover:text-white text-sm font-semibold">
              Read Developer Docs
            </Button>
          </Link>
        </div>

        {/* Glassmorphic Mockup UI */}
        <div className="mt-20 w-full max-w-5xl rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden">
            {/* Header controls bar */}
            <div className="flex h-11 items-center justify-between border-b border-zinc-900 bg-zinc-950 px-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/25 border border-red-500/30"></span>
                <span className="h-3 w-3 rounded-full bg-yellow-500/25 border border-yellow-500/30"></span>
                <span className="h-3 w-3 rounded-full bg-green-500/25 border border-green-500/30"></span>
                <span className="text-[11px] text-zinc-500 font-mono ml-4">https://flowmind.ai/create</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[10px] text-zinc-400">
                <Lock size={10} className="text-zinc-500" /> Secure Sandbox env
              </div>
            </div>
            {/* Visual canvas grid */}
            <div className="relative h-[300px] w-full bg-[radial-gradient(#1f1f2e_1px,transparent_1px)] bg-[size:16px_16px] flex items-center justify-center gap-8 px-4 flex-wrap">
              
              {/* Mock Node 1 */}
              <div className="rounded-xl border border-emerald-500/20 bg-zinc-900/80 p-4 min-w-[170px] text-left shadow-lg">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block border-b border-zinc-800 pb-1 mb-2">Trigger Event</span>
                <span className="text-xs font-semibold text-white">Webhook Listener</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">POST /api/webhook-run</span>
              </div>

              <div className="hidden sm:block text-zinc-700 animate-pulse">
                <ArrowRight size={20} />
              </div>

              {/* Mock Node 2 */}
              <div className="rounded-xl border border-violet-500/20 bg-zinc-900/80 p-4 min-w-[170px] text-left shadow-lg relative">
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 blur-sm"></div>
                <div className="relative">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400 block border-b border-zinc-800 pb-1 mb-2">Gemini AI Agent</span>
                  <span className="text-xs font-semibold text-white">Summarize Content</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Model: 3.5 Flash</span>
                </div>
              </div>

              <div className="hidden sm:block text-zinc-700 animate-pulse">
                <ArrowRight size={20} />
              </div>

              {/* Mock Node 3 */}
              <div className="rounded-xl border border-blue-500/20 bg-zinc-900/80 p-4 min-w-[170px] text-left shadow-lg">
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 block border-b border-zinc-800 pb-1 mb-2">Action</span>
                <span className="text-xs font-semibold text-white">Slack Notification</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">Send message payload</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 container mx-auto px-6 py-12 max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-md transition hover:border-zinc-800 hover:bg-zinc-900/20">
            <div className="rounded-lg bg-zinc-900/80 p-3 w-fit text-violet-400 border border-zinc-800">
              <Cpu size={20} />
            </div>
            <h3 className="font-semibold text-white mt-4 text-base">Gemini LLM Processing</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Inject powerful intelligence workflows directly in between integration endpoints.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-md transition hover:border-zinc-800 hover:bg-zinc-900/20">
            <div className="rounded-lg bg-zinc-900/80 p-3 w-fit text-emerald-400 border border-zinc-800">
              <Zap size={20} />
            </div>
            <h3 className="font-semibold text-white mt-4 text-base">Natural Language Generation</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Generate entire workflows by typing simple descriptions. No complex wiring required.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 backdrop-blur-md transition hover:border-zinc-800 hover:bg-zinc-900/20">
            <div className="rounded-lg bg-zinc-900/80 p-3 w-fit text-blue-400 border border-zinc-800">
              <Activity size={20} />
            </div>
            <h3 className="font-semibold text-white mt-4 text-base">Realtime Run Histometrics</h3>
            <p className="text-sm text-zinc-400 mt-2">
              Monitor workflow statuses, execution timelines, and custom error logs in a central dashboard.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 py-8 mt-24">
        <div className="container mx-auto px-6 text-center text-xs text-zinc-650 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 FlowMind AI. Production-Ready Foundation.</p>
          <div className="flex gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
