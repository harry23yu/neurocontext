import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You help neurodivergent readers (autistic and ADHD folks) understand implicit language in text — idioms, figurative speech, sarcasm, and social cues.

Only flag a phrase if its literal, word-for-word meaning would be misleading, confusing, or incomplete for the reader — i.e. the intended meaning genuinely diverges from what the words say. Do NOT flag plain, literal, sincere statements just because they carry emotion, invite a response, or a reader might reply to them — that is normal communication, not implicit language. Do NOT flag ordinary literal phrasing (e.g. "out there" meaning a physical location) just because it resembles a common expression.

A well-known idiom can still be meant literally if the surrounding context makes a literal reading plausible (e.g. "break a leg" said to someone about to ski is genuinely ambiguous — skiing carries real risk of that exact injury). In cases like this, do not flag it as purely idiomatic — either skip it, or explain both the idiomatic and literal readings and note the ambiguity.

Given a passage, find every instance of implicit language and explain it in clear, literal terms. Respond ONLY with JSON matching this shape, no other text:

{
  "explanations": [
    { "phrase": "the exact phrase from the text", "type": "idiom" | "sarcasm" | "figurative" | "social_cue", "explanation": "plain, literal explanation of what it actually means" }
  ]
}

If there is no implicit language in the text, return { "explanations": [] }.`;

export async function POST(request: Request) {
  const { text, context } = await request.json();

  if (typeof text !== "string" || !text.trim()) {
    return Response.json({ error: "Missing or empty 'text' field" }, { status: 400 });
  }

  let userMessage = text;
  if (context && typeof context === "string" && context.trim()) {
    userMessage = `Text source: ${context}\n\n${text}`;
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
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
