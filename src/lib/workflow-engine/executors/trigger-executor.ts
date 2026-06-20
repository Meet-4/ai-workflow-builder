/**
 * Trigger Node Executor
 * Handles execution of trigger nodes (manual, webhook, schedule, etc.)
 */

import { TriggerNode, TriggerType } from '@/types/workflow';
import { NodeExecutor } from './index';

class TriggerExecutor implements NodeExecutor {
  async execute(
    node: TriggerNode,
    context: Record<string, unknown>
  ): Promise<unknown> {
    const triggerType = (node.data?.triggerType as TriggerType) || 'manual';

    switch (triggerType) {
      case 'manual':
        return this.executeManualTrigger(node, context);
      case 'pdf_upload':
        return this.executePdfUploadTrigger(node, context);
      case 'webhook':
        return this.executeWebhookTrigger(node, context);
      case 'schedule':
        return this.executeScheduleTrigger(node, context);
      default:
        throw new Error(`Unknown trigger type: ${triggerType}`);
    }
  }

  private executeManualTrigger(
    node: TriggerNode,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    console.log('[TRIGGER] Manual trigger initiated');
    return Promise.resolve({
      triggeredAt: new Date().toISOString(),
      type: 'manual',
      ...context.input,
    });
  }

  private executePdfUploadTrigger(
    node: TriggerNode,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    console.log('[TRIGGER] PDF upload trigger');
    const config = node.data?.config as Record<string, unknown> || {};
    return Promise.resolve({
      type: 'pdf_upload',
      filePath: config.filePath,
      fileName: config.fileName,
      fileSize: config.fileSize,
      uploadedAt: new Date().toISOString(),
    });
  }

  private executeWebhookTrigger(
    node: TriggerNode,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    console.log('[TRIGGER] Webhook trigger');
    const config = node.data?.config as Record<string, unknown> || {};
    return Promise.resolve({
      type: 'webhook',
      endpoint: config.endpoint,
      method: config.method || 'POST',
      payload: context.input,
      receivedAt: new Date().toISOString(),
    });
  }

  private executeScheduleTrigger(
    node: TriggerNode,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    console.log('[TRIGGER] Schedule trigger');
    const config = node.data?.config as Record<string, unknown> || {};
    return Promise.resolve({
      type: 'schedule',
      schedule: config.schedule,
      timezone: config.timezone || 'UTC',
      firedAt: new Date().toISOString(),
    });
  }
}

export const triggerExecutor = new TriggerExecutor();
