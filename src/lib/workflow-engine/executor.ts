/**
 * Workflow Execution Engine
 * Handles sequential node execution, error handling, and logging
 */

import {
  Workflow,
  WorkflowNode,
  ExecutionResult,
  NodeExecutionResult,
  ExecutionLog,
  ExecutionError,
  ActionNode,
  TriggerNode,
  ConditionNode,
} from '@/types/workflow';
import { nodeExecutors } from './executors';
import { generateId } from '@/lib/utils';

export class WorkflowExecutor {
  private executionId: string;
  private workflow: Workflow;
  private logs: ExecutionLog[] = [];
  private nodeResults: Map<string, NodeExecutionResult> = new Map();
  private startTime: Date;
  private endTime?: Date;

  constructor(workflow: Workflow) {
    this.workflow = workflow;
    this.executionId = generateId();
    this.startTime = new Date();
  }

  /**
   * Execute the entire workflow sequentially
   */
  async execute(input?: Record<string, unknown>): Promise<ExecutionResult> {
    this.log('info', `Starting workflow execution: ${this.workflow.id}`);

    try {
      const nodeMap = this.buildNodeMap();
      const executionOrder = this.topologicalSort(nodeMap);

      for (const nodeId of executionOrder) {
        const node = nodeMap.get(nodeId);
        if (!node) continue;

        const nodeResult = await this.executeNode(node, input);
        this.nodeResults.set(nodeId, nodeResult);

        if (nodeResult.status === 'failed') {
          this.log('error', `Node execution failed: ${nodeId}`, { nodeId });
          // Continue or stop based on error handling policy
          break;
        }
      }

      this.endTime = new Date();
      this.log('info', 'Workflow execution completed successfully');

      return this.buildExecutionResult('success');
    } catch (error) {
      this.endTime = new Date();
      const executionError = this.parseError(error);
      this.log('error', `Workflow execution failed: ${executionError.message}`);

      return this.buildExecutionResult('failed', executionError);
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: WorkflowNode,
    parentInput?: Record<string, unknown>
  ): Promise<NodeExecutionResult> {
    const nodeStartTime = new Date();

    try {
      this.log('info', `Executing node: ${node.id} (${node.type})`, { nodeId: node.id });

      // Get the executor for this node type
      const executor = nodeExecutors[node.type];
      if (!executor) {
        throw new Error(`No executor found for node type: ${node.type}`);
      }

      // Prepare node context with previous outputs
      const context = this.buildNodeContext(node, parentInput);

      // Execute the node
      const output = await executor.execute(node, context);

      const nodeEndTime = new Date();
      const duration = nodeEndTime.getTime() - nodeStartTime.getTime();

      this.log('info', `Node executed successfully: ${node.id}`, {
        nodeId: node.id,
        duration,
      });

      return {
        nodeId: node.id,
        nodeType: node.type as any,
        status: 'success',
        output,
        duration,
        startTime: nodeStartTime,
        endTime: nodeEndTime,
      };
    } catch (error) {
      const nodeEndTime = new Date();
      const duration = nodeEndTime.getTime() - nodeStartTime.getTime();
      const executionError = this.parseError(error);

      return {
        nodeId: node.id,
        nodeType: node.type as any,
        status: 'failed',
        error: executionError,
        duration,
        startTime: nodeStartTime,
        endTime: nodeEndTime,
      };
    }
  }

  /**
   * Build node execution context with previous outputs
   */
  private buildNodeContext(
    node: WorkflowNode,
    parentInput?: Record<string, unknown>
  ): Record<string, unknown> {
    const context: Record<string, unknown> = {
      nodeId: node.id,
      nodeType: node.type,
      data: node.data,
      input: parentInput || {},
    };

    // Add outputs from previous nodes
    const actionNode = node as ActionNode;
    if (actionNode.data?.inputs) {
      const previousOutputs: Record<string, unknown> = {};
      for (const inputRef of actionNode.data.inputs) {
        const [refNodeId, refOutput] = inputRef.split('.');
        const nodeResult = this.nodeResults.get(refNodeId);
        if (nodeResult?.output) {
          previousOutputs[inputRef] = nodeResult.output;
        }
      }
      context.previousOutputs = previousOutputs;
    }

    return context;
  }

  /**
   * Build a map of nodes by ID
   */
  private buildNodeMap(): Map<string, WorkflowNode> {
    const nodeMap = new Map<string, WorkflowNode>();
    for (const node of this.workflow.nodes) {
      nodeMap.set(node.id, node);
    }
    return nodeMap;
  }

  /**
   * Topological sort to determine execution order
   */
  private topologicalSort(nodeMap: Map<string, WorkflowNode>): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Find all edges pointing to this node
      const incomingEdges = this.workflow.edges.filter(
        (edge) => edge.target === nodeId
      );

      // Visit source nodes first
      for (const edge of incomingEdges) {
        visit(edge.source);
      }

      order.push(nodeId);
    };

    for (const nodeId of nodeMap.keys()) {
      visit(nodeId);
    }

    return order;
  }

  /**
   * Add log entry
   */
  private log(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    context?: Record<string, unknown>
  ): void {
    const logEntry: ExecutionLog = {
      timestamp: new Date(),
      level,
      message,
      context,
    };
    this.logs.push(logEntry);
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }

  /**
   * Parse error into ExecutionError
   */
  private parseError(error: unknown): ExecutionError {
    if (error instanceof Error) {
      return {
        code: 'EXECUTION_ERROR',
        message: error.message,
        stack: error.stack,
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
    };
  }

  /**
   * Build final execution result
   */
  private buildExecutionResult(
    status: 'success' | 'failed',
    error?: ExecutionError
  ): ExecutionResult {
    return {
      workflowId: this.workflow.id,
      executionId: this.executionId,
      status,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.endTime
        ? this.endTime.getTime() - this.startTime.getTime()
        : undefined,
      nodeResults: this.nodeResults,
      logs: this.logs,
      error,
    };
  }
}

/**
 * Execute a workflow
 */
export async function executeWorkflow(
  workflow: Workflow,
  input?: Record<string, unknown>
): Promise<ExecutionResult> {
  const executor = new WorkflowExecutor(workflow);
  return executor.execute(input);
}
