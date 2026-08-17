"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Mock data (en un escenario real vendría de la base de datos)
const mockProjects = [
  {
    id: "p1",
    projectName: "Plataforma Educativa Inclusiva",
    studentName: "María López",
    age: 21,
    major: "Educación Especial",
    grade: "4to Año",
    scholarshipType: "Beca 5",
    github: "https://github.com/marial/edu-inclusiva",
    sinpe: "8888-1111",
    iban: "CR12015201001011111111",
    estado: "En proceso"
  },
  {
    id: "p2",
    projectName: "Robot Recolector de Plástico",
    studentName: "Carlos Arguedas",
    age: 23,
    major: "Ingeniería Mecánica",
    grade: "Licenciatura",
    scholarshipType: "Beca 4",
    github: "https://github.com/carlosa/robot-clean",
    sinpe: "8888-2222",
    iban: "",
    estado: "Iniciando"
  },
  {
    id: "p3",
    projectName: "Sistema de Alertas Tempranas",
    studentName: "Andrea Gómez",
    age: 20,
    major: "Computación e Informática",
    grade: "3er Año",
    scholarshipType: "Beca 5",
    github: "https://github.com/andreag/alertas",
    sinpe: "8888-3333",
    iban: "CR12015201001033333333",
    estado: "Finalizado"
  }
];

export function StudentProjectsList() {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroCarrera, setFiltroCarrera] = useState("Todas");

  const carrerasUnicas = Array.from(new Set(mockProjects.map(p => p.major)));

  const filteredProjects = mockProjects.filter((project) => {
    const matchEstado = filtroEstado === "Todos" || project.estado === filtroEstado;
    const matchCarrera = filtroCarrera === "Todas" || project.major === filtroCarrera;
    return matchEstado && matchCarrera; // Filtros combinados con AND lógico
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "El archivo no debe pesar más de 5MB.", variant: "destructive" });
        return;
      }
      if (selected.type !== "application/pdf" && selected.type !== "image/jpeg") {
        toast({ title: "Error", description: "Solo se permiten archivos PDF o JPG.", variant: "destructive" });
        return;
      }
      setFile(selected);
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedProjectId) return;

    setIsUploading(true);
    
    // Simulación
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Comprobante Enviado",
        description: "Tu donación ha sido registrada para este estudiante y está en estado Pendiente.",
      });
      setFile(null);
      setSelectedProjectId(null); // Cerrar formulario
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-primary mb-2">Proyectos Estudiantiles</h2>
        <p className="text-lg text-muted-foreground">Apoya el talento UCR financiando los proyectos de nuestros estudiantes becados.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Filtros combinados con AND lógico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filtro-estado">Estado del Proyecto</Label>
            <select
              id="filtro-estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] focus-visible:ring-offset-2"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Iniciando">Iniciando</option>
              <option value="En proceso">En proceso</option>
              <option value="Pausado">Pausado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filtro-carrera">Carrera</Label>
            <select
              id="filtro-carrera"
              value={filtroCarrera}
              onChange={(e) => setFiltroCarrera(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] focus-visible:ring-offset-2"
            >
              <option value="Todas">Todas las carreras</option>
              {carrerasUnicas.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">No se encontraron proyectos que coincidan con estos filtros.</p>
            <Button variant="link" onClick={() => { setFiltroEstado("Todos"); setFiltroCarrera("Todas"); }}>Limpiar filtros</Button>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <Card key={project.id} className="w-full glass shadow-md border-primary/10 overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-primary font-bold">{project.projectName}</CardTitle>
                  <CardDescription className="text-sm mt-1">Estudiante: {project.studentName} ({project.age} años)</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">{project.scholarshipType}</Badge>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                <div>
                  <span className="block font-semibold text-slate-900">Estado</span>
                  <Badge variant="outline" className="mt-1">{project.estado}</Badge>
                </div>
                <div>
                  <span className="block font-semibold text-slate-900">Carrera</span>
                  {project.major}
                </div>
                <div>
                  <span className="block font-semibold text-slate-900">Grado</span>
                  {project.grade}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="block font-semibold text-slate-900">Repositorio</span>
                  <a href={project.github} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                    Ver en GitHub
                  </a>
                </div>
              </div>

              {/* Formulario de donación expandible */}
              {selectedProjectId === project.id ? (
                <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95">
                  <h4 className="font-bold text-slate-800 mb-2">Realizar donación para este proyecto</h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Transfiere el monto a las siguientes cuentas y luego adjunta el comprobante:
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 flex flex-col sm:flex-row gap-6">
                    <div>
                      <span className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">SINPE Móvil</span>
                      <span className="text-lg font-mono text-primary font-semibold">{project.sinpe}</span>
                    </div>
                    {project.iban && (
                      <div>
                        <span className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Cuenta IBAN</span>
                        <span className="text-lg font-mono text-primary font-semibold">{project.iban}</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleDonationSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Monto donado (CRC)</Label>
                      <Input type="number" min="1000" placeholder="Ej. 10000" required className="font-mono bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label>Comprobante de Transferencia (PDF o JPG)</Label>
                      <Input 
                        type="file" 
                        accept=".pdf, .jpg, .jpeg" 
                        onChange={handleFileChange} 
                        required 
                        className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-1 cursor-pointer bg-white"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setSelectedProjectId(null)}>Cancelar</Button>
                      <Button type="submit" disabled={isUploading || !file} className="bg-primary text-white">
                        {isUploading ? "Subiendo..." : "Enviar Comprobante"}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="bg-white pt-0 pb-4 justify-end">
              {selectedProjectId !== project.id && (
                <Button onClick={() => setSelectedProjectId(project.id)} variant="default" className="bg-primary hover:bg-primary/90">
                  Apoyar Proyecto
                </Button>
              )}
            </CardFooter>
          </Card>
        )))}
      </div>
    </div>
  );
}
