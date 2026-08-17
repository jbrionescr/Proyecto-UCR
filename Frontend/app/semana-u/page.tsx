"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MapPin, Music, Info, Sparkles, Star, CheckCircle2,
  Image as ImageIcon, Bookmark, Check, ArrowRight, Award, Flame,
  Search, Play, Pause, RefreshCw, HelpCircle, Ticket, X, Volume2, CalendarDays, Download
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";
import { useLanguage } from "@/components/providers/LanguageContext";

interface Actividad {
  id: string;
  titulo: string;
  categoria: "deportes" | "cultural" | "social" | "academico";
  hora: string;
  dia: string;
  lugar: string;
  descripcion: string;
}

interface Artista {
  hora: string;
  nombre: string;
  genero: string;
  descripcion: string;
  tarima: string;
  cancionMuestra: string;
}

// ─── AUDIO SYNTHESIZER FOR LIVE DEMOS (Web Audio API) ─────────────────────────
class UCRSynth {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;
  public isPlaying: boolean = false;

  start(artist: string) {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();
    this.isPlaying = true;
    let tempo = 120;
    let beatCount = 0;

    const playSound = (freq: number, type: OscillatorType, duration: number, delay: number, volume: number = 0.25) => {
      if (!this.audioCtx || this.audioCtx.state === "suspended") return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + delay);
        
        gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + delay + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        osc.start(this.audioCtx.currentTime + delay);
        osc.stop(this.audioCtx.currentTime + delay + duration);
      } catch (e) {}
    };

    if (artist === "Rialengo") {
      // Cumbia beat
      tempo = 98;
      const stepTime = 60 / tempo / 2;
      this.intervalId = setInterval(() => {
        // Kick
        if (beatCount % 2 === 0) playSound(65, "sine", 0.18, 0, 0.45);
        // Cowbell on beats
        if (beatCount % 4 === 0) playSound(780, "triangle", 0.08, 0, 0.18);
        // Guiro/Shaker
        if (beatCount % 2 === 1) playSound(950, "sine", 0.04, 0, 0.06);
        beatCount = (beatCount + 1) % 8;
      }, stepTime * 1000);
    } else if (artist === "Guadalupe Urbina") {
      // Guitar pluck trova arpeggio
      tempo = 80;
      const stepTime = 60 / tempo / 2;
      const scale = [146.83, 185.00, 220.00, 293.66, 370.00, 293.66, 220.00, 185.00]; // D Major arpeggio
      this.intervalId = setInterval(() => {
        const freq = scale[beatCount % scale.length];
        playSound(freq, "triangle", 0.38, 0, 0.28);
        if (beatCount % 4 === 0) {
          playSound(freq * 1.5, "sine", 0.5, 0, 0.07);
        }
        beatCount = (beatCount + 1) % 8;
      }, stepTime * 1000);
    } else if (artist === "Queens of Reggae") {
      // Reggae Skank & Bass
      tempo = 72;
      const stepTime = 60 / tempo / 2;
      const bassPattern = [48.99, 0, 58.27, 65.41, 48.99, 0, 58.27, 0];
      this.intervalId = setInterval(() => {
        // Low Bass
        const bassFreq = bassPattern[beatCount % 8];
        if (bassFreq > 0) playSound(bassFreq, "sine", 0.28, 0, 0.65);
        // Offbeat Skank (beats 2 and 4)
        if (beatCount === 2 || beatCount === 6) {
          playSound(261.63, "triangle", 0.12, 0, 0.14); // C
          playSound(329.63, "triangle", 0.12, 0, 0.14); // E
          playSound(392.00, "triangle", 0.12, 0, 0.14); // G
        }
        beatCount = (beatCount + 1) % 8;
      }, stepTime * 1000);
    } else if (artist === "Mentados") {
      // Ska Fast Upbeat skank
      tempo = 145;
      const stepTime = 60 / tempo / 2;
      this.intervalId = setInterval(() => {
        // Kick on 1 and 3
        if (beatCount % 4 === 0) playSound(72, "sine", 0.14, 0, 0.45);
        // Snare on 2 and 4
        if (beatCount === 2 || beatCount === 6) playSound(220, "triangle", 0.07, 0, 0.22);
        // Fast offbeats
        if (beatCount % 2 === 1) {
          playSound(293.66, "triangle", 0.06, 0, 0.2); // D
          playSound(349.23, "triangle", 0.06, 0, 0.2); // F
          playSound(440.00, "triangle", 0.06, 0, 0.2); // A
        }
        beatCount = (beatCount + 1) % 8;
      }, stepTime * 1000);
    } else if (artist === "Un Rojo") {
      // Slow Roots Reggae Dub
      tempo = 68;
      const stepTime = 60 / tempo / 2;
      const dubBass = [38.89, 38.89, 0, 46.25, 51.91, 0, 46.25, 0];
      this.intervalId = setInterval(() => {
        const bassFreq = dubBass[beatCount % 8];
        if (bassFreq > 0) playSound(bassFreq, "sine", 0.38, 0, 0.7);
        // Bubble
        if (beatCount === 2 || beatCount === 6) {
          playSound(349.23, "triangle", 0.14, 0, 0.16);
          playSound(440.00, "triangle", 0.14, 0, 0.16);
        }
        beatCount = (beatCount + 1) % 8;
      }, stepTime * 1000);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
  }
}

export default function SemanaUPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  
  // Navigation & filtering
  const [activeTab, setActiveTab] = useState<"info" | "activities" | "artists" | "gallery" | "trivia">("info");
  const [selectedDay, setSelectedDay] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todos");
  const [galleryYearFilter, setGalleryYearFilter] = useState<string>("Todos");
  
  // Agenda & RSVP States
  const [savedActivities, setSavedActivities] = useState<string[]>([]);
  const [registeredActivities, setRegisteredActivities] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [activeTicket, setActiveTicket] = useState<Actividad | null>(null);
  
  // Photo Gallery Lightbox
  const [activeImage, setActiveImage] = useState<{ src: string; title: string; desc: string } | null>(null);

  // Simulated Music Player States
  const [playingArtist, setPlayingArtist] = useState<string | null>(null);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<UCRSynth | null>(null);

  // Trivia Quiz States
  const [currentTriviaStep, setCurrentTriviaStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // User Info from active session
  const userName = session?.user?.name || "Estudiante UCR";
  const userEmail = session?.user?.email || "comunidad@ucr.ac.cr";

  // Initialize Synth
  useEffect(() => {
    synthRef.current = new UCRSynth();
    return () => {
      if (synthRef.current) synthRef.current.stop();
    };
  }, []);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Load Saved data from LocalStorage
  useEffect(() => {
    const localAgenda = localStorage.getItem("semana_u_agenda");
    const localRSVP = localStorage.getItem("semana_u_rsvp");
    if (localAgenda) {
      try { setSavedActivities(JSON.parse(localAgenda)); } catch (e) {}
    }
    if (localRSVP) {
      try { setRegisteredActivities(JSON.parse(localRSVP)); } catch (e) {}
    }
  }, []);

  const toggleSaveActivity = (id: string) => {
    const updated = savedActivities.includes(id)
      ? savedActivities.filter((x) => x !== id)
      : [...savedActivities, id];
    setSavedActivities(updated);
    localStorage.setItem("semana_u_agenda", JSON.stringify(updated));
  };

  const handleRegisterRSVP = (act: Actividad) => {
    if (registeredActivities.includes(act.id)) {
      setActiveTicket(act);
    } else {
      const updated = [...registeredActivities, act.id];
      setRegisteredActivities(updated);
      localStorage.setItem("semana_u_rsvp", JSON.stringify(updated));
      setActiveTicket(act);
    }
  };

  const handleCancelRSVP = (id: string) => {
    const updated = registeredActivities.filter((x) => x !== id);
    setRegisteredActivities(updated);
    localStorage.setItem("semana_u_rsvp", JSON.stringify(updated));
    setActiveTicket(null);
  };

  // Real PDF Ticket Export function
  const downloadPDFTicket = async (act: Actividad) => {
    const element = document.getElementById(`ticket-card-content`);
    if (!element) return;
    try {
      setIsDownloadingPdf(true);
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;
      
      const canvas = await html2canvas(element, {
        scale: 2.5,
        backgroundColor: null,
        useCORS: true
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [90, 160]
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`boleto-semanau-${act.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF ticket:", error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Audio Synthesizer logic
  const handleTogglePlay = (artistName: string) => {
    if (!synthRef.current) return;

    if (playingArtist === artistName) {
      // Pause/Stop
      synthRef.current.stop();
      setPlayingArtist(null);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    } else {
      // Play new
      synthRef.current.stop();
      setPlayingArtist(artistName);
      setPlayerProgress(0);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);

      synthRef.current.start(artistName);
      
      progressTimerRef.current = setInterval(() => {
        setPlayerProgress((prev) => {
          if (prev >= 100) {
            if (synthRef.current) synthRef.current.stop();
            setPlayingArtist(null);
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            return 0;
          }
          return prev + 1; // Play for 10 seconds (100 ticks)
        });
      }, 100);
    }
  };

  // Trivia Data
  const triviaQuestions = [
    {
      question: "¿Cuál es el hito histórico que originó la celebración de la Semana U el 24 de abril?",
      options: [
        "La inauguración del Edificio de Registro",
        "Las manifestaciones estudiantiles contra ALCOA en 1970",
        "La declaración de autonomía universitaria",
        "El traslado definitivo a la Sede Rodrigo Facio"
      ],
      correctAnswer: 1,
      explanation: "El 24 de abril de 1970, miles de estudiantes de la UCR junto con sindicatos y comunidades se opusieron férreamente al contrato con la transnacional ALCOA, consolidando la lucha por la defensa ambiental y los recursos públicos."
    },
    {
      question: "¿En cuál emblemática actividad tradicional de la Semana U se juega fútbol en el fango vistiendo botas de caucho?",
      options: [
        "El Clásico de Pretiles",
        "El Torneo de Zootecnia en Botas de Hule",
        "La Copa Autonomía Universitaria",
        "El Derby de Derecho e Ingeniería"
      ],
      correctAnswer: 1,
      explanation: "El partido de fútbol en botas de hule es una de las tradiciones más alegres y lodosas, en la que participan estudiantes y profesores de la Escuela de Zootecnia y público general."
    },
    {
      question: "¿Quién es la legendaria cantautora guanacasteca que formará parte del lineup acústico de Semana U 2026?",
      options: [
        "Debi Nova",
        "Guadalupe Urbina",
        "MishCatt",
        "Isabella Castro"
      ],
      correctAnswer: 1,
      explanation: "Guadalupe Urbina, ícono de la música folclórica e identidad costarricense, se presentará el viernes 24 de abril a las 4:00 PM."
    }
  ];

  const handleTriviaAnswer = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
  };

  const submitTriviaAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    if (selectedAnswer === triviaQuestions[currentTriviaStep].correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const nextTriviaQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    if (currentTriviaStep < triviaQuestions.length - 1) {
      setCurrentTriviaStep((step) => step + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const restartTrivia = () => {
    setCurrentTriviaStep(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  // Actividades UCR 2026
  const actividades: Actividad[] = [
    {
      id: "act-1",
      titulo: "Tradicional Corral de Zootecnia",
      categoria: "cultural",
      hora: "09:00 AM - 04:00 PM",
      dia: "Lunes 20 de Abril",
      lugar: "Frente a la Facultad de Ciencias Agroalimentarias",
      descripcion: "Exhibición interactiva de animales de granja, quesería artesanal en vivo y degustación de productos lácteos frescos producidos por estudiantes de la UCR."
    },
    {
      id: "act-2",
      titulo: "Taller Abierto de Defensa Personal",
      categoria: "deportes",
      hora: "10:00 AM - 12:00 MD",
      dia: "Lunes 20 de Abril",
      lugar: "Gimnasio del Sector Deportivo UCR",
      descripcion: "Clase práctica de autodefensa básica, técnicas de evasión y manejo de situaciones complejas impartido por cinturones negros del equipo deportivo."
    },
    {
      id: "act-3",
      titulo: "Fútbol en Botas de Hule",
      categoria: "deportes",
      hora: "02:00 PM - 04:00 PM",
      dia: "Martes 21 de Abril",
      lugar: "Finca de Zootecnia (Área Lodosa)",
      descripcion: "El épico partido anual en campo de lodo. Estudiantes contra profesores en una carrera resbaladiza y divertida donde el calzado obligatorio son las botas de hule."
    },
    {
      id: "act-4",
      titulo: "Exposición de Acuarela en Pretiles",
      categoria: "cultural",
      hora: "01:00 PM - 05:00 PM",
      dia: "Miércoles 22 de Abril",
      lugar: "Pretiles frente a la Escuela de Bellas Artes",
      descripcion: "Taller interactivo abierto donde podrás plasmar tus ideas usando acuarelas con guía experta de pintores de la facultad. Incluye materiales gratuitos."
    },
    {
      id: "act-5",
      titulo: "Feria de Bio-Emprendimientos Estudiantiles",
      categoria: "academico",
      hora: "09:00 AM - 06:00 PM",
      dia: "Jueves 23 de Abril",
      lugar: "Pretiles de Ciencias Generales y Biología",
      descripcion: "Apoya el emprendimiento de tus compañeros. Más de 40 stands con productos naturales, cosmética orgánica, plantas y proyectos de base científico-tecnológica."
    },
    {
      id: "act-6",
      titulo: "Cineforo ALCOA 1970 y Memoria Histórica",
      categoria: "social",
      hora: "04:30 PM - 07:00 PM",
      dia: "Jueves 23 de Abril",
      lugar: "Auditorio de la Facultad de Ciencias Sociales",
      descripcion: "Una retrospectiva del movimiento que definió el compromiso social de la UCR. Cine foro seguido de una mesa redonda con líderes estudiantiles del ayer y de hoy."
    },
    {
      id: "act-7",
      titulo: "Encuentro de Gigantes: Derecho vs. Ingeniería",
      categoria: "deportes",
      hora: "11:00 AM - 01:00 PM",
      dia: "Viernes 24 de Abril",
      lugar: "Gimnasio Universitario Rodrigo Facio",
      descripcion: "El torneo deportivo más esperado del año. Apoya a tu facultad en este emocionante partido lleno de cánticos, batucadas e identidad universitaria."
    },
    {
      id: "act-8",
      titulo: "Festival Artístico y Concierto del Cierre",
      categoria: "cultural",
      hora: "02:00 PM - 10:00 PM",
      dia: "Viernes 24 de Abril",
      lugar: "Plaza de la Autonomía (Frente a Biblioteca Carlos Monge)",
      descripcion: "El cierre oficial con bandas en vivo, cimarronas, y el gran cartel artístico de música nacional e internacional. Reclama tu entrada digital gratuita aquí."
    }
  ];

  // Conciertos Lineup
  const artistas: Artista[] = [
    { hora: "02:40 PM", nombre: "Rialengo", genero: "Cumbia y Ritmos Tropicales", descripcion: "Fusión bailable que rescata la música popular de Costa Rica.", cancionMuestra: "Cumbia del Pretil", tarima: "Tarima Principal - Plaza de la Autonomía" },
    { hora: "04:00 PM", nombre: "Guadalupe Urbina", genero: "Trova y Folk Costarricense", descripcion: "Poesía acústica inspirada en la herencia folclórica y cantos de Guanacaste.", cancionMuestra: "Flor de Cacao", tarima: "Tarima Principal - Plaza de la Autonomía" },
    { hora: "05:20 PM", nombre: "Queens of Reggae", genero: "Reggae / Roots Femenino", descripcion: "Poderosas voces nacionales unidas para celebrar el reggae consciente.", cancionMuestra: "Lioness Rise", tarima: "Tarima Principal - Plaza de la Autonomía" },
    { hora: "06:40 PM", nombre: "Mentados", genero: "Ska / Rock Nacional", descripcion: "Clásicos enérgicos del ska nacional que pondrán a saltar a todo el campus.", cancionMuestra: "Irresponsable", tarima: "Tarima Principal - Plaza de la Autonomía" },
    { hora: "08:00 PM", nombre: "Un Rojo", genero: "Reggae Roots", descripcion: "Cierre estelar con el grupo referente del reggae en Centroamérica.", cancionMuestra: "Juntos En El Fuego", tarima: "Tarima Principal - Plaza de la Autonomía" }
  ];

  // Fotos de la Galería agrupadas por años
  const fotosGaleria = [
    // 2026
    { src: "/semana_u_concierto.png", title: "Conciertos de Clausura", desc: "Miles de estudiantes y exalumnos reunidos en la Plaza de la Autonomía durante el concierto estelar.", anio: 2026 },
    { src: "/semana_u_feria.png", title: "Feria de Emprendimiento", desc: "Espacios de bio-emprendimiento científico e iniciativas lideradas por estudiantes de la UCR.", anio: 2026 },
    { src: "/semana_u_deportes.png", title: "Fútbol en Botas de Hule", desc: "El tradicional y resbaladizo partido de lodo, ícono de diversión e identidad estudiantil.", anio: 2026 },
    // 2024
    { src: "/semana_u_cimarrona.png", title: "Cimarrona y Mascarada", desc: "El alegre recorrido de la cimarrona universitaria inundando de música folclórica cada facultad.", anio: 2024 },
    { src: "/semana_u_talleres.png", title: "Tardes de Arte y Acuarelas", desc: "Estudiantes relajándose y expresando su creatividad al aire libre bajo los árboles del campus.", anio: 2024 },
    { src: "/semana_u_comida.png", title: "Zona de Gastronomía", desc: "Food trucks y puestos de platillos tradicionales que alimentan el festival durante toda la semana.", anio: 2024 },
    // 2023
    { src: "/semana_u_teatro.png", title: "Teatro al Aire Libre", desc: "Presentaciones teatrales y comedia estudiantil realizadas en las áreas verdes del pretil.", anio: 2023 },
    { src: "/semana_u_danza.png", title: "Danza Folclórica", desc: "Presentación artística del grupo de danza de la UCR en la tarima cultural.", anio: 2023 },
    { src: "/semana_u_pasacalles.png", title: "Pasacalles y Comparsas", desc: "El gran desfile inaugural recorriendo el bulevar del campus con batucadas y banderas.", anio: 2023 }
  ];

  // Días para el selector del calendario
  const dias = ["Todos", "Lunes 20 de Abril", "Martes 21 de Abril", "Miércoles 22 de Abril", "Jueves 23 de Abril", "Viernes 24 de Abril"];

  // Filtrado de actividades
  const filteredActivities = actividades.filter((act) => {
    if (showSavedOnly && !savedActivities.includes(act.id)) return false;
    if (selectedDay !== "Todos" && act.dia !== selectedDay) return false;
    if (categoryFilter !== "Todos" && act.categoria !== categoryFilter) return false;
    
    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !act.titulo.toLowerCase().includes(searchLower) && !act.descripcion.toLowerCase().includes(searchLower) && !act.lugar.toLowerCase().includes(searchLower)) {
      return false;
    }
    return true;
  });

  return (
    <ParallaxBackground className="min-h-full p-4 md:p-8 text-slate-800 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BANNER PRINCIPAL / HERO */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-950 p-6 md:p-10 text-white shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-indigo-500/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-400 opacity-10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-4 text-center md:text-left max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-yellow-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-amber-300" />
                Celebración Histórica Universitaria
              </span>
              <AnimatedHeading as="h1" hoverColor="#F37021" className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Semana UCR 2026
              </AnimatedHeading>
              <p className="text-sm md:text-base text-slate-200/90 leading-relaxed font-medium">
                Únete a la fiesta estudiantil más icónica del país del <span className="font-bold text-yellow-300 underline underline-offset-4 decoration-amber-400">20 al 26 de abril de 2026</span>. Memoria histórica, música, deportes tradicionales y cultura en las sedes universitarias.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4 text-cyan-400" /> 20-26 de Abril</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-yellow-400" /> Sede Rodrigo Facio</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Eventos Gratuitos</span>
              </div>
            </div>
            
            {/* Widget Informativo Rápido */}
            <div className="w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col items-center justify-center text-center space-y-3 min-w-[240px]">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">¿Listos para Jugar?</p>
                <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-lg font-black text-lg">
                  3/3
                </div>
                <div>
                  <h3 className="font-bold text-sm">Trivia Histórica</h3>
                  <p className="text-[10px] text-slate-300">Pon a prueba tu conocimiento y gana medallas</p>
                </div>
                <Button
                  onClick={() => setActiveTab("trivia")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold w-full py-2 text-xs rounded-xl shadow-md border-none"
                >
                  Jugar Trivia
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL: DOS COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* COLUMNA IZQUIERDA: PESTAÑAS Y CONTENIDOS (TOMA 3 COLUMNAS) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* SELECTOR DE PESTAÑAS PREMIUM */}
            <div className="bg-white dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 p-2 rounded-2xl shadow-sm flex flex-wrap gap-1">
              {[
                { id: "info", label: "Inicio", icon: Info },
                { id: "activities", label: "Cronograma", icon: Calendar },
                { id: "artists", label: "Artistas & Conciertos", icon: Music },
                { id: "gallery", label: "Galería de Fotos", icon: ImageIcon },
                { id: "trivia", label: "Trivia de la U", icon: HelpCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id !== "activities") setShowSavedOnly(false);
                  }}
                  className={`flex-1 min-w-[90px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold transition-all relative ${
                    activeTab === tab.id
                      ? "bg-[#005da4] text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {/* CONTENIDO DE PESTAÑA CON ANIMACIÓN */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* 1. TAB: INFO */}
                {activeTab === "info" && (
                  <motion.div
                    key="info-tab"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Historia */}
                      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
                            <Flame className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Lucha Social y Autonomía</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">El Origen Histórico</p>
                          </div>
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          La Semana U no es solo diversión; es un tributo viviente a las masivas movilizaciones del <span className="font-bold text-slate-800 dark:text-slate-200">24 de abril de 1970</span>, cuando el estudiantado universitario se alzó contra el proyecto de ley minera <span className="font-semibold">ALCOA</span>. Esta gesta sentó las bases de la conciencia ambientalista y el compromiso social de la Universidad de Costa Rica para con el país.
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-850/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <Award className="w-8 h-8 text-amber-500 shrink-0" />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            \"La Universidad es parte activa de las luchas de su pueblo\". Un recordatorio anual de nuestra responsabilidad social.
                          </p>
                        </div>
                      </Card>

                      {/* Info general y accesibilidad */}
                      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-[#005da4] dark:text-sky-400">
                            <Info className="w-5 h-5" />
                          </div>
                          <div>
                            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Sedes & Logística</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">¿Cómo participar?</p>
                          </div>
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          El epicentro es la Sede Rodrigo Facio en San Pedro, sin embargo, cada recinto (Occidente, Atlántico, Guanacaste, etc.) organiza su propio programa. La entrada a los conciertos y ferias es 100% gratuita y exclusiva para la comunidad universitaria, exalumnos autorizados y público autorizado.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Parqueo restringido</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Puntos de reciclaje</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Seguridad comunitaria</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Áreas libres de humo</span>
                          </div>
                        </div>
                      </Card>

                    </div>

                    {/* Acceso Rápido al Lineup de Artistas Destacado */}
                    <Card className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none shadow-md overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300">
                            Show Estelar de Clausura
                          </span>
                          <h3 className="text-xl font-bold">Lineup de Conciertos · Viernes 24 de Abril</h3>
                          <p className="text-xs text-slate-300 max-w-xl">
                            Cinco agrupaciones nacionales darán el gran cierre en la Tarima de la Autonomía a partir de las 02:40 PM. ¡Disfruta de ska, reggae, trova y ritmos caribeños!
                          </p>
                        </div>
                        <Button
                          onClick={() => setActiveTab("artists")}
                          className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold px-5 py-2.5 rounded-xl border-none shadow-md flex items-center gap-1.5 shrink-0"
                        >
                          Ver Horarios Concierto
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* 2. TAB: CALENDARIO / CRONOGRAMA */}
                {activeTab === "activities" && (
                  <motion.div
                    key="activities-tab"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Panel de Filtros & Búsqueda */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl shadow-sm space-y-4">
                      
                      {/* Fila superior: Input de búsqueda y Filtro por Categorías */}
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Buscar actividades por título, lugar o palabra clave..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#005da4]/20 focus:border-[#005da4] outline-none"
                          />
                        </div>

                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="px-3 py-2 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-[#005da4]/20 focus:border-[#005da4] outline-none font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <option value="Todos">Todas las Categorías</option>
                          <option value="deportes">Deportes & Fango</option>
                          <option value="cultural">Cultura & Arte</option>
                          <option value="academico">Académico & Expo</option>
                          <option value="social">Social & Cineforo</option>
                        </select>
                      </div>

                      {/* Selector de días en formato de chips horizontales */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent">
                        {dias.map((day) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                              selectedDay === day
                                ? "bg-[#005da4] text-white shadow-sm"
                                : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {day === "Todos" ? "Todo el Calendario" : day.replace(" de Abril", "")}
                          </button>
                        ))}
                      </div>

                    </div>

                    {/* Lista de Actividades en cuadrícula */}
                    {filteredActivities.length === 0 ? (
                      <Card className="p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mt-4">No se encontraron actividades</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Prueba cambiando el día del selector, seleccionando otra categoría o limpiando la barra de búsqueda.
                        </p>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredActivities.map((act) => {
                          const isSaved = savedActivities.includes(act.id);
                          const isRegistered = registeredActivities.includes(act.id);
                          return (
                            <motion.div
                              key={act.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#005da4]" />
                                
                                <div className="flex items-start justify-between gap-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    act.categoria === "deportes" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" :
                                    act.categoria === "cultural" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400" :
                                    act.categoria === "academico" ? "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400" :
                                    "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
                                  }`}>
                                    {act.categoria}
                                  </span>

                                  {/* Botón de guardar estrella */}
                                  <button
                                    onClick={() => toggleSaveActivity(act.id)}
                                    className={`p-1.5 rounded-full transition-colors ${
                                      isSaved
                                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-500"
                                        : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400"
                                    }`}
                                    aria-label="Guardar actividad"
                                  >
                                    <Star className={`w-4 h-4 ${isSaved ? "fill-amber-500" : ""}`} />
                                  </button>
                                </div>

                                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base mt-2.5 group-hover:text-[#005da4] dark:group-hover:text-sky-400 transition-colors">
                                  {act.titulo}
                                </h3>

                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex-grow">
                                  {act.descripcion}
                                </p>

                                <div className="border-t border-slate-100 dark:border-slate-850 mt-4 pt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{act.dia} · <span className="font-semibold text-slate-700 dark:text-slate-300">{act.hora}</span></span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{act.lugar}</span>
                                  </div>
                                </div>

                                {/* Botón de inscripción RSVP interactivo */}
                                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-850/30 flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    {isRegistered && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                    {isRegistered ? "Inscrito con QR" : "Cupo Libre"}
                                  </span>
                                  
                                  <Button
                                    size="sm"
                                    onClick={() => handleRegisterRSVP(act)}
                                    className={`py-1.5 px-3 rounded-lg text-xs font-bold ${
                                      isRegistered
                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 flex items-center gap-1"
                                        : "bg-[#005da4] hover:bg-[#005da4]/95 text-white flex items-center gap-1"
                                    }`}
                                  >
                                    <Ticket className="w-3.5 h-3.5" />
                                    {isRegistered ? "Ver Boleto" : "Registrarse"}
                                  </Button>
                                </div>

                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 3. TAB: ARTISTAS Y REPRODUCTOR MUESTRA */}
                {activeTab === "artists" && (
                  <motion.div
                    key="artists-tab"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Music className="w-8 h-8 text-yellow-300 animate-bounce" />
                          <div>
                            <h2 className="text-xl font-black">Concierto de Cierre de Semana U</h2>
                            <p className="text-xs text-purple-200 mt-0.5">Viernes 24 de Abril · Sede Rodrigo Facio</p>
                          </div>
                        </div>
                        
                        {/* Reproductor Activo */}
                        {playingArtist && (
                          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-3 border border-white/10 max-w-sm w-full md:w-auto">
                            <Volume2 className="w-4 h-4 text-yellow-300 animate-pulse" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-slate-300 uppercase font-black tracking-wider leading-none">Generando síntesis</p>
                              <p className="text-xs font-bold truncate mt-0.5">{playingArtist}</p>
                            </div>
                            
                            {/* Visualizador de ondas */}
                            <div className="flex items-end gap-0.5 h-6 shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{
                                    height: [4, 20, 4]
                                  }}
                                  transition={{
                                    duration: 0.6 + i * 0.1,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                  className="w-1 bg-yellow-400 rounded-full"
                                />
                              ))}
                            </div>

                            <button
                              onClick={() => {
                                if (synthRef.current) synthRef.current.stop();
                                setPlayingArtist(null);
                                if (progressTimerRef.current) clearInterval(progressTimerRef.current);
                              }}
                              className="text-white/60 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline de Artistas */}
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 py-2">
                      {artistas.map((art, idx) => {
                        const isThisPlaying = playingArtist === art.nombre;
                        return (
                          <motion.div
                            key={art.nombre}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08, duration: 0.3 }}
                            className="relative pl-8 group"
                          >
                            {/* Dot del timeline */}
                            <div className={`absolute -left-2 top-2.5 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-950 transition-all ${
                              isThisPlaying
                                ? "bg-yellow-400 scale-125 shadow-md shadow-yellow-500/50"
                                : "bg-[#005da4] dark:bg-sky-400 group-hover:scale-110"
                            }`} />
                            
                            <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center hover:border-[#005da4]/30 dark:hover:border-sky-400/30 transition-colors relative overflow-hidden">
                              
                              {/* Barra de progreso */}
                              {isThisPlaying && (
                                <motion.div
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${playerProgress}%` }}
                                  transition={{ ease: "linear" }}
                                  className="absolute bottom-0 left-0 h-1 bg-yellow-400/45 pointer-events-none"
                                />
                              )}

                              <div className="shrink-0 flex items-center justify-center min-w-[90px]">
                                <span className="text-base font-black text-[#005da4] dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 px-3 py-1.5 rounded-xl border border-sky-100/50 dark:border-sky-900/50 block text-center w-full">
                                  {art.hora}
                                </span>
                              </div>

                              <div className="flex-1 space-y-1">
                                <div className="flex flex-wrap items-baseline gap-2">
                                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 group-hover:text-[#005da4] dark:group-hover:text-sky-400 transition-colors">
                                    {art.nombre}
                                  </h3>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">
                                    {art.genero}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                                  {art.descripcion}
                                </p>
                                <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{art.tarima}</span>
                                </div>
                              </div>

                              {/* Botón de reproducción */}
                              <div className="shrink-0 w-full md:w-auto pt-2 md:pt-0">
                                <Button
                                  size="sm"
                                  onClick={() => handleTogglePlay(art.nombre)}
                                  className={`w-full md:w-auto rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs ${
                                    isThisPlaying
                                      ? "bg-yellow-400 hover:bg-yellow-500 text-slate-900"
                                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200"
                                  }`}
                                >
                                  {isThisPlaying ? (
                                    <>
                                      <Pause className="w-3.5 h-3.5" /> Silenciar Beat
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3.5 h-3.5 animate-pulse" /> Sintetizar Beat
                                    </>
                                  )}
                                </Button>
                              </div>

                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 4. TAB: GALERÍA DE FOTOS AGRUPADAS POR AÑOS */}
                {activeTab === "gallery" && (
                  <motion.div
                    key="gallery-tab"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Selector de Años */}
                    <div className="flex items-center gap-2 pb-2 overflow-x-auto scrollbar-none">
                      {["Todos", "2026", "2024", "2023"].map((yr) => (
                        <button
                          key={yr}
                          onClick={() => setGalleryYearFilter(yr)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                            galleryYearFilter === yr
                              ? "bg-[#005da4] text-white shadow-sm"
                              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-600 dark:text-slate-350"
                          }`}
                        >
                          {yr === "Todos" ? "Todos los Años" : `Edición ${yr}`}
                        </button>
                      ))}
                    </div>

                    {/* Contenido agrupado u ordenado */}
                    <div className="space-y-8">
                      {["2026", "2024", "2023"]
                        .filter((yr) => galleryYearFilter === "Todos" || galleryYearFilter === yr)
                        .map((year) => {
                          const yearPhotos = fotosGaleria.filter((img) => img.anio === parseInt(year));
                          return (
                            <div key={year} className="space-y-4">
                              <h3 className="text-sm font-black text-[#005da4] dark:text-sky-400 border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Edición Universitaria {year}
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {yearPhotos.map((img) => (
                                  <motion.div
                                    key={img.src}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="cursor-pointer group rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-900"
                                    onClick={() => setActiveImage(img)}
                                  >
                                    <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                                      <img
                                        src={img.src}
                                        alt={img.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <span className="text-white text-xs font-bold flex items-center gap-1">
                                          Ampliar Imagen
                                          <ArrowRight className="w-3.5 h-3.5" />
                                        </span>
                                      </div>
                                    </div>
                                    <div className="p-4 space-y-1">
                                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{img.title}</h4>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{img.desc}</p>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </motion.div>
                )}

                {/* 5. TAB: TRIVIA INTERACTIVA */}
                {activeTab === "trivia" && (
                  <motion.div
                    key="trivia-tab"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-2xl mx-auto"
                  >
                    {!quizCompleted ? (
                      <Card className="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-2xl" />
                        
                        {/* Barra de progreso */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                            <span>PREGUNTA {currentTriviaStep + 1} DE {triviaQuestions.length}</span>
                            <span>Puntos: {score}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#005da4] dark:bg-sky-400 transition-all duration-300"
                              style={{ width: `${((currentTriviaStep + 1) / triviaQuestions.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Pregunta */}
                        <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                          {triviaQuestions[currentTriviaStep].question}
                        </h3>

                        {/* Opciones */}
                        <div className="space-y-3">
                          {triviaQuestions[currentTriviaStep].options.map((opt, idx) => {
                            const isSelected = selectedAnswer === idx;
                            const isCorrect = idx === triviaQuestions[currentTriviaStep].correctAnswer;
                            
                            let optClass = "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";
                            
                            if (isSelected) {
                              optClass = "border-[#005da4] bg-[#005da4]/5 text-[#005da4] dark:border-sky-400 dark:bg-sky-400/5 dark:text-sky-300";
                            }
                            if (isAnswerSubmitted) {
                              if (isCorrect) {
                                optClass = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold";
                              } else if (isSelected) {
                                optClass = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                              } else {
                                optClass = "opacity-50 border-slate-200 dark:border-slate-850";
                              }
                            }

                            return (
                              <button
                                key={opt}
                                disabled={isAnswerSubmitted}
                                onClick={() => handleTriviaAnswer(idx)}
                                className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm font-semibold transition-all flex items-center justify-between gap-3 ${optClass}`}
                              >
                                <span>{opt}</span>
                                {isAnswerSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-500" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explicación */}
                        {isAnswerSubmitted && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 text-xs md:text-sm space-y-1.5"
                          >
                            <p className="font-bold flex items-center gap-1 text-slate-800 dark:text-slate-200">
                              {selectedAnswer === triviaQuestions[currentTriviaStep].correctAnswer ? (
                                <span className="text-emerald-500 flex items-center gap-0.5">🎉 ¡Excelente! Respuesta correcta.</span>
                              ) : (
                                <span className="text-red-500">❌ Incorrecto.</span>
                              )}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                              {triviaQuestions[currentTriviaStep].explanation}
                            </p>
                          </motion.div>
                        )}

                        {/* Botón de acción */}
                        <div className="flex justify-end pt-2">
                          {!isAnswerSubmitted ? (
                            <Button
                              onClick={submitTriviaAnswer}
                              disabled={selectedAnswer === null}
                              className="bg-[#005da4] hover:bg-[#005da4]/90 text-white font-bold py-2.5 px-6 rounded-xl text-xs"
                            >
                              Enviar Respuesta
                            </Button>
                          ) : (
                            <Button
                              onClick={nextTriviaQuestion}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1"
                            >
                              <span>{currentTriviaStep === triviaQuestions.length - 1 ? "Ver Resultados" : "Siguiente"}</span>
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                      </Card>
                    ) : (
                      <Card className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto text-emerald-500 shadow-md">
                          <Award className="w-8 h-8" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100">¡Trivia Completada!</h3>
                          <p className="text-sm text-slate-400">
                            Obtuviste un puntaje de <span className="font-bold text-slate-700 dark:text-slate-200">{score} de {triviaQuestions.length}</span> respuestas correctas.
                          </p>
                        </div>

                        {/* Medalla Virtual */}
                        {score >= 2 ? (
                          <div className="max-w-xs mx-auto p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50 flex items-center gap-3">
                            <span className="text-2xl">🥇</span>
                            <div className="text-left">
                              <p className="text-xs font-black text-amber-800 dark:text-amber-400">Insignia: Sabio de la UCR</p>
                              <p className="text-[10px] text-amber-600/80 dark:text-amber-500/80">Has desbloqueado este logro histórico.</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">¡Sigue investigando y vuelve a intentarlo para conseguir tu insignia virtual de la UCR!</p>
                        )}

                        <div className="flex items-center justify-center gap-3 pt-2">
                          <Button
                            onClick={restartTrivia}
                            className="bg-[#005da4] hover:bg-[#005da4]/95 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Volver a Jugar
                          </Button>
                          
                          <Button
                            onClick={() => { setActiveTab("info"); restartTrivia(); }}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 font-bold px-6 py-2.5 rounded-xl text-xs"
                          >
                            Volver al Inicio
                          </Button>
                        </div>

                      </Card>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

          {/* COLUMNA DERECHA: SIDEBAR DE CONTENIDO */}
          <div className="space-y-6">
            
            {/* CARD: MI AGENDA DE ACTIVIDADES */}
            <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-sm md:text-base flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Mi Agenda ({savedActivities.length})
                </h3>
                {savedActivities.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveTab("activities");
                      setShowSavedOnly(!showSavedOnly);
                    }}
                    className={`text-xs font-bold transition-all px-2.5 py-1 rounded-lg ${
                      showSavedOnly
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                        : "text-[#005da4] hover:underline"
                    }`}
                  >
                    {showSavedOnly ? "Ver Todas" : "Filtrar"}
                  </button>
                )}
              </div>

              {savedActivities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No tienes actividades guardadas todavía.</p>
                  <p className="text-[10px] text-slate-400/80">Haz clic en la estrella en el Cronograma para guardar.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {actividades
                    .filter((a) => savedActivities.includes(a.id))
                    .map((act) => (
                      <div
                        key={act.id}
                        className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-850 rounded-xl relative group flex flex-col justify-between gap-1"
                      >
                        <button
                          onClick={() => toggleSaveActivity(act.id)}
                          className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Eliminar de mi agenda"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1 pr-3">{act.titulo}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {act.dia.split(" de ")[0]} · {act.hora.split(" - ")[0]}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </Card>

            {/* CARD: BOLETOS / RSVPS CONFIRMADOS */}
            <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-sm md:text-base flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-[#005da4] dark:text-sky-400" />
                  Mis Boletos ({registeredActivities.length})
                </h3>
              </div>

              {registeredActivities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                  <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No tienes reservaciones.</p>
                  <p className="text-[10px] text-slate-400/80">Regístrate en los talleres o conciertos principales en el Cronograma.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {actividades
                    .filter((a) => registeredActivities.includes(a.id))
                    .map((act) => (
                      <button
                        key={act.id}
                        onClick={() => setActiveTicket(act)}
                        className="w-full text-left p-3 border border-dashed border-sky-200 dark:border-sky-900/50 bg-sky-50/20 dark:bg-sky-950/10 rounded-xl flex items-center justify-between gap-3 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{act.titulo}</p>
                          <p className="text-[9px] text-[#005da4] dark:text-sky-400 font-semibold mt-0.5">{act.dia.split(" de ")[0]}</p>
                        </div>
                        <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 px-2 py-0.5 rounded border border-sky-200/50 dark:border-sky-800/30">
                          TICKET
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </Card>

            {/* CARD: ENLACES RÁPIDOS UCR */}
            <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-200">Contactos de Soporte U</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>FEUCR Central:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">2511-3850</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Vida Estudiantil (ViVE):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">vive@ucr.ac.cr</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Emergencias UCR:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">2511-6666</span>
                </div>
              </div>
            </Card>

          </div>

        </div>

      </div>

      {/* MODAL DETALLE DE BOLETO / QR DE REGISTRO */}
      <AnimatePresence>
        {activeTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-3xl p-6 shadow-xl relative overflow-hidden text-slate-800 dark:text-slate-100"
            >
              <button
                onClick={() => setActiveTicket(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/55 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Boleto Digital Confirmado</h3>
                  <p className="text-xs text-slate-400">Presenta este código en la entrada del evento</p>
                </div>

                {/* Tarjeta de Boleto Físico simulado */}
                <div id="ticket-card-content" className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-850 p-4 space-y-4 relative">
                  <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800" />
                  <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800" />
                  
                  <div className="text-left space-y-1.5 border-b border-dashed border-slate-200 dark:border-slate-700 pb-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Evento</p>
                    <p className="font-black text-sm text-slate-800 dark:text-slate-150 leading-tight">{activeTicket.titulo}</p>
                    
                    {/* User session integration */}
                    <div className="pt-2 text-[10px] space-y-0.5">
                      <p className="text-slate-500 font-bold">Titular: <span className="text-slate-800 dark:text-slate-200 font-normal">{userName}</span></p>
                      <p className="text-slate-500 font-bold">Correo: <span className="text-slate-850 dark:text-slate-350 font-normal">{userEmail}</span></p>
                    </div>

                    <p className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 mt-2">{activeTicket.dia}</p>
                    <p className="text-[10px] text-slate-500">{activeTicket.hora} · {activeTicket.lugar}</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center space-y-2 bg-white p-3 rounded-xl border border-slate-100">
                    <div className="w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                        <rect x="0" y="0" width="25" height="25" />
                        <rect x="5" y="5" width="15" height="15" fill="white" />
                        <rect x="75" y="0" width="25" height="25" />
                        <rect x="80" y="5" width="15" height="15" fill="white" />
                        <rect x="0" y="75" width="25" height="25" />
                        <rect x="5" y="80" width="15" height="15" fill="white" />
                        
                        <rect x="35" y="10" width="10" height="10" />
                        <rect x="50" y="20" width="15" height="10" />
                        <rect x="10" y="35" width="15" height="15" />
                        <rect x="40" y="40" width="20" height="20" />
                        <rect x="70" y="35" width="10" height="15" />
                        <rect x="35" y="70" width="15" height="15" />
                        <rect x="70" y="70" width="20" height="20" />
                        
                        <rect x="5" y="5" width="5" height="5" />
                        <rect x="80" y="5" width="5" height="5" />
                        <rect x="5" y="80" width="5" height="5" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">RSVP-{activeTicket.id.toUpperCase()}-2026</span>
                  </div>

                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() => downloadPDFTicket(activeTicket)}
                    disabled={isDownloadingPdf}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md border-none"
                  >
                    {isDownloadingPdf ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isDownloadingPdf ? "Generando..." : "Descargar PDF"}
                  </Button>
                  
                  <Button
                    onClick={() => handleCancelRSVP(activeTicket.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 justify-center"
                  >
                    Cancelar Registro
                  </Button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DETALLE DE IMAGEN DE GALERÍA (LIGHTBOX) */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/85 transition-colors z-10"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={activeImage.src}
                alt={activeImage.title}
                className="w-full h-auto max-h-[70vh] object-contain block mx-auto"
              />

              <div className="p-5 bg-slate-950/95 border-t border-white/10 text-white space-y-1">
                <h4 className="font-extrabold text-base text-yellow-300">{activeImage.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{activeImage.desc}</p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </ParallaxBackground>
  );
}
