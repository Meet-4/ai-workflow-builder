"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Trash2, 
  Edit, 
  Play, 
  Workflow as FlowIcon, 
  Calendar,
  AlertTriangle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WorkflowData {
  _id: string;
  title: string;
  description: string;
  createdAt: string | Date;
}

interface WorkflowsListProps {
  initialWorkflows: WorkflowData[];
}

export default function WorkflowsList({ initialWorkflows }: WorkflowsListProps) {
  const [workflows, setWorkflows] = useState<WorkflowData[]>(initialWorkflows);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null);
  
  // Form fields for editing
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
  // Loading indicators
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Filter workflows
  const filteredWorkflows = workflows.filter((flow) =>
    flow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flow.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trigger edit modal
  const openEditModal = (flow: WorkflowData) => {
    setSelectedWorkflow(flow);
    setEditTitle(flow.title);
    setEditDescription(flow.description);
    setIsEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!selectedWorkflow) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/workflows/${selectedWorkflow._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (res.ok) {
        await res.json();
        setWorkflows((prev) =>
          prev.map((w) => (w._id === selectedWorkflow._id ? { ...w, title: editTitle, description: editDescription } : w))
        );
        setIsEditDialogOpen(false);
      } else {
        alert("Failed to update workflow");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while updating workflow");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Trigger delete modal
  const openDeleteModal = (flow: WorkflowData) => {
    setSelectedWorkflow(flow);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedWorkflow) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/workflows/${selectedWorkflow._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWorkflows((prev) => prev.filter((w) => w._id !== selectedWorkflow._id));
        setIsDeleteDialogOpen(false);
      } else {
        alert("Failed to delete workflow");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while deleting workflow");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search workflows..."
            className="pl-10 bg-zinc-900/40 border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-white placeholder-zinc-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Link href="/create">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_15px_rgba(124,58,237,0.2)]">
            <Plus className="mr-2 h-4 w-4" /> Create Workflow
          </Button>
        </Link>
      </div>

      {/* Grid List */}
      {filteredWorkflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-16 text-center bg-zinc-900/10">
          <div className="rounded-full bg-zinc-900/80 p-4 mb-4 text-zinc-500 border border-zinc-800">
            <FlowIcon size={24} />
          </div>
          <h3 className="text-lg font-semibold text-white">No workflows found</h3>
          <p className="text-sm text-zinc-500 max-w-sm mt-1">
            {searchQuery 
              ? "We couldn't find any workflows matching your search query. Try another keyword."
              : "Start building automation rules by designing a canvas workflow."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map((flow) => (
            <div 
              key={flow._id} 
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-md transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_0_25px_rgba(124,58,237,0.05)] hover:bg-zinc-900/40"
            >
              {/* Top Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 group-hover:border-violet-500/40 group-hover:text-violet-400 transition-colors">
                    <FlowIcon size={20} />
                  </div>
                  <h3 className="font-semibold text-white tracking-tight text-base group-hover:text-violet-300 transition-colors">
                    {flow.title}
                  </h3>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 min-h-[40px]">
                  {flow.description || <span className="italic text-zinc-650 text-xs">No description provided</span>}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 pt-2">
                  <Calendar size={13} />
                  <span>Created {new Date(flow.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-zinc-850 mt-6 pt-4">
                <Link href={`/create?id=${flow._id}`}>
                  <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 hover:bg-violet-600/10">
                    <Play size={13} className="mr-1.5" /> Edit Canvas
                  </Button>
                </Link>
                
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
                    onClick={() => openEditModal(flow)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => openDeleteModal(flow)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Workflow Details</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update your workflow&apos;s display metadata.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Workflow name"
                className="bg-zinc-950 border-zinc-800 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Description</label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief summary of what this workflow accomplishes"
                className="bg-zinc-950 border-zinc-800 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-violet-600 hover:bg-violet-700 text-white" 
              onClick={handleSaveEdit}
              disabled={isActionLoading || !editTitle.trim()}
            >
              {isActionLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={20} /> Delete Workflow
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete <span className="font-semibold text-white">&quot;{selectedWorkflow?.title}&quot;</span>? This will permanently delete the workflow and its run histories. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
