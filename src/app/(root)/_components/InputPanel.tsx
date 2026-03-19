"use client";

import { useCodeEditorStore } from "@/src/store/useCodeEditorStore";
import { Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function InputPanel() {
    const { stdin, setStdin } = useCodeEditorStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="bg-[#181825] rounded-xl ring-1 ring-gray-800/50 overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setIsCollapsed((v) => !v)}
            >
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1e1e2e] ring-1 ring-gray-800/50">
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-300">
                        Input&nbsp;
                        <span className="text-xs text-gray-500 font-normal">(stdin)</span>
                    </span>
                    {stdin && !isCollapsed && (
                        <span className="text-xs text-amber-400/70 ml-1">
                            {stdin.split("\n").length} line{stdin.split("\n").length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {stdin && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setStdin("");
                            }}
                            className="text-xs text-gray-500 hover:text-gray-300 px-2 py-0.5 rounded-md
                         hover:bg-white/5 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                    {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                    )}
                </div>
            </div>

            {/* Textarea */}
            {!isCollapsed && (
                <div className="px-4 pb-3">
                    <textarea
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                        placeholder="Enter program input here (one value per line)..."
                        rows={4}
                        spellCheck={false}
                        className="w-full bg-[#1e1e2e]/50 backdrop-blur-sm border border-[#313244]
                       rounded-xl p-3 font-mono text-sm text-gray-300 placeholder-gray-600
                       resize-none focus:outline-none focus:ring-1 focus:ring-amber-400/30
                       focus:border-amber-400/30 transition-all"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                        Tip: Type values separated by newlines — e.g. for{" "}
                        <code className="text-gray-500">Scanner</code>,{" "}
                        <code className="text-gray-500">input()</code>, or{" "}
                        <code className="text-gray-500">cin</code>
                    </p>
                </div>
            )}
        </div>
    );
}

export default InputPanel;
