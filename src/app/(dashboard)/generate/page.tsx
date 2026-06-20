"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Loader2, Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GenerateWorkflowPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError("");
    setResult(null);
    setUsedFallback(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate workflow");
      }

      setResult(data);
      // If the workflowId starts with "local-" it means we used the fallback path
      if (data.workflowId?.toString().startsWith("local-")) {
        setUsedFallback(true);
      }
    } catch (err: any) {
      // Surface a clean, human-friendly error (never raw JSON blobs)
      let msg: string = err.message || "Something went wrong. Please try again.";
      // Strip raw JSON if it snuck through
      if (msg.startsWith("{")) {
        try {
          const parsed = JSON.parse(msg);
          msg = parsed?.error?.message ?? "An unexpected error occurred.";
        } catch {
          msg = "An unexpected error occurred.";
        }
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Sparkles className="text-violet-500" /> AI Workflow Generator
        </h2>
        <p className="text-sm text-zinc-400 mt-2">
          Describe the automation you want to build in plain English, and our AI will translate it into an executable workflow.
        </p>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-md">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Describe your workflow
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
          }}
          placeholder='e.g., "When a PDF is uploaded, summarize it and save the summary to the database."'
          className="w-full h-32 rounded-xl bg-zinc-950 border border-zinc-800 text-white p-4 focus:ring-1 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none mb-4 placeholder-zinc-600"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Powered by Google Gemini · <span className="text-zinc-600">Ctrl+Enter to generate</span>
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate JSON
              </>
            )}
          </Button>
        </div>

        {/* Error display — always human-readable */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm leading-relaxed">
            <strong className="block mb-1">Generation failed</strong>
            {error}
          </div>
        )}
      </div>

      {/* Fallback notice */}
      {usedFallback && result && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-400 text-sm">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Using smart keyword analysis</strong> — The Gemini API quota is currently exhausted.
            Your workflow was generated using an offline keyword-matching engine and will be just as accurate for common use-cases.
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Generated JSON Schema</h3>
              <Link href={`/create?id=${result.workflowId}`}>
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                  <Play className="mr-2 h-3.5 w-3.5" /> Edit in Canvas
                </Button>
              </Link>
            </div>

            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 overflow-x-auto">
              <pre className="text-sm text-emerald-400 font-mono">
                {JSON.stringify(result.generatedFormat, null, 2)}
              </pre>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-white mb-4">Workflow Summary</h3>
            <div className="flex items-center gap-4 text-sm text-zinc-300 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <div className="bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800 font-medium text-violet-400">
                Trigger: {result.generatedFormat.trigger}
              </div>
              <ArrowRight className="text-zinc-600 flex-shrink-0" size={16} />
              <div className="flex flex-wrap gap-2">
                {result.generatedFormat.steps.map((step: any, index: number) => (
                  <React.Fragment key={index}>
                    <div className="bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800 text-blue-400">
                      {step.type}
                    </div>
                    {index < result.generatedFormat.steps.length - 1 && (
                      <ArrowRight className="text-zinc-600 mt-2 flex-shrink-0" size={14} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
