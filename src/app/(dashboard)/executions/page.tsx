"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Activity,
  RefreshCw,
  Workflow as FlowIcon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface NodeResult {
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: "success" | "failed" | "skipped";
  message: string;
  durationMs: number;
}

interface Execution {
  _id: string;
  workflowId: string;
  workflowTitle?: string;
  status: "success" | "failed" | "running";
  logs: string[];
  nodeResults?: NodeResult[];
  durationMs?: number;
  executedAt: string;
  startedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Execution["status"] }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        <CheckCircle2 size={11} /> Success
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
        <XCircle size={11} /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
      <Clock size={11} className="animate-spin" /> Running
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Execution row with expandable logs
// ─────────────────────────────────────────────────────────────

function ExecutionRow({ exec }: { exec: Execution }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden transition-all hover:border-zinc-700">
      {/* Summary row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Expand icon */}
        <span className="text-zinc-500 flex-shrink-0">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>

        {/* Workflow name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 flex-shrink-0">
            <FlowIcon size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {exec.workflowTitle ?? "Unknown Workflow"}
            </p>
            <p className="text-[11px] text-zinc-500 font-mono truncate">
              {exec.workflowId}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          <StatusBadge status={exec.status} />
        </div>

        {/* Duration */}
        {exec.durationMs !== undefined && (
          <div className="flex-shrink-0 flex items-center gap-1 text-xs text-zinc-500">
            <Clock size={11} />
            <span>{exec.durationMs}ms</span>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex-shrink-0 text-xs text-zinc-500 hidden sm:block">
          {new Date(exec.executedAt).toLocaleString()}
        </div>
      </div>

      {/* Expanded: node results + logs */}
      {expanded && (
        <div className="border-t border-zinc-800 bg-zinc-950/50 px-5 py-4 space-y-4">

          {/* Per-node results */}
          {exec.nodeResults && exec.nodeResults.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Node Results
              </p>
              <div className="space-y-2">
                {exec.nodeResults.map((nr) => (
                  <div
                    key={nr.nodeId}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-3 border text-xs",
                      nr.status === "success"
                        ? "border-emerald-500/15 bg-emerald-500/5"
                        : nr.status === "failed"
                        ? "border-red-500/15 bg-red-500/5"
                        : "border-zinc-800 bg-zinc-900/40"
                    )}
                  >
                    <span className="mt-0.5 flex-shrink-0">
                      {nr.status === "success" ? (
                        <CheckCircle2 size={13} className="text-emerald-400" />
                      ) : nr.status === "failed" ? (
                        <XCircle size={13} className="text-red-400" />
                      ) : (
                        <AlertCircle size={13} className="text-zinc-500" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white">{nr.nodeLabel}</span>
                        <span className="text-zinc-500 flex-shrink-0">{nr.durationMs}ms</span>
                      </div>
                      <p className="text-zinc-400 mt-0.5">{nr.message}</p>
                      <p className="text-zinc-600 font-mono text-[10px] mt-0.5">type: {nr.nodeType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          {exec.logs && exec.logs.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Execution Logs
              </p>
              <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-3 max-h-52 overflow-y-auto">
                {exec.logs.map((log, i) => (
                  <p key={i} className="text-[11px] font-mono text-zinc-400 leading-relaxed">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* If no detailed info available */}
          {(!exec.nodeResults || exec.nodeResults.length === 0) &&
            (!exec.logs || exec.logs.length === 0) && (
              <p className="text-xs text-zinc-600 italic">No detailed execution data available.</p>
            )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/executions");
      if (res.ok) {
        const data = await res.json();
        setExecutions(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = executions.filter((e) =>
    filter === "all" ? true : e.status === filter
  );

  const total   = executions.length;
  const success = executions.filter((e) => e.status === "success").length;
  const failed  = executions.filter((e) => e.status === "failed").length;
  const rate    = total > 0 ? Math.round((success / total) * 100) : 0;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="text-violet-400" size={28} /> Execution History
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Monitor every workflow run — view logs, node results, and performance metrics.
          </p>
        </div>
        <Button
          onClick={load}
          disabled={isLoading}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 self-start md:self-auto"
        >
          <RefreshCw size={14} className={cn("mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md">
          <p className="text-xs font-medium text-zinc-400">Total Runs</p>
          <p className="text-3xl font-bold text-white mt-2">{total}</p>
          <p className="text-xs text-zinc-500 mt-1">All time executions</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md">
          <p className="text-xs font-medium text-zinc-400">Successful</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{success}</p>
          <p className="text-xs text-zinc-500 mt-1">Completed without errors</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md">
          <p className="text-xs font-medium text-zinc-400">Failed</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{failed}</p>
          <p className="text-xs text-zinc-500 mt-1">Encountered errors</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-md">
          <p className="text-xs font-medium text-zinc-400">Success Rate</p>
          <p className="text-3xl font-bold text-white mt-2">{rate}%</p>
          <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "success", "failed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
              filter === f
                ? "bg-violet-600/20 border-violet-500/30 text-violet-400"
                : "bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && (
              <span className="ml-1.5 text-zinc-600">
                ({f === "success" ? success : failed})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Execution list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
          <RefreshCw size={28} className="animate-spin text-violet-500" />
          <p className="text-sm">Loading execution history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-16 text-center bg-zinc-900/10">
          <div className="rounded-full bg-zinc-900/80 p-4 mb-4 text-zinc-500 border border-zinc-800">
            <Activity size={28} />
          </div>
          <h3 className="text-base font-semibold text-white">
            {filter === "all" ? "No executions yet" : `No ${filter} executions`}
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm mt-2">
            {filter === "all"
              ? "Open a workflow in the canvas builder and click Execute to run it."
              : `There are no ${filter} executions matching the current filter.`}
          </p>
          {filter === "all" && (
            <Link href="/workflows" className="mt-5">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                Go to Workflows
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exec) => (
            <ExecutionRow key={exec._id} exec={exec} />
          ))}
        </div>
      )}
    </div>
  );
}
