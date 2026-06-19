import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWorkflow extends Document {
  userId: string; // Clerk user ID
  title: string;
  description: string;
  workflowJson: Record<string, unknown>; // Stores React Flow nodes, edges, etc.
  createdAt: Date;
}

const WorkflowSchema = new Schema<IWorkflow>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  workflowJson: { type: Schema.Types.Mixed, default: { nodes: [], edges: [] } },
  createdAt: { type: Date, default: Date.now },
});

const Workflow: Model<IWorkflow> = mongoose.models.Workflow || mongoose.model<IWorkflow>("Workflow", WorkflowSchema);

export default Workflow;
