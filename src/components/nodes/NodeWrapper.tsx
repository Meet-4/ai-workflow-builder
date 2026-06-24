"use client";

/**
 * NodeWrapper
 * A shared container used by all custom node types.
 * Handles: border colour, header badge, delete button, handles.
 */

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type NodeVariant = "trigger" | "action" | "agent" | "webhook" | "condition" | "integration";

interface NodeWrapperProps {
  id: string;
  variant: NodeVariant;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  hasTarget?: boolean;
  hasSource?: boolean;
  onDelete?: (id: string) => void;
  isRunning?: boolean;
  isSuccess?: boolean;
  isFailed?: boolean;
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<
  NodeVariant,
  { border: string; badge: string; dot: string; handle: string }
> = {
  trigger:     { border: "border-emerald-500/30", badge: "text-emerald-400", dot: "bg-emerald-500",     handle: "bg-emerald-500" },
  action:      { border: "border-blue-500/30",    badge: "text-blue-400",    dot: "bg-blue-500",        handle: "bg-blue-500" },
  agent:       { border: "border-violet-500/30",  badge: "text-violet-400",  dot: "bg-violet-500",      handle: "bg-violet-500" },
  webhook:     { border: "border-amber-500/30",   badge: "text-amber-400",   dot: "bg-amber-500",       handle: "bg-amber-500" },
  condition:   { border: "border-orange-500/30",  badge: "text-orange-400",  dot: "bg-orange-500",      handle: "bg-orange-500" },
  integration: { border: "border-cyan-500/30",    badge: "text-cyan-400",    dot: "bg-cyan-500",        handle: "bg-cyan-500" },
};

export default function NodeWrapper({
  id,
  variant,
  label,
  description,
  icon,
  badge,
  hasTarget = true,
  hasSource = true,
  onDelete,
  isRunning,
  isSuccess,
  isFailed,
  children,
}: NodeWrapperProps) {
  const styles = VARIANT_STYLES[variant];

  const statusRing = isRunning
    ? "ring-2 ring-violet-500/60 ring-offset-1 ring-offset-zinc-950"
    : isSuccess
    ? "ring-2 ring-emerald-500/60 ring-offset-1 ring-offset-zinc-950"
    : isFailed
    ? "ring-2 ring-red-500/60 ring-offset-1 ring-offset-zinc-950"
    : "";

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-zinc-900/90 p-4 shadow-xl backdrop-blur-md min-w-[210px] text-left transition-all duration-200",
        styles.border,
        statusRing
      )}
    >
      {/* Target handle (top) */}
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Top}
          className={cn("!w-3 !h-3 !border-2 !border-zinc-950", styles.handle)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2.5">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-ping" />
          ) : isSuccess ? (
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          ) : isFailed ? (
            <span className="flex h-2 w-2 rounded-full bg-red-500" />
          ) : (
            <span className={cn("flex h-2 w-2 rounded-full", styles.dot, variant === "agent" && "animate-pulse")} />
          )}
          <span className={cn("text-xs font-bold uppercase tracking-wider", styles.badge)}>
            {badge}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-zinc-500", styles.badge)}>{icon}</span>
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="text-zinc-600 hover:text-red-400 transition-colors"
              title="Delete node"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div>
        <h4 className="text-sm font-semibold text-white leading-snug">{label}</h4>
        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{description}</p>
      </div>

      {children && <div className="mt-2.5">{children}</div>}

      {/* Source handle (bottom) */}
      {hasSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          className={cn("!w-3 !h-3 !border-2 !border-zinc-950", styles.handle)}
        />
      )}
    </div>
  );
}
