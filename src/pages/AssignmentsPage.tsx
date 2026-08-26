import React, { useState } from "react";
import { Plus, FolderOpen, FileCheck, UploadCloud, ArrowRight, X, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  submissionsCount: number;
}

export const AssignmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() => {
    try {
      const saved = localStorage.getItem("veda_assignments_list");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load assignments from storage", e);
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");

  const saveAssignmentsToStorage = (updatedAssignments: AssignmentItem[]) => {
    setAssignments(updatedAssignments);
    try {
      localStorage.setItem("veda_assignments_list", JSON.stringify(updatedAssignments));
    } catch (e) {
      console.warn("Failed to save assignments to storage", e);
    }
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAssignment: AssignmentItem = {
      id: `assign_${Date.now()}`,
      title: title.trim(),
      subject: subject.trim() || "General Evaluation",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      submissionsCount: 1,
    };

    const updated = [newAssignment, ...assignments];
    saveAssignmentsToStorage(updated);
    setTitle("");
    setSubject("");
    setIsModalOpen(false);
  };

  const handleDeleteAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    saveAssignmentsToStorage(updated);
  };

  return (
    <div className="flex-1 bg-zinc-50/60 dark:bg-zinc-950 p-4 sm:p-8 font-sans transition-colors duration-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Assignments & Classrooms
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Track student handwritten submissions and mapping evaluations
          </p>
        </div>
        <Button size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </Button>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 flex items-center justify-center text-orange-500">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No assignments active
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Create an assignment to evaluate student answer sheets with AI mapping.
            </p>
          </div>
          <Button size="md" onClick={() => setIsModalOpen(true)} className="mt-2">
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-orange-500/40 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Subject: {item.subject} • Due: {item.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteAssignment(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-rose-500 transition-opacity"
                  title="Delete Assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Button size="sm" onClick={() => navigate("/exams/upload")}>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Evaluate Submission</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Create New Assignment
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Evaluation Assessment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics / Section B"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="md">
                  Create Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
