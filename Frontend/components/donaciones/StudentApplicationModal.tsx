"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function StudentApplicationModal() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const githubLink = formData.get("github") as string;

    // Validación estricta para GitHub
    const githubRegex = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?.*$/i;
    if (!githubRegex.test(githubLink)) {
      toast({
        title: "Error de validación",
        description: "El enlace debe ser un repositorio válido de GitHub (ej. https://github.com/usuario/repo).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulación del Server Action de postulación
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOpen(false);
      toast({
        title: "Postulación Enviada",
        description: "Tu proyecto ha sido registrado y estará visible para los exalumnos.",
      });
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white py-6 px-8 text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02]">
          Postularte a donación para tu proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Postulación de Proyecto</DialogTitle>
          <DialogDescription>
            Completa todos los campos para que los exalumnos puedan conocer y apoyar tu proyecto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Nombre de tu proyecto</Label>
            <Input id="projectName" name="projectName" placeholder="Ej. Sistema de Análisis de Datos" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">Link de repositorio de GitHub</Label>
            <Input id="github" name="github" type="url" placeholder="https://github.com/tu-usuario/repo" required />
            <p className="text-xs text-muted-foreground">Únicamente se aceptan enlaces de github.com.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" name="fullName" placeholder="Ej. Juan Pérez" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input id="age" name="age" type="number" min="16" max="100" placeholder="Ej. 22" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="major">Carrera</Label>
              <Input id="major" name="major" placeholder="Ej. Ingeniería Informática" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grado en el que va</Label>
              <Input id="grade" name="grade" placeholder="Ej. 3er Año / Bachillerato" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scholarshipType">Tipo de beca</Label>
            <Select name="scholarshipType" required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná tu tipo de beca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beca4">Beca 4</SelectItem>
                <SelectItem value="beca5">Beca 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-6">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Información para recibir donaciones</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sinpe">Número para SINPE Móvil</Label>
                <Input id="sinpe" name="sinpe" type="tel" placeholder="Ej. 88888888" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">Cuenta IBAN (Opcional)</Label>
                <Input id="iban" name="iban" placeholder="CR..." />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Esta información será visible para los exalumnos al momento de realizar la donación.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Postulación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
