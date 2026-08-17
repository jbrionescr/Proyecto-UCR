"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/hooks/use-toast";
import { changePasswordAction } from "@/actions/auth.actions";
import { Loader2, Lock, ShieldCheck, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ newPassword: "", confirm: "" });

  if (status === "loading") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0f4c81]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  const userId = (session?.user as any)?.id as string | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (!userId) {
      toast({ title: "Error", description: "Sesión inválida. Inicia sesión de nuevo.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const result = await changePasswordAction(userId, form.newPassword);
    setIsLoading(false);

    if (result.success) {
      toast({ title: "Contraseña actualizada", description: "Tu nueva contraseña ha sido guardada." });
      const tipo = (session?.user as any)?.tipo as string | undefined;
      if (tipo === "ADMIN") router.push("/admin");
      else if (tipo === "EXALUMNO") router.push("/directorio/exalumnos");
      else router.push("/mis-matches");
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader>
          <div className="mx-auto w-14 h-14 bg-[#0f4c81]/10 rounded-full flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-[#0f4c81]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#0f4c81] text-center">Nueva Contraseña</CardTitle>
          <CardDescription className="text-center">
            Elige una contraseña segura de al menos 8 caracteres, con una mayúscula y un número.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="pl-10"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Repite la contraseña"
                  className="pl-10"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !form.newPassword || !form.confirm}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : "Guardar nueva contraseña"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
          <Link href="/" className="flex items-center text-sm font-semibold text-[#0f4c81] hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
