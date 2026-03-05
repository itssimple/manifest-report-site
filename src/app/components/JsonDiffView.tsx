"use client";

import { useState } from "react";
import { DiffEntry } from "@/types/manifestListTypes";
import {
    buildDiffAnnotations,
    valueToPrettyJson,
} from "@/app/utils/jsonDiffUtils";
import ReactDiffViewer from "react-diff-viewer-continued";

type JsonDiffViewProps = {
    before: any | null;
    after: any | null;
    ops: DiffEntry[];
};

type LayoutMode = "inline" | "side_by_side";

export function JsonDiffView({ before, after, ops }: JsonDiffViewProps) {
    const [layout, setLayout] = useState<LayoutMode>("inline");

    const annotations = buildDiffAnnotations(ops);

    return (
        <section className="w-full flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between">
                <div className="text-sm text-gray-300">
                    Showing{" "}
                    <span className="font-mono">
                        {ops.length.toLocaleString()} change
                        {ops.length === 1 ? "" : "s"}
                    </span>
                </div>
                <div className="inline-flex rounded-md bg-slate-900 p-1 text-xs">
                    <button
                        type="button"
                        className={
                            "px-3 py-1 rounded-md transition-colors " +
                            (layout === "inline"
                                ? "bg-slate-700 text-white"
                                : "text-gray-300 hover:bg-slate-800")
                        }
                        onClick={() => setLayout("inline")}
                    >
                        Inline
                    </button>
                    <button
                        type="button"
                        className={
                            "px-3 py-1 rounded-md transition-colors " +
                            (layout === "side_by_side"
                                ? "bg-slate-700 text-white"
                                : "text-gray-300 hover:bg-slate-800")
                        }
                        onClick={() => setLayout("side_by_side")}
                    >
                        Side‑by‑side
                    </button>
                </div>
            </div>

            {
                <div className="rounded-md bg-slate-950/90 border border-slate-800 overflow-hidden text-xs">
                    <ReactDiffViewer
                        oldValue={valueToPrettyJson(before)}
                        newValue={valueToPrettyJson(after)}
                        splitView={layout === "side_by_side" ? true : false}
                        showDiffOnly={false}
                        useDarkTheme={true}
                        hideLineNumbers={false}
                        styles={{
                            variables: {
                                dark: {
                                    diffViewerBackground: "transparent",
                                    diffViewerColor: "#e5e7eb",
                                    addedBackground: "rgba(5, 150, 105, 0.15)",
                                    addedColor: "#6ee7b7",
                                    removedBackground:
                                        "rgba(239, 68, 68, 0.15)",
                                    removedColor: "#fecaca",
                                    wordAddedBackground:
                                        "rgba(16, 185, 129, 0.3)",
                                    wordRemovedBackground:
                                        "rgba(248, 113, 113, 0.3)",
                                    addedGutterBackground:
                                        "rgba(5, 150, 105, 0.25)",
                                    removedGutterBackground:
                                        "rgba(239, 68, 68, 0.25)",
                                },
                            },
                            gutter: {
                                padding: "0 0.5rem",
                            },
                            line: {
                                padding: "0 0.5rem",
                            },
                        }}
                    />
                </div>
            }

            <div className="flex flex-col gap-3">
                {annotations.map((annotation, index) => (
                    <DiffEntryCard
                        key={`${annotation.path}-${index}`}
                        annotation={annotation}
                    />
                ))}
            </div>
        </section>
    );
}

type DiffEntryCardProps = {
    annotation: ReturnType<typeof buildDiffAnnotations>[number];
};

function DiffEntryCard({ annotation }: DiffEntryCardProps) {
    const { path, type, oldValue, newValue } = annotation;

    const badgeClass =
        type === "add"
            ? "bg-emerald-900/60 text-emerald-300 border-emerald-700"
            : type === "del"
              ? "bg-red-900/60 text-red-300 border-red-700"
              : "bg-sky-900/60 text-sky-300 border-sky-700";

    const label =
        type === "add" ? "Added" : type === "del" ? "Removed" : "Changed";

    const oldStr =
        type === "add" ? "" : valueToPrettyJson(oldValue as unknown as any);
    const newStr =
        type === "del" ? "" : valueToPrettyJson(newValue as unknown as any);

    return (
        <article className="w-full rounded-lg bg-slate-950/80 border border-slate-800 p-3">
            <header className="flex flex-row items-center justify-between mb-2 gap-2">
                <div className="font-mono text-xs text-gray-300 break-all">
                    {path || "/"}
                </div>
                <span
                    className={
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide " +
                        badgeClass
                    }
                >
                    {label}
                </span>
            </header>

            <div className="rounded-md bg-slate-950/90 border border-slate-800 overflow-hidden text-xs">
                <ReactDiffViewer
                    oldValue={oldStr}
                    newValue={newStr}
                    splitView={false}
                    showDiffOnly={false}
                    useDarkTheme={true}
                    hideLineNumbers={false}
                    styles={{
                        variables: {
                            dark: {
                                diffViewerBackground: "transparent",
                                diffViewerColor: "#e5e7eb",
                                addedBackground: "rgba(5, 150, 105, 0.15)",
                                addedColor: "#6ee7b7",
                                removedBackground: "rgba(239, 68, 68, 0.15)",
                                removedColor: "#fecaca",
                                wordAddedBackground: "rgba(16, 185, 129, 0.3)",
                                wordRemovedBackground:
                                    "rgba(248, 113, 113, 0.3)",
                                addedGutterBackground:
                                    "rgba(5, 150, 105, 0.25)",
                                removedGutterBackground:
                                    "rgba(239, 68, 68, 0.25)",
                            },
                        },
                        gutter: {
                            padding: "0 0.5rem",
                        },
                        line: {
                            padding: "0 0.5rem",
                        },
                    }}
                />
            </div>
        </article>
    );
}
