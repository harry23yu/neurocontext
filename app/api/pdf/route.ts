import { PDFParse } from "pdf-parse";

const MAX_PDF_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing 'file' field" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return Response.json({ error: "File must be a PDF" }, { status: 400 });
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return Response.json({ error: "PDF must be 1 MB or smaller" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return Response.json({ text: result.text });
  } finally {
    await parser.destroy();
  }
}
