"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MailCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resendMagicLinkAction } from "@/actions/auth.actions";
import { Suspense } from "react";

function VerificarCorreoContent() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "tu correo institucional";
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResend = async () => {
    const emailParam = searchParams?.get("email");
    if (!emailParam) return;

    setIsResending(true);
    const result = await resendMagicLinkAction(emailParam);
    setIsResending(false);

    if (result.success) {
      toast({ title: "Enlace reenviado", description: "Revisa tu bandeja de entrada o spam." });
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md text-center shadow-xl border-slate-200">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <MailCheck className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#0f4c81]">Revisa tu correo</CardTitle>
          <CardDescription className="text-base mt-2">
            Hemos enviado un enlace mágico de verificación a:
            <br />
            <strong className="text-slate-800 mt-1 inline-block">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-6">
            Haz clic en el enlace del correo para activar tu cuenta. El enlace expirará en 24 horas.
          </p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0 || !searchParams?.get("email")}
          >
            {isResending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
            ) : resendCooldown > 0 ? (
              `Reenviar enlace en ${resendCooldown}s`
            ) : (
              "No recibí el correo, reenviar enlace"
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
          <Link href="/login" className="text-sm font-semibold text-[#0f4c81] hover:underline">
            Volver a inicio de sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerificarCorreoPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center shadow-xl border-slate-200 p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-600">Cargando...</p>
        </Card>
      </div>
    }>
      <VerificarCorreoContent />
    </Suspense>
  );
}
