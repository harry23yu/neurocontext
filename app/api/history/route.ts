import { verifySession } from "@/app/lib/dal";
import { saveHistoryEntry } from "@/app/lib/history";

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const { mode, inputText, inputContext, resultSummary, resultExplanations } = await request.json();

  if (mode !== "text" && mode !== "context" && mode !== "pdf") {
    return Response.json({ error: "Invalid 'mode' field" }, { status: 400 });
  }
  if (typeof inputText !== "string" || !inputText.trim()) {
    return Response.json({ error: "Missing or empty 'inputText' field" }, { status: 400 });
  }

  await saveHistoryEntry({
    userId: session.userId,
    mode,
    inputText,
    inputContext: typeof inputContext === "string" ? inputContext : null,
    resultSummary: resultSummary ?? {},
    resultExplanations: resultExplanations ?? [],
  });

  return Response.json({ ok: true });
}
