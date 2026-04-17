"use client";

import { Textarea } from "@/components/ui/textarea";

interface RequestBodyEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RequestBodyEditor({ value, onChange }: RequestBodyEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="text-sm font-medium text-foreground">Request Body</span>
          <span className="text-[11px] text-zinc-500 font-mono">JSON</span>
        </div>
        {value && (
          <button
            onClick={() => {
              try {
                const formatted = JSON.stringify(JSON.parse(value), null, 2);
                onChange(formatted);
              } catch {
                // not valid JSON, ignore
              }
            }}
            className="copy-btn text-[11px]"
          >
            Beautify
          </button>
        )}
      </div>
      <Textarea
        placeholder={`{\n  "key": "value"\n}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-sm min-h-[200px] resize-y bg-muted/50 border-border hover:border-zinc-600 focus:border-indigo-500/50 focus-visible:ring-indigo-500/20 transition-colors placeholder:text-zinc-600 leading-relaxed"
      />
    </div>
  );
}