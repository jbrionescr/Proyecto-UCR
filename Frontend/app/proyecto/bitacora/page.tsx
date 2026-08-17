"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Tag, Plus, Search, Trash2, CheckCircle, FileSpreadsheet, Edit3, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface LogEntry {
  id: string;
  title: string;
  category: "Investigación" | "Desarrollo" | "Redacción" | "Reunión" | "Revisión";
  date: string;
  hours: number;
  description: string;
  status: "Borrador" | "Enviado";
}

const DEFAULT_ENTRIES: LogEntry[] = [
  {
    id: "1",
    title: "Investigación bibliográfica inicial",
    category: "Investigación",
    date: "2026-03-05",
    hours: 15,
    description: "Lectura y análisis de 12 papers académicos sobre energía solar fotovoltaica en sistemas de distribución eléctrica en Costa Rica.",
    status: "Enviado"
  },
  {
    id: "2",
    title: "Diseño metodológico del estudio de caso",
    category: "Desarrollo",
    date: "2026-04-12",
    hours: 20,
    description: "Definición del modelo matemático para la estimación de radiación solar y configuración preliminar del script en Python para procesamiento.",
    status: "Enviado"
  },
  {
    id: "3",
    title: "Recopilación de datos de subestación",
    category: "Investigación",
    date: "2026-05-18",
    hours: 25,
    description: "Descarga, limpieza y depuración de bases de datos climáticas brindadas por el Instituto Meteorológico Nacional para la provincia de Alajuela.",
    status: "Enviado"
  },
  {
    id: "4",
    title: "Borrador preliminar del capítulo de análisis",
    category: "Redacción",
    date: "2026-06-08",
    hours: 12,
    description: "Redacción inicial de los hallazgos preliminares y tabulación de datos históricos de generación de la planta solar de prueba.",
    status: "Borrador"
  }
];

export default function BitacoraPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<LogEntry["category"]>("Investigación");
  const [formDate, setFormDate] = useState("");
  const [formHours, setFormHours] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<LogEntry["status"]>("Borrador");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("proyecto_bitacora_entries");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        setEntries(DEFAULT_ENTRIES);
      }
    } else {
      setEntries(DEFAULT_ENTRIES);
      localStorage.setItem("proyecto_bitacora_entries", JSON.stringify(DEFAULT_ENTRIES));
    }
  }, []);

  // Save to localStorage helper
  const saveEntries = (newEntries: LogEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("proyecto_bitacora_entries", JSON.stringify(newEntries));
  };

  // Add entry handler
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle || !formDate || !formHours || !formDescription) {
      toast({
        title: "Campos incompletos",
        description: "Por favor llena todos los campos del formulario.",
        variant: "destructive"
      });
      return;
    }

    const hoursNum = parseFloat(formHours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      toast({
        title: "Horas inválidas",
        description: "El número de horas debe ser mayor a 0.",
        variant: "destructive"
      });
      return;
    }

    const newEntry: LogEntry = {
      id: Date.now().toString(),
      title: formTitle,
      category: formCategory,
      date: formDate,
      hours: hoursNum,
      description: formDescription,
      status: formStatus
    };

    const updated = [newEntry, ...entries];
    saveEntries(updated);
    setIsDialogOpen(false);

    // Reset Form
    setFormTitle("");
    setFormCategory("Investigación");
    setFormDate("");
    setFormHours("");
    setFormDescription("");
    setFormStatus("Borrador");

    toast({
      title: "Registro Creado",
      description: `Se agregó la entrada "${newEntry.title}" correctamente.`
    });
  };

  // Delete entry handler
  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter(entry => entry.id !== id);
    saveEntries(updated);
    toast({
      title: "Registro Eliminado",
      description: "La entrada de bitácora ha sido eliminada.",
      variant: "destructive"
    });
  };

  // Toggle status handler
  const handleToggleStatus = (id: string) => {
    const updated = entries.map(entry => {
      if (entry.id === id) {
        const nextStatus: LogEntry["status"] = entry.status === "Borrador" ? "Enviado" : "Borrador";
        toast({
          title: nextStatus === "Enviado" ? "Entrada Enviada" : "Entrada Cambiada a Borrador",
          description: nextStatus === "Enviado" 
            ? "Se ha enviado la bitácora para la revisión de tu mentora." 
            : "La entrada ahora está guardada como borrador local."
        });
        return { ...entry, status: nextStatus };
      }
      return entry;
    });
    saveEntries(updated);
  };

  // Calculate statistics
  const totalHours = entries.reduce((acc, curr) => acc + curr.hours, 0);
  const totalEntries = entries.length;
  const latestDate = entries.length > 0 
    ? [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
    : "Sin registros";

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-0 sm:h-16 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Tablero</span>
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <h1 className="text-base sm:text-lg font-bold text-[#0f4c81] truncate">Bitácora de Trabajo</h1>
          </div>
          <Badge className="bg-blue-50 text-[#0f4c81] hover:bg-blue-50 border-0 font-medium px-3 py-1 text-xs sm:text-sm">
            Gabriel Solano • Estudiante UCR
          </Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        
        {/* Statistics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-border shadow-sm p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Horas Totales</span>
              <h3 className="text-3xl font-black text-[#0f4c81]">{totalHours} hrs</h3>
              <p className="text-xs text-slate-500">Horas acumuladas de avance</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#0f4c81]">
              <Clock className="h-6 w-6" />
            </div>
          </Card>

          <Card className="bg-white border-border shadow-sm p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Entradas del Diario</span>
              <h3 className="text-3xl font-black text-slate-800">{totalEntries}</h3>
              <p className="text-xs text-slate-500">Registros individuales cargados</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-green-700">
              <BookOpen className="h-6 w-6" />
            </div>
          </Card>

          <Card className="bg-white border-border shadow-sm p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase">Última Actividad</span>
              <h3 className="text-lg font-bold text-slate-800 mt-2">
                {latestDate !== "Sin registros" 
                  ? new Date(latestDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                  : latestDate}
              </h3>
              <p className="text-xs text-slate-500">Fecha del último avance</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <Calendar className="h-6 w-6" />
            </div>
          </Card>
        </div>

        {/* Filter and Add new Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por descripción o título..." 
                className="pl-9 text-xs" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter Select */}
            <div className="relative w-full sm:w-48">
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-700 dark:text-slate-100 font-medium"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="Todas">Todas las categorías</option>
                <option value="Investigación">📖 Investigación</option>
                <option value="Desarrollo">💻 Desarrollo</option>
                <option value="Redacción">✍️ Redacción</option>
                <option value="Reunión">🤝 Reunión</option>
                <option value="Revisión">🔎 Revisión</option>
              </select>
            </div>
          </div>

          {/* Add New Button Trigger Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold py-2 px-4 gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Nuevo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white border border-slate-200 shadow-xl rounded-lg p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-[#0f4c81] flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Agregar Registro a la Bitácora
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Registra el avance diario de tu proyecto de graduación. El reporte estará disponible para tu mentor.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddEntry} className="space-y-4 my-2">
                <div className="space-y-1">
                  <Label htmlFor="title" className="text-xs font-bold text-slate-700">Título del Avance</Label>
                  <Input 
                    id="title" 
                    placeholder="Ej. Programación de simulación de cargas" 
                    className="text-xs"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="category" className="text-xs font-bold text-slate-700">Categoría</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as LogEntry["category"])}
                    >
                      <option value="Investigación">📖 Investigación</option>
                      <option value="Desarrollo">💻 Desarrollo</option>
                      <option value="Redacción">✍️ Redacción</option>
                      <option value="Reunión">🤝 Reunión</option>
                      <option value="Revisión">🔎 Revisión</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="hours" className="text-xs font-bold text-slate-700">Horas Dedicadas</Label>
                    <Input 
                      id="hours" 
                      type="number" 
                      step="0.5"
                      placeholder="Ej. 4.5" 
                      className="text-xs"
                      value={formHours}
                      onChange={(e) => setFormHours(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="date" className="text-xs font-bold text-slate-700">Fecha de Actividad</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      className="text-xs"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-xs font-bold text-slate-700">Estado Inicial</Label>
                    <select
                      id="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as LogEntry["status"])}
                    >
                      <option value="Borrador">📁 Borrador Local</option>
                      <option value="Enviado">📨 Enviar a Mentor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description" className="text-xs font-bold text-slate-700">Descripción Detallada</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe las tareas realizadas, obstáculos superados y entregables generados..." 
                    className="text-xs min-h-[90px]"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    required
                  />
                </div>

                <DialogFooter className="pt-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="text-xs font-semibold">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                    Guardar Avance
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* List of Entries */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <Card className="bg-white border-dashed border-2 border-slate-300 p-12 text-center flex flex-col items-center justify-center">
              <BookOpen className="h-10 w-10 text-slate-400 mb-3" />
              <h4 className="font-bold text-slate-700 mb-1">Sin registros encontrados</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                No hay actividades que coincidan con la búsqueda o el filtro seleccionado. ¡Crea una nueva entrada usando el botón superior!
              </p>
            </Card>
          ) : (
            filteredEntries.map((entry) => {
              const isBorrador = entry.status === "Borrador";

              // Get category badge color
              let catColor = "bg-blue-50 text-blue-700 hover:bg-blue-50";
              let catIcon = "📖";
              if (entry.category === "Desarrollo") {
                catColor = "bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
                catIcon = "💻";
              } else if (entry.category === "Redacción") {
                catColor = "bg-orange-50 text-orange-700 hover:bg-orange-50";
                catIcon = "✍️";
              } else if (entry.category === "Reunión") {
                catColor = "bg-indigo-50 text-indigo-700 hover:bg-indigo-50";
                catIcon = "🤝";
              } else if (entry.category === "Revisión") {
                catColor = "bg-purple-50 text-purple-700 hover:bg-purple-50";
                catIcon = "🔎";
              }

              return (
                <Card key={entry.id} className="bg-white border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between">
                  <div className="p-5 space-y-3">
                    {/* Entry Top Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`${catColor} border-0 text-[10px] font-semibold px-2 py-0.5`}>
                            {catIcon} {entry.category}
                          </Badge>
                          <span className="text-xs text-slate-400 font-semibold">
                            {new Date(entry.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-800">{entry.title}</h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-black text-[#0f4c81] block">{entry.hours} hrs</span>
                          <span className="text-[10px] text-slate-400 font-medium">Tiempo dedicado</span>
                        </div>
                      </div>
                    </div>

                    {/* Entry Description */}
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      {entry.description}
                    </p>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado:</span>
                      <button 
                        onClick={() => handleToggleStatus(entry.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 transition-colors flex items-center gap-1 ${
                          isBorrador 
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700" 
                            : "bg-green-50 hover:bg-green-100 text-green-700"
                        }`}
                        title="Haz clic para cambiar el estado"
                      >
                        {isBorrador ? "📁 Borrador Local" : "📨 Enviado al Mentor"}
                      </button>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 h-8 w-8 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
