import { NextRequest, NextResponse } from "next/server";

const JUDGE0_URL =
  "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.JUDGE0_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "JUDGE0_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const { language_id, source_code, stdin } = await req.json();

    if (!language_id || !source_code) {
      return NextResponse.json(
        { error: "language_id and source_code are required" },
        { status: 400 }
      );
    }

    const response = await fetch(JUDGE0_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      body: JSON.stringify({ language_id, source_code, stdin }),
    });

    // Always forward the body — even on HTTP errors Judge0 may include
    // useful info like compile_output
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
