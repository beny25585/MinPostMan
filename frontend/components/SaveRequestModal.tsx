"use client";

import { useState, useEffect } from "react";
import { X, Bookmark, FolderOpen, Plus } from "lucide-react";

interface Collection {
  id: number;
  name: string;
  description?: string;
}

interface SaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collectionId: number, name: string) => void;
  collections: Collection[];
  defaultName?: string;
  onCreateCollection?: () => void;
}

export function SaveRequestModal({
  isOpen,
  onClose,
  onSave,
  collections,
  defaultName = "",
  onCreateCollection,
}: SaveRequestModalProps) {
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      if (collections.length > 0 && !selectedCollection) {
        setSelectedCollection(collections[0].id);
      }
    }
  }, [isOpen, defaultName, collections, selectedCollection]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCollection && name.trim()) {
      onSave(selectedCollection, name.trim());
      setName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-elevated w-full max-w-md mx-4 animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold">Save Request</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {collections.length === 0 ? (
            <div className="text-center py-4">
              <FolderOpen className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No collections yet.
              </p>
              <p className="text-xs text-zinc-600 mt-1 mb-4">
                Create a collection to save your request.
              </p>
              <button
                type="button"
                onClick={() => {
                  onCreateCollection?.();
                  onClose();
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-400 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Collection
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Collection
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      type="button"
                      onClick={() => setSelectedCollection(collection.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                        selectedCollection === collection.id
                          ? "bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                          : "hover:bg-muted border border-transparent"
                      }`}
                    >
                      <div className="font-medium">{collection.name}</div>
                      {collection.description && (
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {collection.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Request Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Get User Profile"
                  className="w-full h-10 px-3 rounded-md bg-muted border border-border text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-colors"
                  autoFocus
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
                  disabled={!selectedCollection || !name.trim()}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Request
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
