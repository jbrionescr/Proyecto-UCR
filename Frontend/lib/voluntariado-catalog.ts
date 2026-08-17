// Catálogo fijo de formas en que un exalumno puede "Retribuir a la UCR".
// Al ofrecerse, se guarda una copia de titulo/categoria en VOLUNTARIADOS_UCR
// para que el registro no cambie si el catálogo se actualiza después.

export interface VoluntariadoCatalogItem {
  tipo: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  duracion: string;
}

export const CATALOGO_VOLUNTARIADO: VoluntariadoCatalogItem[] = [
  {
    tipo: "orientacion",
    categoria: "Orientación",
    titulo: "Charla de orientación vocacional",
    descripcion: "Comparte tu trayectoria con estudiantes de primer ingreso.",
    duracion: "2 horas, sesión única",
  },
  {
    tipo: "evaluacion",
    categoria: "Evaluación",
    titulo: "Jurado evaluador de TFG",
    descripcion: "Califica y retroalimenta trabajos finales de graduación.",
    duracion: "4 horas en 2 semanas",
  },
  {
    tipo: "apoyo_proyecto",
    categoria: "Proyecto universitario",
    titulo: "Apoyo a proyectos de TFG",
    descripcion: "Brinda soporte técnico o datos para tesis estudiantiles.",
    duracion: "Frecuencia variable",
  },
];
