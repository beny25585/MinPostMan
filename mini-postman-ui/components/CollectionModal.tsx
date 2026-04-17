"use client";

import { useState } from "react";
import { X, FolderPlus } from "lucide-react";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}

export function CollectionModal({ isOpen, onClose, onSave }: CollectionModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), description.trim());
      setName("");
      setDescription("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-elevated w-full max-w-md mx-4 animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold">Create Collection</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Collection Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., User API"
              className="w-full h-10 px-3 rounded-md bg-muted border border-border text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description <span className="text-zinc-500">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this collection..."
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
