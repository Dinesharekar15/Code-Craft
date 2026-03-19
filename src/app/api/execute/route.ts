import { NextRequest, NextResponse } from "next/server";

const PISTON_URL = process.env.PISTON_URL || "http://localhost:2000";

export async function POST(req: NextRequest) {
  try {
    const { pistonLanguage, pistonVersion, pistonFileName, source_code, stdin = "" } =
      await req.json();

    if (!pistonLanguage || !source_code) {
      return NextResponse.json(
        { error: "pistonLanguage and source_code are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: pistonLanguage,
        version: pistonVersion,
        files: [
          {
            name: pistonFileName,
            content: source_code,
          },
        ],
        stdin,
        compile_timeout: 10000, // 10s compile time
        run_timeout: 5000,      // 5s run time
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Piston error (${response.status}): ${text}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";

    // Give a helpful message if Piston is not running yet
    if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
      return NextResponse.json(
        {
          error:
            "Cannot connect to Piston. Make sure Docker Desktop is running and Piston container is active.\n\nRun: docker run --privileged -d -p 2000:2000 --name piston ghcr.io/engineer-man/piston",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
