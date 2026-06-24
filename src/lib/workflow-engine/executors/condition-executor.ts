/**
 * Condition Node Executor
 * Handles execution of conditional logic nodes
 */

import { ConditionNode } from '@/types/workflow';
import { NodeExecutor } from './index';

class ConditionExecutor implements NodeExecutor {
  async execute(
    node: ConditionNode,
    context: Record<string, unknown>
  ): Promise<unknown> {
    console.log('[CONDITION] Evaluating condition');
    const conditionExpression = node.data?.expression as string;

    if (!conditionExpression) {
      throw new Error('Condition expression is required');
    }

    try {
      const result = this.evaluateCondition(conditionExpression, context);
      return {
        type: 'condition',
        expression: conditionExpression,
        result,
        evaluatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to evaluate condition: ${String(error)}`);
    }
  }

  /**
   * Safely evaluate a condition expression
   * This uses a simple evaluator - for production, consider using a library like expr-eval
   */
  private evaluateCondition(
    expression: string,
    context: Record<string, unknown>
  ): boolean {
    // Build a safe scope for evaluation
    const scope: Record<string, unknown> = {
      ...context,
      previousOutputs: context.previousOutputs || {},
    };

    // Simple evaluator - replace variable references with actual values
    let evaluatedExpression = expression;

    for (const [key, value] of Object.entries(scope)) {
      const pattern = new RegExp(`\\b${key}\\b`, 'g');
      evaluatedExpression = evaluatedExpression.replace(
        pattern,
        JSON.stringify(value)
      );
    }

    // Evaluate the expression (consider security implications)
    try {
      // eslint-disable-next-line no-eval
      return Boolean(eval(evaluatedExpression));
    } catch (error) {
      throw new Error(`Invalid condition expression: ${evaluatedExpression}`);
    }
  }
}

export const conditionExecutor = new ConditionExecutor();
