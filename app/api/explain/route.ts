import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You help neurodivergent readers (autistic and ADHD folks) understand implicit language in text — idioms, figurative speech, sarcasm, and social cues.

Given a passage, find every instance of implicit language and explain it in clear, literal terms. Respond ONLY with JSON matching this shape, no other text:

{
  "explanations": [
    { "phrase": "the exact phrase from the text", "type": "idiom" | "sarcasm" | "figurative" | "social_cue", "explanation": "plain, literal explanation of what it actually means" }
  ]
}

If there is no implicit language in the text, return { "explanations": [] }.`;

export async function POST(request: Request) {
  const { text } = await request.json();

  if (typeof text !== "string" || !text.trim()) {
    return Response.json({ error: "Missing or empty 'text' field" }, { status: 400 });
  }

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block) {
    return Response.json({ error: "No text response from model" }, { status: 502 });
  }

  return Response.json(JSON.parse(block.text));
}
