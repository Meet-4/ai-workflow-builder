import React, { Suspense } from "react";
import WorkflowCanvas from "@/components/WorkflowCanvas";
import { Loader2 } from "lucide-react";

export default function CreateWorkflowPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-white gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm text-zinc-400">Loading flow canvas builder...</p>
        </div>
      }
    >
      <WorkflowCanvas />
    </Suspense>
  );
}
