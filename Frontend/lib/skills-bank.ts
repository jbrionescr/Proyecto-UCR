// Banco predefinido de habilidades, habilidades blandas e idiomas

export interface SkillCategory {
  categoria: string;
  icon: string;
  skills: string[];
}

export const SKILLS_BANK: SkillCategory[] = [
  {
    categoria: "Programación & Desarrollo Web",
    icon: "💻",
    skills: [
      "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust",
      "PHP", "Ruby", "Swift", "Kotlin", "Dart", "HTML5", "CSS3", "Bash / Shell",
      "R", "MATLAB", "Scala", "Perl", "Elixir", "Haskell", "Lua",
    ],
  },
  {
    categoria: "Frameworks & Librerías",
    icon: "⚙️",
    skills: [
      "React", "Angular", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "Remix",
      "Node.js", "Express.js", "Nest.js", "Fastify",
      "Django", "FastAPI", "Flask", "Spring Boot", ".NET / ASP.NET", "Laravel",
      "Ruby on Rails", "Phoenix (Elixir)", "Gin (Go)",
      "React Native", "Flutter", "Ionic", "Expo",
      "TailwindCSS", "Bootstrap", "Material UI", "Chakra UI",
    ],
  },
  {
    categoria: "Bases de Datos",
    icon: "🗄️",
    skills: [
      "PostgreSQL", "MySQL", "SQLite", "Oracle Database", "SQL Server",
      "MongoDB", "Redis", "Cassandra", "DynamoDB", "Firestore",
      "Elasticsearch", "InfluxDB", "Neo4j",
      "Prisma ORM", "SQLAlchemy", "Hibernate", "TypeORM", "Sequelize",
      "Supabase", "PlanetScale",
    ],
  },
  {
    categoria: "Cloud & DevOps",
    icon: "☁️",
    skills: [
      "Amazon Web Services (AWS)", "Google Cloud Platform (GCP)", "Microsoft Azure",
      "Docker", "Kubernetes", "Helm", "Terraform", "Ansible", "Pulumi",
      "GitHub Actions", "GitLab CI/CD", "Jenkins", "CircleCI", "ArgoCD",
      "Linux", "Nginx", "Apache", "Cloudflare",
      "Prometheus", "Grafana", "Datadog", "New Relic",
    ],
  },
  {
    categoria: "Control de Versiones & Colaboración",
    icon: "🔀",
    skills: [
      "Git", "GitHub", "GitLab", "Bitbucket",
      "JIRA", "Confluence", "Notion", "Trello", "Asana", "Linear",
      "Slack", "Microsoft Teams", "Figma (colaboración)",
    ],
  },
  {
    categoria: "Inteligencia Artificial & Machine Learning",
    icon: "🤖",
    skills: [
      "Machine Learning (sklearn)", "Deep Learning (TensorFlow)", "PyTorch",
      "Hugging Face", "LangChain", "OpenAI API",
      "Procesamiento de Lenguaje Natural (NLP)", "Visión por Computadora",
      "Análisis de Datos con Python (pandas, numpy)", "Jupyter Notebooks",
      "MLflow", "Ray", "Apache Spark (MLlib)",
    ],
  },
  {
    categoria: "Datos & Analítica",
    icon: "📊",
    skills: [
      "SQL Analytics", "Excel Avanzado", "Google Sheets",
      "Power BI", "Tableau", "Looker", "Metabase", "Superset",
      "SPSS", "Stata", "SAS", "R (tidyverse, ggplot2)",
      "Apache Airflow", "dbt", "Snowflake", "BigQuery",
      "Google Analytics", "Mixpanel", "Amplitude",
    ],
  },
  {
    categoria: "Diseño & UX/UI",
    icon: "🎨",
    skills: [
      "Figma", "Adobe XD", "Sketch",
      "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Adobe After Effects",
      "Adobe Premiere Pro", "Final Cut Pro",
      "Canva", "Blender", "Cinema 4D",
      "Diseño de Interfaces (UI)", "Investigación de Usuarios (UX)",
      "Wireframing", "Prototipado", "Diseño de Sistemas",
      "AutoCAD (diseño)", "Rhino 3D",
    ],
  },
  {
    categoria: "Ingeniería & Manufactura",
    icon: "🔧",
    skills: [
      "AutoCAD", "SolidWorks", "CATIA", "Inventor", "Fusion 360",
      "Revit", "ArchiCAD", "Civil 3D",
      "MATLAB", "Simulink", "LabVIEW",
      "PLC (Siemens S7)", "PLC (Allen-Bradley)", "SCADA", "HMI",
      "Arena Simulation", "AnyLogic", "ProModel",
      "Minitab", "Lean Manufacturing", "Six Sigma", "5S",
      "SAP ERP", "Oracle ERP",
      "NEC / IEC Normativa", "Diseño Fotovoltaico", "ETAP",
    ],
  },
  {
    categoria: "Ciencias & Laboratorio",
    icon: "🔬",
    skills: [
      "PCR y técnicas moleculares", "Microscopía electrónica", "Espectroscopía",
      "ELISA", "Western Blot", "Cromatografía (HPLC, GC)",
      "Bioinformática (BLAST, FASTA)", "R (bioconductor)",
      "GIS / ArcGIS", "QGIS", "Remote Sensing",
      "NVivo", "ATLAS.ti", "Investigación cualitativa",
      "Epidemiología", "Bioestadística",
    ],
  },
  {
    categoria: "Gestión de Proyectos & Negocios",
    icon: "📋",
    skills: [
      "Scrum / Agile", "Kanban", "SAFe", "PRINCE2", "PMP",
      "OKRs", "KPIs", "Balanced Scorecard",
      "MS Project", "Monday.com", "ClickUp", "Basecamp",
      "Análisis de Requerimientos", "Gestión de Stakeholders",
      "Plan de Negocios", "Business Model Canvas",
      "Análisis FODA / PESTEL", "Gestión de Riesgos",
      "Procesos BPM", "BPMN 2.0",
    ],
  },
  {
    categoria: "Marketing & Comunicación Digital",
    icon: "📣",
    skills: [
      "Google Analytics 4", "Google Ads (SEM)", "Google Tag Manager",
      "Meta Ads (Facebook / Instagram)", "TikTok Ads", "LinkedIn Ads",
      "SEO Técnico", "SEO On-Page", "Ahrefs", "SEMrush", "Moz",
      "HubSpot", "Salesforce CRM", "Mailchimp", "Klaviyo",
      "Copywriting", "Content Marketing", "Email Marketing",
      "Community Management", "Influencer Marketing",
      "WordPress", "Shopify", "WooCommerce",
    ],
  },
  {
    categoria: "Finanzas & Contabilidad",
    icon: "💰",
    skills: [
      "Análisis Financiero", "Modelado Financiero (Excel)", "Valoración de Empresas",
      "Contabilidad NIIF / IFRS", "PCGA", "Auditoría",
      "SAP Finance", "QuickBooks", "Xero", "Oracle Financials",
      "Bloomberg Terminal", "Reuters Eikon",
      "Análisis de Riesgo", "Gestión de Portafolios", "Derivados financieros",
      "Impuestos / Tax Compliance", "Tesorería",
    ],
  },
  {
    categoria: "Ciberseguridad",
    icon: "🔐",
    skills: [
      "Ethical Hacking / Pentesting", "Análisis de Vulnerabilidades",
      "Kali Linux", "Metasploit", "Burp Suite", "Wireshark", "Nmap",
      "SIEM (Splunk, Wazuh)", "SOC Operations",
      "ISO 27001", "NIST Framework", "OWASP Top 10",
      "Criptografía aplicada", "Forense digital",
      "Zero Trust Architecture", "Cloud Security",
    ],
  },
  {
    categoria: "Idiomas Técnicos & Documentación",
    icon: "📝",
    skills: [
      "Redacción técnica", "Documentación de APIs (Swagger / OpenAPI)",
      "Markdown / LaTeX", "Manuales de usuario", "RFCs",
      "Presentaciones ejecutivas (PowerPoint / Keynote)",
      "Español técnico", "Inglés técnico",
    ],
  },
];

// ── Habilidades blandas ──────────────────────────────────────────────────────
export const SOFT_SKILLS_BANK: string[] = [
  "Liderazgo",
  "Trabajo en equipo",
  "Comunicación efectiva",
  "Comunicación escrita",
  "Presentaciones públicas",
  "Adaptabilidad",
  "Pensamiento crítico",
  "Resolución de problemas",
  "Creatividad e innovación",
  "Gestión del tiempo",
  "Empatía",
  "Inteligencia emocional",
  "Proactividad",
  "Atención al detalle",
  "Aprendizaje continuo",
  "Toma de decisiones",
  "Gestión del estrés",
  "Negociación",
  "Colaboración interdisciplinaria",
  "Pensamiento analítico",
  "Orientación a resultados",
  "Resiliencia",
  "Iniciativa propia",
  "Flexibilidad",
  "Pensamiento estratégico",
  "Motivación intrínseca",
  "Ética profesional",
  "Organización y planificación",
  "Responsabilidad",
  "Orientación al cliente",
  "Gestión del cambio",
  "Mentoría y coaching",
  "Escucha activa",
  "Asertividad",
  "Trabajo bajo presión",
  "Autonomía",
  "Orientación al aprendizaje",
  "Pensamiento sistémico",
  "Curiosidad intelectual",
  "Inclusión y diversidad",
];

// ── Idiomas ──────────────────────────────────────────────────────────────────
export const IDIOMAS_OPTS: string[] = [
  "Español",
  "Inglés",
  "Portugués",
  "Francés",
  "Alemán",
  "Italiano",
  "Mandarín",
  "Japonés",
  "Coreano",
  "Árabe",
  "Ruso",
  "Holandés",
];

export const NIVELES_IDIOMA: string[] = [
  "A1 – Básico",
  "A2 – Elemental",
  "B1 – Intermedio",
  "B2 – Intermedio Alto",
  "C1 – Avanzado",
  "C2 – Dominio / Nativo",
];

export const SKILL_LEVELS: string[] = ["Básico", "Intermedio", "Avanzado"];
