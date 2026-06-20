/**
 * Node Executors Registry
 * Maps node types to their execution handlers
 */

import { NodeType, WorkflowNode } from '@/types/workflow';
import { triggerExecutor } from './trigger-executor';
import { actionExecutor } from './action-executor';
import { conditionExecutor } from './condition-executor';

export interface NodeExecutor {
  execute(
    node: WorkflowNode,
    context: Record<string, unknown>
  ): Promise<unknown>;
}

export const nodeExecutors: Record<NodeType, NodeExecutor> = {
  trigger: triggerExecutor,
  action: actionExecutor,
  condition: conditionExecutor,
  transform: actionExecutor, // Use action executor for transforms
  integration: actionExecutor, // Use action executor for integrations
};
