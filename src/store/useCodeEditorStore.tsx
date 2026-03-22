import { CodeEditorState } from "./../types/index";
import { LANGUAGE_CONFIG } from "../app/(root)/_constants";
import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";

const getInitialState = () => {
  if (typeof window === "undefined") {
    return { language: "javascript", fontSize: 16, theme: "vs-dark" };
  }
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;
  return { language: savedLanguage, theme: savedTheme, fontSize: Number(savedFontSize) };
};

// Strip noisy sandbox lines like "Exited with error status 1"
const extractClean = (raw: string | null | undefined): string =>
  (raw || "")
    .split("\n")
    .filter((line) => !/^Exited with (error )?status \d+/.test(line.trim()))
    .join("\n")
    .trim();

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    stdin: "",
    editor: null,
    executionResult: null,

    getCode: () => get().editor?.getValue() || "",

    setStdin: (stdin: string) => set({ stdin }),

    setEditor: (editor: Monaco) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) editor.setValue(savedCode);
      set({ editor });
    },

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }
      localStorage.setItem("editor-language", language);
      set({ language, output: "", error: null, stdin: "" });
    },

    runCode: async () => {
      const { language, getCode, stdin } = get();
      const code = getCode();

      if (!code) {
        set({ error: "Please enter some code" });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      try {
        const judge0Id = LANGUAGE_CONFIG[language].judge0Id;
        const apiKey = process.env.NEXT_PUBLIC_JUDGE0_API_KEY;

        // Use base64_encoded=true — GCC error output contains non-UTF-8 chars
        // (ANSI escape codes) which cause Judge0 to return 400 with base64_encoded=false
        const response = await fetch(
          "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": apiKey || "",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
            body: JSON.stringify({
              language_id: judge0Id,
              source_code: btoa(unescape(encodeURIComponent(code))),
              stdin: stdin ? btoa(unescape(encodeURIComponent(stdin))) : "",
            }),
          }
        );

        // Helper: safely base64-decode a field from the response
        const b64decode = (s: string | null | undefined): string => {
          if (!s) return "";
          try {
            return decodeURIComponent(escape(atob(s)));
          } catch (_) {
            return s; // fallback: return as-is if not valid base64
          }
        };

        // Always parse the body — even on HTTP errors the body may have compile_output
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: Record<string, any> = {};
        try {
          data = await response.json();
        } catch (_) {
          // body is not JSON (network failure, etc.)
          const errMsg = `API error: ${response.status}`;
          set({ error: errMsg, executionResult: { code, output: "", error: errMsg } });
          return;
        }

        console.log("Judge0 response:", response.status, data);

        const statusId: number | undefined = data?.status?.id;
        const statusDesc: string = data?.status?.description ?? "";
        const compileOutput = extractClean(b64decode(data?.compile_output));
        const stderr = extractClean(b64decode(data?.stderr));
        const stdout = extractClean(b64decode(data?.stdout));

        // ── 1. Compile Error (status 6 OR compile_output present with no stdout)
        //    Note: RapidAPI sometimes returns HTTP 4xx but still populates compile_output
        if (statusId === 6 || (compileOutput && !data?.stdout)) {
          const error = compileOutput || stderr || "Compilation error";
          set({ error, executionResult: { code, output: "", error } });
          return;
        }

        // ── 2. Pure API failure with no executable content (HTTP error, no useful output)
        if (!response.ok && !stderr && !compileOutput && !stdout) {
          const errMsg = data?.message || `API error: ${response.status}`;
          set({ error: errMsg, executionResult: { code, output: "", error: errMsg } });
          return;
        }

        // ── 3. Accepted
        if (statusId === 3) {
          set({
            output: stdout.trim(),
            error: null,
            executionResult: { code, output: stdout.trim(), error: null },
          });
          return;
        }

        // ── 4. Runtime / TLE / SIGSEGV / NZEC / other errors
        const errorBody = stderr || compileOutput || stdout || "";
        const statusLabel = statusDesc ? `[${statusDesc}]\n` : "";
        const error = errorBody
          ? `${statusLabel}${errorBody}`
          : statusDesc || "Runtime error";

        set({ error, executionResult: { code, output: "", error } });

      } catch (err) {
        console.log("Error running code:", err);
        set({
          error: "Error running code",
          executionResult: { code, output: "", error: "Error running code" },
        });
      } finally {
        set({ isRunning: false });
      }
    },
  };
});

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;