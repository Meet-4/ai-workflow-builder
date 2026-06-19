import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExecution extends Document {
  workflowId: mongoose.Types.ObjectId;
  status: "success" | "failed" | "running";
  logs: string[];
  executedAt: Date;
}

const ExecutionSchema = new Schema<IExecution>({
  workflowId: { type: Schema.Types.ObjectId, ref: "Workflow", required: true, index: true },
  status: { type: String, enum: ["success", "failed", "running"], required: true },
  logs: { type: [String], default: [] },
  executedAt: { type: Date, default: Date.now },
});

const Execution: Model<IExecution> = mongoose.models.Execution || mongoose.model<IExecution>("Execution", ExecutionSchema);

export default Execution;
