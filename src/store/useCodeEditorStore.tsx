import { CodeEditorState } from "./../types/index";
import { LANGUAGE_CONFIG } from "../app/(root)/_constants";
import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";

const getInitialState = () => {
  // if we're on the server, return default values
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  // if we're on the client, return values from local storage bc localStorage is a browser API.
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,

    getCode: () => get().editor?.getValue() || "",

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
      // Save current language code before switching
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem("editor-language", language);

      set({
        language,
        output: "",
        error: null,
      });
    },

    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();

      if (!code) {
        set({ error: "Please enter some code" });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      try {
        const judge0Id = LANGUAGE_CONFIG[language].judge0Id;
        const apiKey = process.env.NEXT_PUBLIC_JUDGE0_API_KEY;

        const response = await fetch(
          "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": apiKey || "",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
            body: JSON.stringify({
              language_id: judge0Id,
              source_code: code,
            }),
          }
        );

        const data = await response.json();

        console.log("data back from judge0:", data);

        // Handle API-level errors (e.g. missing/invalid API key)
        // NOTE: data.message is NOT an API error — Judge0 uses it to note non-zero exits.
        // Only treat HTTP non-200 as an API-level failure.
        if (!response.ok) {
          const errMsg = data.message || `API error: ${response.status}`;
          set({ error: errMsg, executionResult: { code, output: "", error: errMsg } });
          return;
        }

        // Helper: strip generic "Exited with error status N" lines that Judge0 sandbox adds
        const extractError = (raw: string | null) =>
          (raw || "")
            .split("\n")
            .filter((line) => !/^Exited with (error )?status \d+/.test(line.trim()))
            .join("\n")
            .trim();

        // status.id === 6 means Compilation Error
        if (data.status?.id === 6) {
          const error =
            extractError(data.compile_output) ||
            extractError(data.stderr) ||
            "Compilation error";
          set({
            error,
            executionResult: { code, output: "", error },
          });
          return;
        }

        // status.id === 3 means Accepted (successful execution)
        if (data.status?.id === 3) {
          const output = data.stdout || "";
          set({
            output: output.trim(),
            error: null,
            executionResult: {
              code,
              output: output.trim(),
              error: null,
            },
          });
          return;
        }

        // All other statuses = runtime errors (NZEC, TLE, SIGSEGV, etc.)
        // Judge0 CE on RapidAPI puts the actual error trace in stderr.
        // Some configurations also echo it to stdout. We combine both.
        const stderrClean = extractError(data.stderr);
        const stdoutClean = extractError(data.stdout);
        const compileClean = extractError(data.compile_output);

        const errorBody =
          stderrClean ||
          compileClean ||
          stdoutClean || // fallback: some JS/Python errors end up in stdout
          "";

        const statusLabel = data.status?.description
          ? `[${data.status.description}]\n`
          : "";

        const error = errorBody
          ? `${statusLabel}${errorBody}`
          : `${data.status?.description || "Runtime error"}`;

        set({
          error,
          executionResult: { code, output: "", error },
        });
        return;
      } catch (error) {
        console.log("Error running code:", error);
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