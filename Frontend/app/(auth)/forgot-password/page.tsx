"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { forgotPasswordAction } from "@/actions/auth.actions";
import { Loader2, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await forgotPasswordAction(email);
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      toast({ title: t("auth.forgotPassword.toastSuccessTitle"), description: result.message });
    } else {
      toast({ title: t("auth.login.toastGenericErrorTitle"), description: result.message, variant: "destructive" });
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center shadow-xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#0f4c81]">{t("auth.forgotPassword.successTitle")}</CardTitle>
            <CardDescription className="text-base mt-2">
              {t("auth.forgotPassword.successDescPrefix")} <strong>{email}</strong>, {t("auth.forgotPassword.successDescSuffix")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-left">
              <p className="font-semibold mb-1">{t("auth.forgotPassword.stepsTitle")}</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>{t("auth.forgotPassword.step1")}</li>
                <li>{t("auth.forgotPassword.step2")}</li>
                <li>{t("auth.forgotPassword.step3")}</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 pt-4 mt-2">
            <Link href="/login" className="flex items-center text-sm font-semibold text-[#0f4c81] hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t("auth.forgotPassword.goToLogin")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#0f4c81]">{t("auth.forgotPassword.title")}</CardTitle>
          <CardDescription>
            {t("auth.forgotPassword.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.forgotPassword.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || !email}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("auth.forgotPassword.submitting")}</> : t("auth.forgotPassword.submit")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
          <Link href="/login" className="flex items-center text-sm font-semibold text-[#0f4c81] hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("auth.forgotPassword.backToLogin")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
