
import Link from "next/link";
import { 
  Play, 
  Plus, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  Workflow as FlowIcon,
  Calendar,
  Network
} from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import Workflow, { IWorkflow } from "@/models/Workflow";
import Execution, { IExecution } from "@/models/Execution";
import DashboardCharts from "@/components/DashboardCharts";
import { Button } from "@/components/ui/button";
import { localStore } from "@/lib/local-store";

export const revalidate = 0;

export default async function DashboardPage() {
  const userId = "mock-user-123";

  let workflows: IWorkflow[] = [];
  let executions: IExecution[] = [];

  try {
    await connectToDatabase();

    workflows = await Workflow.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const workflowIds = workflows.map((w) => w._id);

    executions = workflowIds.length > 0
      ? await Execution.find({ workflowId: { $in: workflowIds } })
          .sort({ executedAt: -1 })
          .lean()
      : [];
  } catch {
    // Fall back to local store — silent, no console spam
    const localWfs = localStore.find("workflows", { userId });
    const localExecs = localStore.find("executions");

    // Cast local store data to match shape expected by the template below
    workflows = localWfs.map((w) => ({
      ...w,
      _id: w._id as unknown as IWorkflow["_id"],
      createdAt: new Date(w.createdAt),
      updatedAt: new Date(w.updatedAt),
    })) as unknown as IWorkflow[];

    const wfIds = new Set(localWfs.map((w) => w._id));
    executions = localExecs
      .filter((e: Record<string, unknown>) => wfIds.has(e.workflowId as string))
      .map((e) => ({
        ...e,
        executedAt: new Date((e.executedAt ?? e.createdAt) as string),
      })) as unknown as IExecution[];
  }

  const totalWorkflows = workflows.length;
  const totalExecutions = executions.length;

  const successExecutions = executions.filter((e) => e.status === "success").length;
  const successRate = totalExecutions > 0
    ? Math.round((successExecutions / totalExecutions) * 100)
    : 100;

  const chartData = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const dayExecutions = executions.filter((e) => {
      const execDate = new Date(e.executedAt);
      return execDate.toDateString() === d.toDateString();
    });

    const success = dayExecutions.filter((e) => e.status === "success").length;
    const failed = dayExecutions.filter((e) => e.status === "failed").length;

    if (totalExecutions === 0) {
      chartData.push({
        date: dateStr,
        success: Math.floor(Math.random() * 5) + 1,
        failed: Math.floor(Math.random() * 2),
      });
    } else {
      chartData.push({ date: dateStr, success, failed });
    }
  }

  const recentWorkflows = workflows.slice(0, 5);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Welcome back, Mock User
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Build and monitor your natural language AI automated workflows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/create">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-200">
              <Plus className="mr-2 h-4 w-4" /> Create Workflow
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md transition hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Total Workflows</span>
            <div className="rounded-lg bg-zinc-800/80 p-2 border border-zinc-700/50">
              <FlowIcon className="h-4 w-4 text-violet-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{totalWorkflows}</span>
            <p className="text-xs text-zinc-500 mt-1">Workflows configured</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md transition hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Total Executions</span>
            <div className="rounded-lg bg-zinc-800/80 p-2 border border-zinc-700/50">
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{totalExecutions}</span>
            <p className="text-xs text-zinc-500 mt-1">
              {totalExecutions > 0 ? "Real execution counts" : "Seeding active listeners"}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md transition hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Success Rate</span>
            <div className="rounded-lg bg-zinc-800/80 p-2 border border-zinc-700/50">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{successRate}%</span>
            <p className="text-xs text-zinc-500 mt-1">Average system stability</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md transition hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">System Status</span>
            <div className="rounded-lg bg-zinc-800/80 p-2 border border-zinc-700/50">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">Online</span>
            <p className="text-xs text-emerald-500 mt-1">All agent instances operational</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div>
        <DashboardCharts data={chartData} />
      </div>

      {/* Recent Workflows */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Workflows</h3>
            <p className="text-xs text-zinc-400">Your recently modified configurations</p>
          </div>
          {totalWorkflows > 0 && (
            <Link href="/workflows" className="flex items-center text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              View all workflows <ArrowRight size={14} className="ml-1" />
            </Link>
          )}
        </div>

        {totalWorkflows === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl p-12 text-center bg-zinc-950/40">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 mb-4 text-violet-400">
              <Network size={32} />
            </div>
            <h4 className="text-base font-semibold text-white">No workflows created yet</h4>
            <p className="text-xs text-zinc-500 max-w-sm mt-2">
              FlowMind AI lets you orchestrate integrations, custom agents, and webhooks using simple natural language instructions.
            </p>
            <Link href="/create" className="mt-6">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Design your first flow
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-medium text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Created</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {recentWorkflows.map((flow) => (
                  <tr key={flow._id.toString()} className="group hover:bg-zinc-900/10 transition-colors">
                    <td className="py-4 pr-4 font-medium text-white flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 group-hover:border-violet-500/30 group-hover:text-violet-400 transition-colors">
                        <FlowIcon size={16} />
                      </div>
                      <Link href={`/create?id=${flow._id}`} className="hover:underline">
                        {flow.title}
                      </Link>
                    </td>
                    <td className="py-4 pr-4 text-zinc-400 max-w-xs truncate">
                      {flow.description || <span className="italic text-zinc-650 text-xs">No description provided</span>}
                    </td>
                    <td className="py-4 pr-4 text-zinc-500 text-xs flex items-center gap-1.5 mt-2">
                      <Calendar size={12} />
                      {new Date(flow.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <Link href={`/create?id=${flow._id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                          <Play size={12} className="mr-1.5" /> Edit Builder
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
