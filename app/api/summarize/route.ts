import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You help neurodivergent readers (autistic and ADHD folks) get an accessible overview of a longer passage before reading it in full.

Given a passage, respond ONLY with JSON matching this shape, no other text:

{
  "summary": "a short, plain-language summary of the passage (2-4 sentences)",
  "keyPoints": ["a key point from the passage", "another key point", ...]
}`;

export async function POST(request: Request) {
  const { text } = await request.json();

  if (typeof text !== "string" || !text.trim()) {
    return Response.json({ error: "Missing or empty 'text' field" }, { status: 400 });
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block) {
    return Response.json({ error: "No text response from model" }, { status: 502 });
  }

  let jsonText = block.text.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.slice(7).trimStart();
    const endIdx = jsonText.lastIndexOf("```");
    if (endIdx !== -1) jsonText = jsonText.slice(0, endIdx).trimEnd();
  }

  return Response.json(JSON.parse(jsonText));
}
