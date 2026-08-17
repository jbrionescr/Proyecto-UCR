import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cedula = request.nextUrl.searchParams.get("identificacion");
  if (!cedula) return NextResponse.json({ error: "Identificación requerida" }, { status: 400 });

  try {
    const res = await fetch(`https://api.hacienda.go.cr/fe/ae?identificacion=${encodeURIComponent(cedula)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return NextResponse.json({}, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "No se pudo consultar Hacienda" }, { status: 502 });
  }
}
