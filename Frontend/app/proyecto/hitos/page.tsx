"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Clock, MessageSquare, AlertCircle, FileText, Calendar, PlusCircle, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: number;
  title: string;
  expectedDate: string;
  completedDate?: string;
  status: "completado" | "en_curso" | "revision_pendiente" | "pendiente";
  description: string;
  deliverables: string[];
  feedback?: {
    author: string;
    role: string;
    comment: string;
    date: string;
  };
}

export default function HitosPage() {
  const { toast } = useToast();
  
  // Hitos iniciales
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 1,
      title: "Propuesta de Tema y Objetivos",
      expectedDate: "10 de Marzo, 2026",
      completedDate: "8 de Marzo, 2026",
      status: "completado",
      description: "Definición formal del tema de investigación, planteamiento del problema, objetivos generales y específicos para la tesis de grado.",
      deliverables: ["Propuesta_Final.pdf", "Carta_Aprobacion_Mentor.pdf"],
      feedback: {
        author: "Ing. Maria Valverde",
        role: "Mentora de Proyecto",
        comment: "Tema sumamente relevante y bien delimitado para el contexto actual del país. Los objetivos planteados son claros, medibles y viables. Excelente inicio.",
        date: "8 de Marzo, 2026"
      }
    },
    {
      id: 2,
      title: "Revisión de Literatura y Marco Teórico",
      expectedDate: "22 de Abril, 2026",
      completedDate: "20 de Abril, 2026",
      status: "completado",
      description: "Compilación bibliográfica estructurada, análisis de trabajos anteriores y bases teóricas sobre la energía solar y transición energética en Costa Rica.",
      deliverables: ["Marco_Teorico_Borrador_v2.pdf", "Bibliografia_Anotada.xlsx"],
      feedback: {
        author: "Ing. Maria Valverde",
        role: "Mentora de Proyecto",
        comment: "Felicidades por la recopilación de referencias de la región centroamericana. Recomiendo profundizar un poco más en las últimas normativas técnicas del ICE.",
        date: "20 de Abril, 2026"
      }
    },
    {
      id: 3,
      title: "Fase de Recolección de Datos y Metodología",
      expectedDate: "28 de Mayo, 2026",
      completedDate: "27 de Mayo, 2026",
      status: "completado",
      description: "Establecimiento formal de la metodología de investigación. Recolección de datos climatológicos históricos del IMN y curvas de consumo de plantas piloto.",
      deliverables: ["Datos_Recoleccion_Final.xlsx", "Metodologia_Detallada_Firmada.pdf"],
      feedback: {
        author: "Ing. Maria Valverde",
        role: "Mentora de Proyecto",
        comment: "El conjunto de datos recopilados es muy robusto. La metodología de triangulación propuesta es correcta y mitiga bien el sesgo de datos atípicos.",
        date: "28 de Mayo, 2026"
      }
    },
    {
      id: 4,
      title: "Análisis Final y Reporte de Resultados",
      expectedDate: "25 de Junio, 2026",
      status: "en_curso",
      description: "Análisis estadístico de los datos climáticos e históricos usando modelos predictivos y redacción detallada del capítulo de resultados del proyecto.",
      deliverables: ["Borrador_Capitulo_Resultados.docx"]
    },
    {
      id: 5,
      title: "Conclusiones y Defensa Final",
      expectedDate: "20 de Julio, 2026",
      status: "pendiente",
      description: "Redacción final de conclusiones y recomendaciones prácticas. Preparación de la presentación multimedia, pre-defensa y defensa formal de tesis.",
      deliverables: []
    }
  ]);

  const [expandedId, setExpandedId] = useState<number | null>(4); // Por defecto el hito actual está abierto

  // Acción para simular enviar el entregable del hito actual a revisión
  const handleRequestReview = (id: number) => {
    setMilestones(prev => 
      prev.map(m => {
        if (m.id === id) {
          return { ...m, status: "revision_pendiente" };
        }
        return m;
      })
    );

    toast({
      title: "Solicitud de Revisión Enviada",
      description: "Se ha enviado una notificación a tu mentora Maria Valverde con tus últimos archivos.",
      variant: "default",
    });
  };

  // Acción para simular que el mentor aprueba el hito
  const handleApproveMilestone = (id: number) => {
    setMilestones(prev => 
      prev.map(m => {
        if (m.id === id) {
          return { 
            ...m, 
            status: "completado",
            completedDate: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
            feedback: {
              author: "Ing. Maria Valverde",
              role: "Mentora de Proyecto",
              comment: "Gran trabajo. He revisado tus análisis de datos y la correlación planteada es sólida. Pasa al siguiente hito.",
              date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
            }
          };
        }
        // Activar el siguiente hito
        if (m.id === id + 1 && m.status === "pendiente") {
          return { ...m, status: "en_curso" };
        }
        return m;
      })
    );

    toast({
      title: "¡Hito Completado!",
      description: "Has completado con éxito este hito. El siguiente hito ahora está activo.",
    });
  };

  // Calcular el progreso general
  const completedCount = milestones.filter(m => m.status === "completado").length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

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
            <h1 className="text-base sm:text-lg font-bold text-[#0f4c81] truncate">Hitos del Proyecto</h1>
          </div>
          <Badge className="bg-blue-50 text-[#0f4c81] hover:bg-blue-50 border-0 font-medium px-3 py-1 text-xs sm:text-sm">
            Gabriel Solano • Estudiante UCR
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        
        {/* Project Header Info Card */}
        <Card className="bg-white border-border shadow-sm p-6 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-24 bg-[#0f4c81]/5 rounded-l-full pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#0f4c81] uppercase tracking-wider">Proyecto de Graduación Activo</span>
              <h2 className="text-2xl font-bold text-slate-800">Investigación de Energía Renovable en Sistemas Locales</h2>
              <p className="text-sm text-slate-500">
                Mentora principal: <span className="font-semibold text-slate-700">Ing. Maria Valverde</span>
              </p>
            </div>
            <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
              <div className="flex justify-between items-center text-sm font-semibold mb-1 text-slate-700">
                <span>Progreso General</span>
                <span className="text-[#0f4c81] text-base">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2.5 bg-slate-200" />
              <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                <span>{completedCount} de {milestones.length} completados</span>
                <span>Graduación: Julio 2026</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Milestone Timeline section */}
        <div className="space-y-6 relative pl-6 md:pl-8 before:absolute before:left-[19px] md:before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          
          {milestones.map((m) => {
            const isCompleted = m.status === "completado";
            const isInProgress = m.status === "en_curso";
            const isPendingReview = m.status === "revision_pendiente";
            const isPending = m.status === "pendiente";
            const isExpanded = expandedId === m.id;

            return (
              <div key={m.id} className="relative group">
                
                {/* Timeline Icon Marker */}
                <div className="absolute -left-[30px] md:-left-[34px] top-1.5 z-10 flex items-center justify-center">
                  {isCompleted && (
                    <div className="h-6 w-6 rounded-full bg-green-100 border border-green-500 flex items-center justify-center text-green-600 shadow-sm">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                  {isInProgress && (
                    <div className="h-6 w-6 rounded-full bg-blue-100 border border-blue-500 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    </div>
                  )}
                  {isPendingReview && (
                    <div className="h-6 w-6 rounded-full bg-amber-100 border border-amber-500 flex items-center justify-center text-amber-600 shadow-sm">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                  )}
                  {isPending && (
                    <div className="h-6 w-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-slate-300" />
                    </div>
                  )}
                </div>

                {/* Timeline Card */}
                <Card className={`bg-white border-border shadow-sm hover:shadow-md transition-all duration-300 ${
                  isInProgress ? "border-blue-300 ring-1 ring-blue-100" : ""
                } ${isPendingReview ? "border-amber-300 ring-1 ring-amber-500/10" : ""}`}>
                  
                  {/* Card Main Bar */}
                  <div 
                    className="p-5 flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  >
                    <div className="space-y-1 pr-4 min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-semibold text-slate-400">Hito {m.id}</span>
                        <h3 className={`text-base font-bold text-slate-800 transition-colors break-words ${
                          isInProgress ? "text-blue-700" : ""
                        }`}>
                          {m.title}
                        </h3>
                        {isCompleted && (
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-0 text-[10px] font-semibold px-2 py-0.5">
                            COMPLETADO
                          </Badge>
                        )}
                        {isInProgress && (
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 text-[10px] font-semibold px-2 py-0.5">
                            EN CURSO
                          </Badge>
                        )}
                        {isPendingReview && (
                          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-0 text-[10px] font-semibold px-2 py-0.5">
                            EN REVISIÓN
                          </Badge>
                        )}
                        {isPending && (
                          <Badge className="bg-slate-50 text-slate-400 hover:bg-slate-50 border-0 text-[10px] font-semibold px-2 py-0.5">
                            PENDIENTE
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {isCompleted ? `Entregado: ${m.completedDate}` : `Entrega esperada: ${m.expectedDate}`}
                        </span>
                        {m.deliverables.length > 0 && (
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            {m.deliverables.length} archivos
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                        {isExpanded ? "Ocultar" : "Detalles"}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-slate-50 pt-4 space-y-4 bg-slate-50/30">
                      
                      <div className="text-sm text-slate-600 leading-relaxed">
                        <p>{m.description}</p>
                      </div>

                      {/* Deliverables section */}
                      {m.deliverables.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Archivos y Entregables</h4>
                          <div className="flex flex-wrap gap-2">
                            {m.deliverables.map((file, i) => (
                              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium hover:border-slate-300 transition-colors">
                                <FileText className="h-3.5 w-3.5 text-blue-500" />
                                <span>{file}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mentor Feedback section */}
                      {m.feedback && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden">
                          <div className="absolute right-3 top-3 text-slate-100 pointer-events-none">
                            <MessageSquare className="h-16 w-16" />
                          </div>
                          <div className="flex items-center gap-2 relative z-10">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-[#0f4c81]">
                              MV
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-800">{m.feedback.author}</h5>
                              <p className="text-[10px] text-slate-400">{m.feedback.role} • {m.feedback.date}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed italic relative z-10 bg-slate-50/50 p-2.5 rounded-lg border border-slate-50">
                            "{m.feedback.comment}"
                          </p>
                        </div>
                      )}

                      {/* Action buttons inside the active milestone */}
                      {isInProgress && (
                        <div className="pt-2 flex flex-col sm:flex-row gap-3 border-t border-slate-100">
                          <Button 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-2"
                            onClick={() => handleRequestReview(m.id)}
                          >
                            <Send className="h-3.5 w-3.5" />
                            Enviar a Revisión de Mentor
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-slate-300 text-xs font-semibold"
                            onClick={() => handleApproveMilestone(m.id)}
                          >
                            Marcar como Completado (Simular Aprobación)
                          </Button>
                        </div>
                      )}

                      {isPendingReview && (
                        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
                            <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />
                            <span>Esperando que el mentor apruebe el entregable. Puedes acelerar este paso:</span>
                          </div>
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold"
                            onClick={() => handleApproveMilestone(m.id)}
                          >
                            Aprobar Hito (Simular Mentor)
                          </Button>
                        </div>
                      )}

                      {isPending && (
                        <div className="flex items-center gap-2 p-3 bg-slate-100/50 rounded-lg text-xs text-slate-500">
                          <AlertCircle className="h-4 w-4 text-slate-400" />
                          <span>Este hito estará disponible una ver que se apruebe el Hito {m.id - 1}.</span>
                        </div>
                      )}

                    </div>
                  )}

                </Card>
              </div>
            );
          })}

        </div>

        {/* Floating summary */}
        <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg border border-blue-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-lg flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" />
              ¿Listo para tu defensa en Julio?
            </h4>
            <p className="text-xs text-blue-100">
              Mantente al día con tus entregables de la bitácora para asegurar tu aprobación a tiempo.
            </p>
          </div>
          <Link href="/proyecto/bitacora">
            <Button className="bg-white hover:bg-slate-100 text-[#0f4c81] font-semibold text-xs py-2 px-4 border-0">
              Ver Bitácora de Trabajo
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
