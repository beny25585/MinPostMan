"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface Header {
  key: string;
  value: string;
}

interface HeadersEditorProps {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

export function HeadersEditor({ headers, onChange }: HeadersEditorProps) {
  const addHeader = () => {
    onChange([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    onChange(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    onChange(newHeaders);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="text-sm font-medium text-foreground">Headers</span>
          {headers.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-semibold">
              {headers.length}
            </span>
          )}
        </div>
        <button
          onClick={addHeader}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Header
        </button>
      </div>

      <div className="space-y-2">
        {headers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-lg bg-muted/20">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No headers added yet
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Click &quot;Add Header&quot; to add request headers
            </p>
          </div>
        )}
        {headers.map((header, index) => (
          <div
            key={index}
            className="flex gap-2 items-center group animate-fade-in"
          >
            <Input
              placeholder="Header name"
              value={header.key}
              onChange={(e) => updateHeader(index, "key", e.target.value)}
              className="flex-1 h-9 bg-muted/50 border-border hover:border-zinc-600 focus:border-indigo-500/50 focus-visible:ring-indigo-500/20 transition-colors font-mono text-xs placeholder:text-zinc-600"
            />
            <Input
              placeholder="Value"
              value={header.value}
              onChange={(e) => updateHeader(index, "value", e.target.value)}
              className="flex-1 h-9 bg-muted/50 border-border hover:border-zinc-600 focus:border-indigo-500/50 focus-visible:ring-indigo-500/20 transition-colors font-mono text-xs placeholder:text-zinc-600"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeHeader(index)}
              className="h-9 w-9 shrink-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}