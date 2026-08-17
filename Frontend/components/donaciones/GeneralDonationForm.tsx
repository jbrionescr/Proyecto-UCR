"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { fetchAPI } from "@/lib/api";
import { Loader2, Copy, Check, Smartphone, Landmark } from "lucide-react";

export function GeneralDonationForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [destino, setDestino] = useState("fondo_general");
  const [monto, setMonto] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast({ title: "Acceso denegado", description: "Debes iniciar sesión para hacer una donación", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Crear registro en BD como solicitud
      await fetchAPI('/donaciones', {
        method: 'POST',
        body: JSON.stringify({
          exalumno_id: session.user.id,
          monto: parseFloat(monto),
          destino,
          estado: 'PENDIENTE',
          comprobante_url: "",
        }),
      });

      toast({
        title: "Solicitud Enviada",
        description: "Tu solicitud de donación ha sido enviada para ser evaluada.",
      });
      
      // Reset form
      setMonto("");
      

    } catch (error: any) {
      toast({
        title: "Error en donación",
        description: error.message || "No se pudo procesar la donación",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-border bg-white p-2 sm:p-6">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-[#0f4c81]">
          Módulo de Donaciones Generales
        </CardTitle>
        <CardDescription className="text-base sm:text-lg mt-2">
          Envía tu solicitud de donación. Un administrador la revisará y te contactará con los pasos a seguir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Destino de la Donación</Label>
            <Select value={destino} onValueChange={setDestino} required>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccioná un destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fondo_general">Fondo General de Becas</SelectItem>
                <SelectItem value="proyecto_graduacion">Fondo de Proyectos de Graduación</SelectItem>
                <SelectItem value="emergencia">Fondo de Emergencia Estudiantil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Monto (CRC)</Label>
            <Input 
              type="number" 
              min="1000" 
              placeholder="Ej. 10000" 
              required 
              className="text-lg font-mono bg-white" 
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>



          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-xl shadow-lg transition-all">
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando solicitud...</> : "Solicitar Donación"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center pt-2 pb-6">
        <p className="text-xs text-muted-foreground text-center">
          Las donaciones quedan en estado <span className="font-bold">Pendiente</span> hasta ser verificadas por la administración. SLA de respuesta: 48 horas.
        </p>
      </CardFooter>
    </Card>
  );
}
