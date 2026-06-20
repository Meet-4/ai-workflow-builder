import mongoose, { Schema, Document, Model } from 'mongoose';
import { ExecutionResult } from '@/types/workflow';

export interface IExecution extends Document {
  workflowId: string;
  executionId: string;
  userId: string;
  status: 'success' | 'failed' | 'pending' | 'running';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  result: ExecutionResult;
  createdAt: Date;
  updatedAt: Date;
}

const ExecutionSchema = new Schema<IExecution>({
  workflowId: { type: String, required: true, index: true },
  executionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending', 'running'],
    default: 'pending',
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  result: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

const Execution: Model<IExecution> =
  mongoose.models.Execution ||
  mongoose.model<IExecution>('Execution', ExecutionSchema);

export default Execution;
