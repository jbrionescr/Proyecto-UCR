"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CATALOGO_AREAS } from "@/lib/constants";

export function NewJobModal() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;

    try {
      const res = await fetch("/api/posiciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: (form.elements.namedItem("titulo") as HTMLInputElement).value,
          tipo: (form.elements.namedItem("tipo") as HTMLInputElement).value,
          descripcion: (form.elements.namedItem("descripcion") as HTMLTextAreaElement).value,
          hard_skills: (form.elements.namedItem("habilidades") as HTMLInputElement).value.split(",").map(s => s.trim()),
          fecha_limite: (form.elements.namedItem("fecha_limite") as HTMLInputElement).value,
          area_estudio: (form.elements.namedItem("area_estudio") as HTMLInputElement).value,
        }),
      });

      if (!res.ok) throw new Error("Error al publicar la vacante");

      setIsOpen(false);
      toast({
        title: "Vacante Publicada",
        description: "La posición ha sido publicada exitosamente.",
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo publicar la vacante.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white py-6 px-8 text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02]">
          Publicar Nueva Posición
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Publicar Nueva Posición</DialogTitle>
          <DialogDescription>
            Abre las puertas de tu empresa al talento UCR.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Título de la Vacante</Label>
              <Input name="titulo" placeholder="Ej. Desarrollador Frontend Junior" required />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Posición</Label>
              <Select name="tipo" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLEO">Empleo a Tiempo Completo</SelectItem>
                  <SelectItem value="PASANTIA">Pasantía / Práctica Profesional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Área de Estudio Preferida</Label>
            <Select name="area_estudio" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un Área" />
              </SelectTrigger>
              <SelectContent>
                {CATALOGO_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descripción y Requisitos</Label>
            <Textarea
              name="descripcion"
              placeholder="Detalla las responsabilidades y el perfil buscado..."
              className="min-h-[120px] resize-none overflow-hidden"
              required
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Habilidades Requeridas (separadas por coma)</Label>
              <Input name="habilidades" placeholder="Introduzca aquí las habilidades requeridas" required />
            </div>
            <div className="space-y-2">
              <Label>Fecha Límite de Aplicación</Label>
              <Input name="fecha_limite" type="date" required />
              <p className="text-xs text-muted-foreground mt-1">La posición se cerrará automáticamente en esta fecha.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publicando..." : "Publicar Vacante"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
