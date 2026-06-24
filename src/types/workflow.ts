/**
 * Workflow type definitions
 * Defines the core workflow data structures for JSON serialization and visualization
 */

// Base node configuration
export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  data: Record<string, unknown>;
  position?: { x: number; y: number };
}

// Base edge configuration
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Workflow definition
export interface Workflow {
  id: string;
  title: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata?: WorkflowMetadata;
}

// Workflow metadata
export interface WorkflowMetadata {
  version: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// Execution result
export interface ExecutionResult {
  workflowId: string;
  executionId: string;
  status: 'success' | 'failed' | 'pending' | 'running';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  nodeResults: Map<string, NodeExecutionResult>;
  logs: ExecutionLog[];
  error?: ExecutionError;
}

// Node execution result
export interface NodeExecutionResult {
  nodeId: string;
  nodeType: NodeType;
  status: 'success' | 'failed' | 'pending' | 'running';
  output?: unknown;
  error?: ExecutionError;
  duration?: number;
  startTime?: Date;
  endTime?: Date;
}

// Execution log entry
export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  nodeId?: string;
  context?: Record<string, unknown>;
}

// Execution error
export interface ExecutionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

// Node types (extensible for future integrations)
export type NodeType =
  | 'trigger'
  | 'action'
  | 'condition'
  | 'transform'
  | 'integration';

// Trigger node types
export type TriggerType =
  | 'manual'
  | 'pdf_upload'
  | 'webhook'
  | 'schedule'
  | 'github'
  | 'slack'
  | 'discord';

// Action node types
export type ActionType =
  | 'ai_summary'
  | 'save_database'
  | 'send_email'
  | 'slack_message'
  | 'github_action'
  | 'notion_update'
  | 'discord_message';

// Trigger node configuration
export interface TriggerNode extends WorkflowNode {
  type: 'trigger';
  data: {
    triggerType: TriggerType;
    config?: Record<string, unknown>;
  };
}

// Action node configuration
export interface ActionNode extends WorkflowNode {
  type: 'action';
  data: {
    actionType: ActionType;
    config?: Record<string, unknown>;
    inputs?: string[]; // References to previous node outputs
  };
}

// Condition node configuration
export interface ConditionNode extends WorkflowNode {
  type: 'condition';
  data: {
    condition: string;
    expression?: string; // JS expression or condition logic
  };
}

// Integration node configuration (future ready)
export interface IntegrationNode extends WorkflowNode {
  type: 'integration';
  data: {
    provider: string; // 'github', 'slack', 'notion', etc.
    method: string; // API method
    config?: Record<string, unknown>;
  };
}
