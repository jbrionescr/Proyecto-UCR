import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Solo disponible en desarrollo
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "No disponible en producción" }, { status: 403 });
  }

  const to = req.nextUrl.searchParams.get("to");
  if (!to) {
    return NextResponse.json({ error: "Falta el parámetro ?to=correo@ejemplo.com" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY no está configurada en .env.local" }, { status: 500 });
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Test de diagnóstico — Alumni U",
      html: `<p>Este es un correo de prueba enviado desde <code>${fromEmail}</code>.</p>
             <p>Si ves esto, Resend está funcionando correctamente.</p>`,
    });

    if (error) {
      return NextResponse.json({
        ok: false,
        from: fromEmail,
        resend_error: error,
        tip: fromEmail.endsWith("@resend.dev")
          ? "Usando onboarding@resend.dev: solo llega al correo del dueño de la cuenta Resend."
          : `El dominio '${fromEmail.split("@")[1]}' necesita estar verificado en el dashboard de Resend.`,
      }, { status: 400 });
    }

    return NextResponse.json({ ok: true, from: fromEmail, to, resend_id: data?.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, exception: e?.message ?? String(e) }, { status: 500 });
  }
}
