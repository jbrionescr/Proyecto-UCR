import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const data = await parser.getText();
      text = data.text;
    } else if (file.name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.name.endsWith(".txt") || file.type === "text/plain") {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json({ error: "Formato no soportado. Sube PDF, DOCX o TXT." }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error extracting text:", error);
    return NextResponse.json({ error: "Error procesando el archivo" }, { status: 500 });
  }
}
