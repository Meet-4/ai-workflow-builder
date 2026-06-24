"use client";

/**
 * ActionNodes.tsx
 * All action-type nodes: AiSummary, SaveDatabase, SendEmail, SlackMessage,
 * GitHubIssue, NotionPage, DiscordMessage, GoogleDrive
 */

import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import {
  Sparkles,
  Database,
  Mail,
  MessageSquare,
  BookOpen,
  MessageCircle,
  HardDrive,
  GitBranch,
} from "lucide-react";
import NodeWrapper from "./NodeWrapper";
import type { WorkflowNodeData } from "@/lib/node-registry";

type Props = NodeProps<Node<WorkflowNodeData>>;

/** AI Summary — uses Gemini to summarise content */
export function AiSummaryNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="agent"
      badge="AI Summary"
      label={data.label}
      description={data.description || "Summarises input using Gemini Flash."}
      icon={<Sparkles size={13} />}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}

/** Save Database — persists data to MongoDB / local store */
export function SaveDatabaseNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="action"
      badge="Save Database"
      label={data.label}
      description={data.description || "Persists the payload to the database."}
      icon={<Database size={13} />}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}

/** Send Email — dispatches an email notification */
export function SendEmailNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="action"
      badge="Send Email"
      label={data.label}
      description={data.description || "Sends an email with the workflow result."}
      icon={<Mail size={13} />}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}

/** Slack Message — posts to a Slack channel */
export function SlackMessageNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="integration"
      badge="Slack"
      label={data.label}
      description={data.description || "Posts the result to a Slack channel."}
      icon={<MessageSquare size={13} />}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}

/** GitHub Issue — creates or updates a GitHub issue */
export function GitHubIssueNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="integration"
      badge="GitHub"
      label={data.label}
      description={data.description || "Creates a GitHub issue from the result."}
      icon={<GitBranch size={13} />}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}

/** Notion Page — appends content to a Notion page */
export function NotionPageNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="integration"
      badge="Notion"
      label={data.label}
      description={data.description || "Appends the result to a Notion page."}
      icon={<BookOpen size={13} />}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}

/** Discord Message — sends to a Discord channel */
export function DiscordMessageNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="integration"
      badge="Discord"
      label={data.label}
      description={data.description || "Sends a message to a Discord channel."}
      icon={<MessageCircle size={13} />}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}

/** Google Drive — saves a file to Google Drive */
export function GoogleDriveNode({ id, data }: Props) {
  return (
    <NodeWrapper
      id={id}
      variant="integration"
      badge="Google Drive"
      label={data.label}
      description={data.description || "Uploads or updates a file in Google Drive."}
      icon={<HardDrive size={13} />}
      onDelete={data.onDelete}
      isRunning={data.isRunning}
      isSuccess={data.isSuccess}
      isFailed={data.isFailed}
    />
  );
}
