"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestBodyEditor } from "@/components/RequestBodyEditor";
import { HeadersEditor } from "@/components/HeadersEditor";
import { CollectionModal } from "@/components/CollectionModal";
import { SaveRequestModal } from "@/components/SaveRequestModal";
import { Send, Clock, Copy, Check, ChevronDown, ChevronRight, Zap, Folder, Plus, Bookmark } from "lucide-react";

interface HistoryItem {
  id: number;
  url: string;
  method: string;
  status: number;
  created_at: string;
}

interface Header {
  key: string;
  value: string;
}

interface Collection {
  id: number;
  name: string;
  description?: string;
  request_count: number;
}

interface SavedRequest {
  id: number;
  collection_id: number;
  name: string;
  url: string;
  method: string;
  headers: Record<string, string> | null;
  body: unknown;
}

function buildHeadersObject(headers: Header[]): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((h) => {
    if (h.key.trim()) {
      result[h.key.trim()] = h.value;
    }
  });
  return result;
}

function parseRequestBody(body: string): unknown {
  if (!body.trim()) return null;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: "method-badge-get",
    POST: "method-badge-post",
    PUT: "method-badge-put",
    DELETE: "method-badge-delete",
    PATCH: "method-badge-patch",
    HEAD: "method-badge-head",
    OPTIONS: "method-badge-options",
  };
  return colors[method] || "method-badge-get";
}

function getStatusBadgeClass(status: number): string {
  if (status >= 200 && status < 300) return "status-badge-success";
  if (status >= 300 && status < 400) return "status-badge-info";
  if (status >= 400 && status < 500) return "status-badge-warning";
  if (status >= 500) return "status-badge-error";
  return "status-badge-info";
}

function syntaxHighlightJSON(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "json-number";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "json-key" : "json-string";
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function CollapsibleJSON({ data, path = "" }: { data: unknown; path?: string }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isObject = data !== null && typeof data === "object";
  const isArray = Array.isArray(data);

  if (!isObject) {
    const formatted = typeof data === "string" ? `"${data}"` : String(data);
    const highlighted = syntaxHighlightJSON(formatted);
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  }

  const entries = isArray
    ? (data as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(data as Record<string, unknown>);

  const isEmpty = entries.length === 0;
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";
  const isCollapsed = collapsed[path] ?? false;

  if (isEmpty) {
    return <span className="json-bracket">{openBracket}{closeBracket}</span>;
  }

  if (isCollapsed) {
    const preview = isArray
      ? `[${entries.length} items]`
      : `{${entries.length} keys}`;
    return (
      <span>
        <span
          className="cursor-pointer hover:text-white transition-colors inline-flex items-center gap-1"
          onClick={() => setCollapsed((prev) => ({ ...prev, [path]: false }))}
        >
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          <span className="json-bracket">{openBracket}</span>
        </span>
        <span className="text-zinc-500 text-xs ml-1">{preview}</span>
        <span className="json-bracket">{closeBracket}</span>
      </span>
    );
  }

  return (
    <span>
      <span
        className="cursor-pointer hover:text-white transition-colors inline-flex items-center gap-1"
        onClick={() => setCollapsed((prev) => ({ ...prev, [path]: true }))}
      >
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        <span className="json-bracket">{openBracket}</span>
      </span>
      <br />
      {entries.map(([key, value], index) => {
        const childPath = path ? `${path}.${key}` : key;
        const isLast = index === entries.length - 1;
        const keyHtml = isArray
          ? ""
          : `<span class="json-key">"${key}"</span><span class="json-colon">: </span>`;

        return (
          <span key={key}>
            {"  "}
            <span dangerouslySetInnerHTML={{ __html: keyHtml }} />
            <CollapsibleJSON data={value} path={childPath} />
            {!isLast && <span className="json-colon">,</span>}
            <br />
          </span>
        );
      })}
      <span className="json-bracket">{closeBracket}</span>
    </span>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [response, setResponse] = useState<unknown>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestBody, setRequestBody] = useState("");
  const [headers, setHeaders] = useState<Header[]>([]);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string> | null>(null);
  const [responseTab, setResponseTab] = useState("body");
  const [copied, setCopied] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);
  
  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<number | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isSaveRequestModalOpen, setIsSaveRequestModalOpen] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Set<number>>(new Set());

  const sendRequest = async () => {
    setLoading(true);
    const startTime = Date.now();

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/send/", {
        url,
        method,
        headers: buildHeadersObject(headers),
        body: parseRequestBody(requestBody),
      });

      setResponseTime(Date.now() - startTime);
      setResponse(res.data);
      setResponseHeaders(res.data.headers || null);
      fetchHistory();
    } catch (err: unknown) {
      setResponseTime(Date.now() - startTime);
      const error = err as { message: string; response?: { status: number } };
      setResponse({
        error: error.message,
        status: error.response?.status || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/history/");
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/collections/");
      setCollections(res.data);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    }
  };

  const fetchSavedRequests = async (collectionId: number) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/saved-requests/?collection_id=${collectionId}`);
      setSavedRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch saved requests:", err);
    }
  };

  const handleCreateCollection = async (name: string, description: string) => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/collections/", {
        name,
        description,
      });
      setCollections([...collections, res.data]);
    } catch (err) {
      console.error("Failed to create collection:", err);
    }
  };

  const handleSaveRequest = async (collectionId: number, name: string) => {
    try {
      await axios.post("http://127.0.0.1:8000/api/saved-requests/", {
        collection_id: collectionId,
        name,
        url,
        method,
        headers: buildHeadersObject(headers),
        body: parseRequestBody(requestBody),
      });
      fetchCollections();
      if (expandedCollections.has(collectionId)) {
        fetchSavedRequests(collectionId);
      }
    } catch (err) {
      console.error("Failed to save request:", err);
    }
  };

  const handleHistoryClick = useCallback((item: HistoryItem) => {
    setUrl(item.url);
    setMethod(item.method);
    setActiveHistoryId(item.id);
    setActiveCollectionId(null);
  }, []);

  const handleSavedRequestClick = (request: SavedRequest) => {
    setUrl(request.url);
    setMethod(request.method);
    if (request.headers) {
      const headerArray = Object.entries(request.headers).map(([key, value]) => ({
        key,
        value,
      }));
      setHeaders(headerArray);
    }
    if (request.body) {
      setRequestBody(typeof request.body === "string" ? request.body : JSON.stringify(request.body, null, 2));
    }
    setActiveCollectionId(request.collection_id);
    setActiveHistoryId(null);
  };

  const toggleCollection = (collectionId: number) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
      fetchSavedRequests(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const handleCopy = useCallback(async () => {
    if (!response) return;
    const text = JSON.stringify(response, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [response]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!loading && url.trim()) sendRequest();
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchCollections();
  }, []);

  const responseStatus = response ? (response as { status?: number }).status : undefined;
  const hasError = response !== null && typeof response === "object" && "error" in (response as Record<string, unknown>);

  return (
    <div className="flex h-screen bg-background noise-overlay" onKeyDown={handleKeyDown}>
      {/* ── Sidebar ── */}
      <aside className="w-80 border-r border-sidebar-border bg-sidebar-bg flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              Mini Postman
            </h1>
          </div>
        </div>

        {/* Collections Section */}
        <div className="px-4 py-3 border-b border-sidebar-border flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Collections
          </p>
          <button
            onClick={() => setIsCollectionModalOpen(true)}
            className="p-1 rounded hover:bg-sidebar-hover transition-colors"
            title="Create Collection"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
                <Folder className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                No collections yet.
                <br />
                <span className="text-zinc-500">Create one to organize requests.</span>
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {collections.map((collection) => (
                <div key={collection.id}>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-sidebar-hover transition-colors"
                    onClick={() => toggleCollection(collection.id)}
                  >
                    {expandedCollections.has(collection.id) ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <Folder className="w-4 h-4 text-indigo-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {collection.name}
                      </div>
                      {collection.description && (
                        <div className="text-xs text-zinc-500 truncate">
                          {collection.description}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                      {collection.request_count}
                    </span>
                  </div>
                  
                  {expandedCollections.has(collection.id) && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {savedRequests
                        .filter((r) => r.collection_id === collection.id)
                        .map((request) => (
                          <div
                            key={request.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                              activeCollectionId === collection.id && url === request.url
                                ? "bg-sidebar-active"
                                : "hover:bg-sidebar-hover"
                            }`}
                            onClick={() => handleSavedRequestClick(request)}
                          >
                            <span className={`method-badge ${getMethodColor(request.method)} text-[10px]`}>
                              {request.method}
                            </span>
                            <span className="text-xs text-zinc-400 truncate flex-1">
                              {request.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="px-4 py-3 border-t border-b border-sidebar-border">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            History
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-2">
                <Send className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                No requests yet.
                <br />
                <span className="text-zinc-500">Send a request to see it here.</span>
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`history-item ${activeHistoryId === item.id ? "history-item-active" : ""}`}
                  onClick={() => handleHistoryClick(item)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`method-badge ${getMethodColor(item.method)}`}>
                      {item.method}
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 truncate font-mono leading-relaxed">
                    {item.url}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ── URL Bar ── */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex gap-2.5 items-center">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-[120px] shrink-0 bg-card border-border hover:border-zinc-600 transition-colors font-mono text-sm font-semibold h-10">
                <span className={`${getMethodColor(method)} method-badge`}>
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].map((m) => (
                  <SelectItem key={m} value={m} className="font-mono text-sm">
                    <span className={`${getMethodColor(m)} method-badge mr-2`}>{m}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Input
                placeholder="Enter request URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-10 bg-card border-border hover:border-zinc-600 focus:border-indigo-500/50 transition-colors font-mono text-sm placeholder:text-zinc-600"
              />
            </div>

            <button
              onClick={sendRequest}
              disabled={loading || !url.trim()}
              className="btn-gradient h-10 px-6 rounded-lg text-sm font-semibold text-white flex items-center gap-2 shrink-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsSaveRequestModalOpen(true)}
              disabled={!url.trim()}
              className="h-10 px-4 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-600 mt-2 ml-[132px]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-zinc-400 font-mono text-[10px]">⌘↵</kbd> to send
          </p>
        </div>

        {/* ── Request Tabs ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="body" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4">
              <TabsList className="bg-transparent p-0 h-auto gap-0 border-b border-border w-full">
                <TabsTrigger
                  value="body"
                  className="tab-underline relative px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 transition-all"
                >
                  Body
                </TabsTrigger>
                <TabsTrigger
                  value="headers"
                  className="tab-underline relative px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 transition-all"
                >
                  Headers
                  {headers.length > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-semibold">
                      {headers.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="body" className="flex-1 overflow-auto px-6 pt-4 pb-6">
              <RequestBodyEditor value={requestBody} onChange={setRequestBody} />
            </TabsContent>

            <TabsContent value="headers" className="flex-1 overflow-auto px-6 pt-4 pb-6">
              <HeadersEditor headers={headers} onChange={setHeaders} />
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Response Panel ── */}
        {response !== null && (
          <div className="border-t border-border response-panel">
            <div className="px-6 py-3 flex items-center justify-between border-b border-border bg-card/50">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-foreground">Response</h3>
                {responseStatus !== undefined && (
                  <span className={`status-badge ${getStatusBadgeClass(responseStatus)}`}>
                    {responseStatus}
                  </span>
                )}
                {hasError && (
                  <span className="status-badge status-badge-error">Error</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {responseTime !== null && (
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                    <Clock className="w-3 h-3" />
                    {responseTime}ms
                  </span>
                )}
                <button onClick={handleCopy} className="copy-btn">
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="px-6 py-1">
              <div className="flex gap-0 border-b border-border">
                <button
                  onClick={() => setResponseTab("body")}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    responseTab === "body"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-zinc-300"
                  }`}
                >
                  Body
                  {responseTab === "body" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  )}
                </button>
                <button
                  onClick={() => setResponseTab("headers")}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    responseTab === "headers"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-zinc-300"
                  }`}
                >
                  Headers
                  {responseTab === "headers" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-auto max-h-72 px-6 py-4">
              {responseTab === "body" ? (
                <div className="bg-muted/50 rounded-lg border border-border p-4 overflow-auto">
                  <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    <CollapsibleJSON data={(response as { body?: unknown }).body || response} />
                  </pre>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg border border-border p-4 overflow-auto">
                  {responseHeaders ? (
                    <div className="space-y-2">
                      {Object.entries(responseHeaders).map(([key, value]) => (
                        <div key={key} className="flex gap-3 text-sm font-mono">
                          <span className="json-key min-w-[180px]">{key}</span>
                          <span className="json-string break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No response headers available
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <CollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onSave={handleCreateCollection}
      />
      
      <SaveRequestModal
        isOpen={isSaveRequestModalOpen}
        onClose={() => setIsSaveRequestModalOpen(false)}
        onSave={handleSaveRequest}
        collections={collections}
        defaultName={url ? new URL(url).pathname.split('/').pop() || url : ''}
      />
    </div>
  );
}
