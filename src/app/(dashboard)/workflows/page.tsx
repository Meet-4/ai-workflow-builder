
import { connectToDatabase } from "@/lib/db";
import Workflow from "@/models/Workflow";
import WorkflowsList from "@/components/WorkflowsList";

export const revalidate = 0; // Fresh database fetches always

export default async function WorkflowsPage() {
  let workflows: { _id: string; title: string; description: string; createdAt: string }[] = [];

  try {
    await connectToDatabase();

    const rawWorkflows = await Workflow.find({ userId: "mock-user-123" })
      .sort({ createdAt: -1 })
      .lean();

    // Serialize MongoDB ObjectIds and Dates for Client Component consumption
    workflows = rawWorkflows.map((flow) => ({
      _id: flow._id.toString(),
      title: flow.title,
      description: flow.description || "",
      createdAt: flow.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Workflows: Failed to connect to database:", error);
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Workflows</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Manage, search, and edit your custom automated AI pipeline workflows.
        </p>
      </div>

      <WorkflowsList initialWorkflows={workflows} />
    </div>
  );
}
