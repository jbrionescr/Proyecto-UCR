export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface CVData {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
  experience: Experience[];
  skills: string[];
  education: { institution: string; degree: string; period: string }[];
  certifications: string[];
}

// Template vacío — la página mi-curriculum carga los datos reales del usuario autenticado
export const initialCV: CVData = {
  name: "",
  title: "",
  location: "San José, Costa Rica",
  email: "",
  phone: "",
  summary: "",
  experience: [],
  skills: [],
  education: [],
  certifications: [],
};
