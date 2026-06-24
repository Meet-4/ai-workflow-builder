"use client";

/**
 * TriggerNodes.tsx
 * All trigger-type nodes: ManualTrigger, PdfUpload, WebhookTrigger, ScheduleTrigger
 */

import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import { MousePointerClick, FileText, Globe, Clock } from "lucide-react";
import NodeWrapper from "./NodeWrapper";
import type { WorkflowNodeData } from "@/lib/node-registry";

type Props = NodeProps<Node<WorkflowNodeData>>;

/** Manual Trigger — fires when user clicks "Run" */
export function ManualTriggerNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="trigger"
      badge="Manual Trigger"
      label={data.label}
      description={data.description || "Fires on demand when you click Execute."}
      icon={<MousePointerClick size={13} />}
      hasTarget={false}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}

/** PDF Upload Trigger — fires when a file is dropped */
export function PdfUploadNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="trigger"
      badge="PDF Upload"
      label={data.label}
      description={data.description || "Triggers when a PDF document is uploaded."}
      icon={<FileText size={13} />}
      hasTarget={false}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}

/** Webhook Trigger — listens on an HTTP endpoint */
export function WebhookTriggerNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="webhook"
      badge="Webhook"
      label={data.label}
      description={data.description || "Listens for an incoming HTTP POST request."}
      icon={<Globe size={13} />}
      hasTarget={false}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}

/** Schedule Trigger — fires on a cron schedule */
export function ScheduleTriggerNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="trigger"
      badge="Schedule"
      label={data.label}
      description={data.description || "Runs automatically on a cron schedule."}
      icon={<Clock size={13} />}
      hasTarget={false}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}
