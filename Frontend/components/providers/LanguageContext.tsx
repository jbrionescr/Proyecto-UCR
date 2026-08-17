"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "es" | "en" | "pt" | "fr";

export type TranslationKeys = 
  | "sidebar.dashboard"
  | "sidebar.directory"
  | "sidebar.directory.student"
  | "sidebar.directory.exalumno"
  | "sidebar.positions"
  | "sidebar.positions.student"
  | "sidebar.positions.exalumno"
  | "sidebar.donations"
  | "sidebar.donations.student"
  | "sidebar.donations.exalumno"
  | "sidebar.donations.history"
  | "sidebar.profile"
  | "sidebar.profile.student"
  | "sidebar.profile.exalumno"
  | "sidebar.cv"
  | "sidebar.editProfile"
  | "sidebar.connections"
  | "sidebar.matches"
  | "sidebar.retribuye"
  | "sidebar.talleres"
  | "sidebar.feed"
  | "sidebar.messages"
  | "sidebar.settings"
  | "sidebar.help"
  | "sidebar.startProject"
  | "sidebar.applications.student"
  | "sidebar.positions.own"
  | "sidebar.project.student"
  | "sidebar.project.new"
  | "sidebar.project.view"
  | "sidebar.admin"
  | "sidebar.semanaU"
  | "topbar.login"
  | "auth.tagline"
  | "auth.backToDashboard"
  | "auth.back"
  | "auth.hasAccount"
  | "auth.loginHere"
  | "auth.login.title"
  | "auth.login.subtitle"
  | "auth.login.emailLabel"
  | "auth.login.passwordLabel"
  | "auth.login.forgotPassword"
  | "auth.login.showPassword"
  | "auth.login.hidePassword"
  | "auth.login.submitting"
  | "auth.login.submit"
  | "auth.login.noAccount"
  | "auth.login.registerHere"
  | "auth.login.toastSuccessTitle"
  | "auth.login.toastSuccessDesc"
  | "auth.login.toastErrorTitle"
  | "auth.login.toastErrorUnverifiedSuffix"
  | "auth.login.toastGenericErrorTitle"
  | "auth.login.toastUnexpectedError"
  | "auth.login.errorCredentials"
  | "auth.login.errorConfiguration"
  | "auth.login.errorAccessDenied"
  | "auth.login.errorEmailNotVerified"
  | "auth.login.errorGeneric"
  | "auth.registroSelect.title"
  | "auth.registroSelect.subtitle"
  | "auth.registroSelect.studentTitle"
  | "auth.registroSelect.studentDesc"
  | "auth.registroSelect.alumniTitle"
  | "auth.registroSelect.alumniDesc"
  | "auth.registroSelect.cta"
  | "auth.registroEstudiante.title"
  | "auth.registroEstudiante.subtitle"
  | "auth.registroExalumno.title"
  | "auth.registroExalumno.subtitle"
  | "auth.forgotPassword.title"
  | "auth.forgotPassword.subtitle"
  | "auth.forgotPassword.emailLabel"
  | "auth.forgotPassword.submit"
  | "auth.forgotPassword.submitting"
  | "auth.forgotPassword.backToLogin"
  | "auth.forgotPassword.goToLogin"
  | "auth.forgotPassword.successTitle"
  | "auth.forgotPassword.successDescPrefix"
  | "auth.forgotPassword.successDescSuffix"
  | "auth.forgotPassword.stepsTitle"
  | "auth.forgotPassword.step1"
  | "auth.forgotPassword.step2"
  | "auth.forgotPassword.step3"
  | "auth.forgotPassword.toastSuccessTitle"
  | "footer.tagline"
  | "footer.brandSubtitle"
  | "footer.platform"
  | "footer.impact"
  | "footer.contact"
  | "footer.contactAddress"
  | "footer.rights"
  | "footer.madeWith"
  | "footer.madeWithSuffix"
  | "footer.link.jobs"
  | "footer.link.directory"
  | "footer.link.workshops"
  | "footer.link.feed"
  | "footer.link.donations"
  | "footer.link.giveback"
  | "footer.link.matches"
  | "footer.link.privacy"
  | "footer.link.legal"
  | "footer.link.help"
  | "a11y.title"
  | "a11y.largeText"
  | "a11y.highContrast"
  | "a11y.grayscale"
  | "a11y.highlightLinks"
  | "a11y.textToSpeech"
  | "a11y.reset"
  | "a11y.ttsEnabled"
  | "a11y.openPanel"
  | "a11y.closePanel"
  | "settings.title"
  | "settings.subtitle"
  | "settings.tab.general"
  | "settings.tab.terms"
  | "settings.tab.help"
  | "settings.lang.title"
  | "settings.lang.desc"
  | "settings.theme.title"
  | "settings.theme.desc"
  | "settings.theme.light"
  | "settings.theme.dark"
  | "settings.terms.title"
  | "settings.terms.desc"
  | "settings.help.faq.title"
  | "settings.help.faq.desc"
  | "settings.help.contact.title"
  | "settings.help.contact.desc"
  | "settings.help.contact.name"
  | "settings.help.contact.email"
  | "settings.help.contact.message"
  | "settings.help.contact.send"
  | "settings.help.contact.success"
  | "settings.help.contact.sending"
  | "dashboard.title.student"
  | "dashboard.title.exalumno"
  | "dashboard.subtitle.student"
  | "dashboard.subtitle.exalumno"
  | "dashboard.welcome.student"
  | "dashboard.welcome.exalumno"
  | "dashboard.welcome.title.student"
  | "dashboard.welcome.title.exalumno"
  | "dashboard.welcome.desc.student"
  | "dashboard.welcome.desc.exalumno"
  | "dashboard.welcome.btn.milestones"
  | "dashboard.welcome.btn.logbook"
  | "dashboard.welcome.btn.students"
  | "dashboard.welcome.btn.postJob"
  | "dashboard.status.title"
  | "dashboard.status.ontrack"
  | "dashboard.applications.title"
  | "dashboard.applications.viewall"
  | "dashboard.support.title"
  | "dashboard.support.funds"
  | "dashboard.support.mentorships"
  | "dashboard.support.available"
  | "dashboard.support.available.desc"
  | "dashboard.support.apply"
  | "dashboard.mentors.title"
  | "dashboard.mentors.ia"
  | "dashboard.mentors.coffee"
  | "dashboard.mentors.find"
  | "dashboard.mentors.find.desc"
  | "dashboard.mentors.explore"
  | "dashboard.impact.title"
  | "dashboard.impact.badge"
  | "dashboard.impact.total"
  | "dashboard.impact.sponsored"
  | "dashboard.applicants.title"
  | "dashboard.applicants.viewall"
  | "dashboard.projects.title"
  | "dashboard.projects.details"
  | "dashboard.students.title"
  | "dashboard.students.offer";

const translations: Record<Language, Record<TranslationKeys, string>> = {
  es: {
    "sidebar.dashboard": "Tablero",
    "sidebar.directory": "Directorio",
    "sidebar.directory.student": "Directorio Estudiantes",
    "sidebar.directory.exalumno": "Buscar Mentores",
    "sidebar.positions": "Posiciones",
    "sidebar.positions.student": "Bolsa de Empleo",
    "sidebar.positions.exalumno": "Publicar Empleo",
    "sidebar.donations": "Donaciones",
    "sidebar.donations.student": "Donaciones Recibidas",
    "sidebar.donations.exalumno": "Donar a Proyectos",
    "sidebar.donations.history": "Mis Donaciones",
    "sidebar.applications.student": "Mis Aplicaciones",
    "sidebar.positions.own": "Mis Posiciones",
    "sidebar.project.student": "Mi Proyecto",
    "sidebar.project.new": "Nuevo / Editar Proyecto",
    "sidebar.project.view": "Ver mi Proyecto",
    "sidebar.profile": "Perfil",
    "sidebar.profile.student": "Mi Perfil",
    "sidebar.profile.exalumno": "Mi Perfil",
    "sidebar.cv": "Optimizar CV",
    "sidebar.editProfile": "Editar Perfil",
    "sidebar.connections": "Mis Conexiones",
    "sidebar.matches": "Mis Matches",
    "sidebar.retribuye": "Retribuye a la UCR",
    "sidebar.talleres": "Talleres",
    "sidebar.feed": "Feed Comunidad",
    "sidebar.messages": "Mis Chats",
    "sidebar.settings": "Ajustes",
    "sidebar.help": "Ayuda",
    "sidebar.startProject": "Iniciar un Proyecto",
    "sidebar.admin": "Administración",
    "sidebar.semanaU": "Semana UCR",
    "topbar.login": "Iniciar Sesión",
    "auth.tagline": "Conectando el talento, fomentando el legado y construyendo el futuro de nuestra comunidad universitaria.",
    "auth.backToDashboard": "Volver al Dashboard",
    "auth.back": "Volver",
    "auth.hasAccount": "¿Ya tienes una cuenta?",
    "auth.loginHere": "Inicia sesión aquí",
    "auth.login.title": "Bienvenido de vuelta",
    "auth.login.subtitle": "Ingresa a la plataforma de Exalumnos UCR",
    "auth.login.emailLabel": "Correo Electrónico",
    "auth.login.passwordLabel": "Contraseña",
    "auth.login.forgotPassword": "¿Olvidaste tu contraseña?",
    "auth.login.showPassword": "Mostrar contraseña",
    "auth.login.hidePassword": "Ocultar contraseña",
    "auth.login.submitting": "Iniciando sesión...",
    "auth.login.submit": "Iniciar sesión",
    "auth.login.noAccount": "¿No tienes cuenta?",
    "auth.login.registerHere": "Regístrate aquí",
    "auth.login.toastSuccessTitle": "Inicio de sesión exitoso",
    "auth.login.toastSuccessDesc": "Redirigiendo a tu panel...",
    "auth.login.toastErrorTitle": "Error de autenticación",
    "auth.login.toastErrorUnverifiedSuffix": " (Correo no verificado)",
    "auth.login.toastGenericErrorTitle": "Error",
    "auth.login.toastUnexpectedError": "Ocurrió un error inesperado.",
    "auth.login.errorCredentials": "Correo o contraseña incorrectos.",
    "auth.login.errorConfiguration": "Error de configuración del servidor. Intenta de nuevo.",
    "auth.login.errorAccessDenied": "Acceso denegado. Tu cuenta puede estar pendiente de verificación.",
    "auth.login.errorEmailNotVerified": "Debes verificar tu correo antes de iniciar sesión.",
    "auth.login.errorGeneric": "Error al iniciar sesión.",
    "auth.registroSelect.title": "Únete a la Comunidad",
    "auth.registroSelect.subtitle": "Selecciona cómo deseas participar en la plataforma.",
    "auth.registroSelect.studentTitle": "Soy Estudiante",
    "auth.registroSelect.studentDesc": "Busco mentoría, pasantías o apoyo para mi proyecto de graduación.",
    "auth.registroSelect.alumniTitle": "Soy Exalumno",
    "auth.registroSelect.alumniDesc": "Deseo ofrecer mentoría, empleo o apoyar proyectos de nuevos talentos.",
    "auth.registroSelect.cta": "Registrarme",
    "auth.registroEstudiante.title": "Únete como Estudiante",
    "auth.registroEstudiante.subtitle": "Crea tu cuenta institucional para recibir mentoría, pasantías y apoyo en tu proyecto de graduación.",
    "auth.registroExalumno.title": "Registro de Exalumno",
    "auth.registroExalumno.subtitle": "Crea tu cuenta profesional para conectar con estudiantes y ofrecer oportunidades o mentoría.",
    "auth.forgotPassword.title": "Recuperar Contraseña",
    "auth.forgotPassword.subtitle": "Ingresa tu correo electrónico y te enviaremos una contraseña temporal para que puedas ingresar.",
    "auth.forgotPassword.emailLabel": "Correo electrónico",
    "auth.forgotPassword.submit": "Enviar contraseña temporal",
    "auth.forgotPassword.submitting": "Enviando...",
    "auth.forgotPassword.backToLogin": "Volver a inicio de sesión",
    "auth.forgotPassword.goToLogin": "Ir a inicio de sesión",
    "auth.forgotPassword.successTitle": "Revisa tu correo",
    "auth.forgotPassword.successDescPrefix": "Si existe una cuenta asociada a",
    "auth.forgotPassword.successDescSuffix": "recibirás una contraseña temporal para ingresar.",
    "auth.forgotPassword.stepsTitle": "Pasos a seguir:",
    "auth.forgotPassword.step1": "Abre el correo y copia la contraseña temporal.",
    "auth.forgotPassword.step2": "Inicia sesión con esa contraseña.",
    "auth.forgotPassword.step3": "Ve a Configuración → Cambiar contraseña para elegir una nueva.",
    "auth.forgotPassword.toastSuccessTitle": "Solicitud procesada",
    "footer.tagline": "La plataforma que conecta a estudiantes y exalumnos de la Universidad de Costa Rica para impulsar mentorías, empleo, donaciones y proyectos de graduación.",
    "footer.brandSubtitle": "Impacto y Legado",
    "footer.platform": "Plataforma",
    "footer.impact": "Impacto",
    "footer.contact": "Contacto",
    "footer.contactAddress": "San Pedro de Montes de Oca, San José, Costa Rica",
    "footer.rights": "Todos los derechos reservados.",
    "footer.madeWith": "Hecho con",
    "footer.madeWithSuffix": "para la comunidad UCR",
    "footer.link.jobs": "Bolsa de Empleo",
    "footer.link.directory": "Directorio de Exalumnos",
    "footer.link.workshops": "Talleres",
    "footer.link.feed": "Feed de la Comunidad",
    "footer.link.donations": "Donaciones",
    "footer.link.giveback": "Retribuye a la U",
    "footer.link.matches": "Mis Matches",
    "footer.link.privacy": "Política de Privacidad",
    "footer.link.legal": "Aviso Legal",
    "footer.link.help": "Ayuda",
    "a11y.title": "Accesibilidad",
    "a11y.largeText": "Texto Grande",
    "a11y.highContrast": "Alto Contraste",
    "a11y.grayscale": "Escala de Grises",
    "a11y.highlightLinks": "Resaltar Enlaces",
    "a11y.textToSpeech": "Lectura por Voz",
    "a11y.reset": "Restablecer",
    "a11y.ttsEnabled": "Lectura por voz activada.",
    "a11y.openPanel": "Abrir panel de accesibilidad",
    "a11y.closePanel": "Cerrar panel de accesibilidad",
    "settings.title": "Ajustes de la Plataforma",
    "settings.subtitle": "Configura tus preferencias de idioma, tema y accede al soporte legal y técnico.",
    "settings.tab.general": "General",
    "settings.tab.terms": "Términos y Condiciones",
    "settings.tab.help": "Ayuda y Soporte",
    "settings.lang.title": "Idioma de la interfaz",
    "settings.lang.desc": "Selecciona el idioma en el que deseas ver la plataforma.",
    "settings.theme.title": "Tema visual",
    "settings.theme.desc": "Elige entre la apariencia clara u oscura para la interfaz.",
    "settings.theme.light": "Modo Claro",
    "settings.theme.dark": "Modo Oscuro",
    "settings.terms.title": "Términos de Servicio y Privacidad",
    "settings.terms.desc": "Lee atentamente los términos y condiciones de uso de la Fundación Exalumnos U.",
    "settings.help.faq.title": "Preguntas Frecuentes (FAQs)",
    "settings.help.faq.desc": "Encuentra respuestas rápidas a las dudas comunes sobre la red.",
    "settings.help.contact.title": "Formulario de Contacto",
    "settings.help.contact.desc": "Si tienes algún inconveniente o sugerencia, envíanos un mensaje.",
    "settings.help.contact.name": "Nombre Completo",
    "settings.help.contact.email": "Correo Electrónico",
    "settings.help.contact.message": "Mensaje o Consulta",
    "settings.help.contact.send": "Enviar Mensaje",
    "settings.help.contact.success": "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.",
    "settings.help.contact.sending": "Enviando...",
    "dashboard.title.student": "Comunidad Exalumnos UCR",
    "dashboard.title.exalumno": "Portal de Mentoría y Filantropía",
    "dashboard.subtitle.student": "Conectando generaciones de la Universidad de Costa Rica",
    "dashboard.subtitle.exalumno": "Apoya a la comunidad estudiantil y comparte tu experiencia profesional",
    "dashboard.welcome.student": "Bienvenido de nuevo, Gabriel",
    "dashboard.welcome.exalumno": "Tablero del Exalumno",
    "dashboard.welcome.title.student": "Tu camino a la graduación está",
    "dashboard.welcome.title.exalumno": "Tu red está activa.",
    "dashboard.welcome.desc.student": "Sigue con el excelente trabajo en tu Proyecto de Graduación. Tienes 2 revisiones pendientes de tu mentor esta semana.",
    "dashboard.welcome.desc.exalumno": "Gracias por apoyar al talento de la UCR. Tienes 3 solicitudes de café virtual de estudiantes esperando tu respuesta esta semana.",
    "dashboard.welcome.btn.milestones": "Ver Hitos",
    "dashboard.welcome.btn.logbook": "Bitácora",
    "dashboard.welcome.btn.students": "Ver Estudiantes",
    "dashboard.welcome.btn.postJob": "Publicar Empleo",
    "dashboard.status.title": "Estado del Proyecto",
    "dashboard.status.ontrack": "EN CAMINO",
    "dashboard.applications.title": "Postulaciones Recientes",
    "dashboard.applications.viewall": "Ver Todas",
    "dashboard.support.title": "Apoyo y Recursos",
    "dashboard.support.funds": "Fondos de Beca",
    "dashboard.support.mentorships": "Mentorías Activas",
    "dashboard.support.available": "Beca de Carrera Disponible",
    "dashboard.support.available.desc": "Tu perfil califica para el fondo de Excelencia de Exalumnos.",
    "dashboard.support.apply": "Aplicar Ahora",
    "dashboard.mentors.title": "Mentores Recomendados",
    "dashboard.mentors.ia": "⚡ EMPAREJAMIENTO IA",
    "dashboard.mentors.coffee": "Solicitar Café Virtual",
    "dashboard.mentors.find": "Encontrar Más Mentores",
    "dashboard.mentors.find.desc": "Explora nuestra base de datos con más de 5,000 exalumnos verificados.",
    "dashboard.mentors.explore": "Explorar Directorio",
    "dashboard.impact.title": "Tu Impacto",
    "dashboard.impact.badge": "FILÁNTROPO UCR",
    "dashboard.impact.total": "Donación Total Confirmada",
    "dashboard.impact.sponsored": "Proyectos Patrocinados",
    "dashboard.applicants.title": "Postulantes a tus Vacantes",
    "dashboard.applicants.viewall": "Ver Todas",
    "dashboard.projects.title": "Proyectos Estudiantiles buscando Apoyo",
    "dashboard.projects.details": "Ver Detalles y Donar",
    "dashboard.students.title": "Estudiantes Sugeridos para Mentoría",
    "dashboard.students.offer": "Ofrecer Mentoría",
  },
  en: {
    "sidebar.dashboard": "Dashboard",
    "sidebar.directory": "Directory",
    "sidebar.directory.student": "Student Directory",
    "sidebar.directory.exalumno": "Find Mentors",
    "sidebar.positions": "Positions",
    "sidebar.positions.student": "Job Board",
    "sidebar.positions.exalumno": "Post a Job",
    "sidebar.donations": "Donations",
    "sidebar.donations.student": "Received Donations",
    "sidebar.donations.exalumno": "Donate to Projects",
    "sidebar.donations.history": "My Donations",
    "sidebar.applications.student": "My Applications",
    "sidebar.positions.own": "My Positions",
    "sidebar.project.student": "My Project",
    "sidebar.project.new": "New / Edit Project",
    "sidebar.project.view": "View my Project",
    "sidebar.profile": "Profile",
    "sidebar.profile.student": "My Profile",
    "sidebar.profile.exalumno": "My Profile",
    "sidebar.cv": "Optimize CV",
    "sidebar.editProfile": "Edit Profile",
    "sidebar.connections": "My Connections",
    "sidebar.matches": "My Matches",
    "sidebar.retribuye": "Give Back to UCR",
    "sidebar.talleres": "Workshops",
    "sidebar.feed": "Community Feed",
    "sidebar.messages": "My Chats",
    "sidebar.settings": "Settings",
    "sidebar.help": "Help",
    "sidebar.startProject": "Start a Project",
    "sidebar.admin": "Administration",
    "sidebar.semanaU": "UCR Week",
    "topbar.login": "Log In",
    "auth.tagline": "Connecting talent, fostering legacy, and building the future of our university community.",
    "auth.backToDashboard": "Back to Dashboard",
    "auth.back": "Back",
    "auth.hasAccount": "Already have an account?",
    "auth.loginHere": "Log in here",
    "auth.login.title": "Welcome back",
    "auth.login.subtitle": "Sign in to the UCR Alumni platform",
    "auth.login.emailLabel": "Email Address",
    "auth.login.passwordLabel": "Password",
    "auth.login.forgotPassword": "Forgot your password?",
    "auth.login.showPassword": "Show password",
    "auth.login.hidePassword": "Hide password",
    "auth.login.submitting": "Signing in...",
    "auth.login.submit": "Log In",
    "auth.login.noAccount": "Don't have an account?",
    "auth.login.registerHere": "Sign up here",
    "auth.login.toastSuccessTitle": "Successfully signed in",
    "auth.login.toastSuccessDesc": "Redirecting to your dashboard...",
    "auth.login.toastErrorTitle": "Authentication error",
    "auth.login.toastErrorUnverifiedSuffix": " (Email not verified)",
    "auth.login.toastGenericErrorTitle": "Error",
    "auth.login.toastUnexpectedError": "An unexpected error occurred.",
    "auth.login.errorCredentials": "Incorrect email or password.",
    "auth.login.errorConfiguration": "Server configuration error. Please try again.",
    "auth.login.errorAccessDenied": "Access denied. Your account may be pending verification.",
    "auth.login.errorEmailNotVerified": "You must verify your email before signing in.",
    "auth.login.errorGeneric": "Error signing in.",
    "auth.registroSelect.title": "Join the Community",
    "auth.registroSelect.subtitle": "Select how you want to participate in the platform.",
    "auth.registroSelect.studentTitle": "I'm a Student",
    "auth.registroSelect.studentDesc": "I'm looking for mentorship, internships, or support for my graduation project.",
    "auth.registroSelect.alumniTitle": "I'm an Alumnus",
    "auth.registroSelect.alumniDesc": "I want to offer mentorship, jobs, or support projects from new talent.",
    "auth.registroSelect.cta": "Sign Up",
    "auth.registroEstudiante.title": "Join as a Student",
    "auth.registroEstudiante.subtitle": "Create your institutional account to receive mentorship, internships, and support for your graduation project.",
    "auth.registroExalumno.title": "Alumni Registration",
    "auth.registroExalumno.subtitle": "Create your professional account to connect with students and offer opportunities or mentorship.",
    "auth.forgotPassword.title": "Recover Password",
    "auth.forgotPassword.subtitle": "Enter your email address and we'll send you a temporary password to sign in.",
    "auth.forgotPassword.emailLabel": "Email address",
    "auth.forgotPassword.submit": "Send temporary password",
    "auth.forgotPassword.submitting": "Sending...",
    "auth.forgotPassword.backToLogin": "Back to sign in",
    "auth.forgotPassword.goToLogin": "Go to sign in",
    "auth.forgotPassword.successTitle": "Check your email",
    "auth.forgotPassword.successDescPrefix": "If an account exists for",
    "auth.forgotPassword.successDescSuffix": "you will receive a temporary password to sign in.",
    "auth.forgotPassword.stepsTitle": "Next steps:",
    "auth.forgotPassword.step1": "Open the email and copy the temporary password.",
    "auth.forgotPassword.step2": "Sign in with that password.",
    "auth.forgotPassword.step3": "Go to Settings → Change Password to choose a new one.",
    "auth.forgotPassword.toastSuccessTitle": "Request processed",
    "footer.tagline": "The platform that connects students and alumni of the University of Costa Rica to boost mentorships, jobs, donations, and graduation projects.",
    "footer.brandSubtitle": "Impact and Legacy",
    "footer.platform": "Platform",
    "footer.impact": "Impact",
    "footer.contact": "Contact",
    "footer.contactAddress": "San Pedro de Montes de Oca, San José, Costa Rica",
    "footer.rights": "All rights reserved.",
    "footer.madeWith": "Made with",
    "footer.madeWithSuffix": "for the UCR community",
    "footer.link.jobs": "Job Board",
    "footer.link.directory": "Alumni Directory",
    "footer.link.workshops": "Workshops",
    "footer.link.feed": "Community Feed",
    "footer.link.donations": "Donations",
    "footer.link.giveback": "Give Back to UCR",
    "footer.link.matches": "My Matches",
    "footer.link.privacy": "Privacy Policy",
    "footer.link.legal": "Legal Notice",
    "footer.link.help": "Help",
    "a11y.title": "Accessibility",
    "a11y.largeText": "Large Text",
    "a11y.highContrast": "High Contrast",
    "a11y.grayscale": "Grayscale",
    "a11y.highlightLinks": "Highlight Links",
    "a11y.textToSpeech": "Text to Speech",
    "a11y.reset": "Reset",
    "a11y.ttsEnabled": "Text to speech enabled.",
    "a11y.openPanel": "Open accessibility panel",
    "a11y.closePanel": "Close accessibility panel",
    "settings.title": "Platform Settings",
    "settings.subtitle": "Configure your language and theme preferences, and access legal and technical support.",
    "settings.tab.general": "General",
    "settings.tab.terms": "Terms & Conditions",
    "settings.tab.help": "Help & Support",
    "settings.lang.title": "Interface Language",
    "settings.lang.desc": "Select the language you want to display the platform in.",
    "settings.theme.title": "Visual Theme",
    "settings.theme.desc": "Choose between light or dark appearance for the interface.",
    "settings.theme.light": "Light Mode",
    "settings.theme.dark": "Dark Mode",
    "settings.terms.title": "Terms of Service & Privacy Policy",
    "settings.terms.desc": "Please read carefully the terms and conditions of use for Fundación Exalumnos U.",
    "settings.help.faq.title": "Frequently Asked Questions (FAQs)",
    "settings.help.faq.desc": "Find quick answers to common questions about the network.",
    "settings.help.contact.title": "Contact Us",
    "settings.help.contact.desc": "If you have any issues or suggestions, please send us a message.",
    "settings.help.contact.name": "Full Name",
    "settings.help.contact.email": "Email Address",
    "settings.help.contact.message": "Message or Inquiry",
    "settings.help.contact.send": "Send Message",
    "settings.help.contact.success": "Message sent successfully! We will get in touch with you soon.",
    "settings.help.contact.sending": "Sending...",
    "dashboard.title.student": "UCR Alumni Community",
    "dashboard.title.exalumno": "Mentorship & Philanthropy Portal",
    "dashboard.subtitle.student": "Connecting generations of the University of Costa Rica",
    "dashboard.subtitle.exalumno": "Support the student community and share your professional experience",
    "dashboard.welcome.student": "Welcome back, Gabriel",
    "dashboard.welcome.exalumno": "Alumni Dashboard",
    "dashboard.welcome.title.student": "Your path to graduation is",
    "dashboard.welcome.title.exalumno": "Your network is active.",
    "dashboard.welcome.desc.student": "Keep up the excellent work on your Graduation Project. You have 2 pending reviews from your mentor this week.",
    "dashboard.welcome.desc.exalumno": "Thank you for supporting UCR talent. You have 3 virtual coffee requests from students waiting for your response this week.",
    "dashboard.welcome.btn.milestones": "View Milestones",
    "dashboard.welcome.btn.logbook": "Logbook",
    "dashboard.welcome.btn.students": "View Students",
    "dashboard.welcome.btn.postJob": "Post a Job",
    "dashboard.status.title": "Project Status",
    "dashboard.status.ontrack": "ON TRACK",
    "dashboard.applications.title": "Recent Applications",
    "dashboard.applications.viewall": "View All",
    "dashboard.support.title": "Support & Resources",
    "dashboard.support.funds": "Scholarship Funds",
    "dashboard.support.mentorships": "Active Mentorships",
    "dashboard.support.available": "Career Scholarship Available",
    "dashboard.support.available.desc": "Your profile qualifies for the Alumni Excellence Fund.",
    "dashboard.support.apply": "Apply Now",
    "dashboard.mentors.title": "Recommended Mentors",
    "dashboard.mentors.ia": "⚡ AI MATCHING",
    "dashboard.mentors.coffee": "Request Virtual Coffee",
    "dashboard.mentors.find": "Find More Mentors",
    "dashboard.mentors.find.desc": "Explore our database of over 5,000 verified alumni.",
    "dashboard.mentors.explore": "Explore Directory",
    "dashboard.impact.title": "Your Impact",
    "dashboard.impact.badge": "UCR PHILANTHROPIST",
    "dashboard.impact.total": "Total Cumulative Donation",
    "dashboard.impact.sponsored": "Sponsored Projects",
    "dashboard.applicants.title": "Applicants to your Openings",
    "dashboard.applicants.viewall": "View All",
    "dashboard.projects.title": "Student Projects Seeking Support",
    "dashboard.projects.details": "View Details and Donate",
    "dashboard.students.title": "Suggested Students for Mentoring",
    "dashboard.students.offer": "Offer Mentoring",
  },
  pt: {
    "sidebar.dashboard": "Painel",
    "sidebar.directory": "Diretório",
    "sidebar.directory.student": "Diretório de Estudantes",
    "sidebar.directory.exalumno": "Buscar Mentores",
    "sidebar.positions": "Vagas",
    "sidebar.positions.student": "Vagas de Emprego",
    "sidebar.positions.exalumno": "Publicar Vaga",
    "sidebar.donations": "Doações",
    "sidebar.donations.student": "Doações Recebidas",
    "sidebar.donations.exalumno": "Doar para Projetos",
    "sidebar.donations.history": "Minhas Doações",
    "sidebar.applications.student": "Minhas Candidaturas",
    "sidebar.positions.own": "Minhas Vagas",
    "sidebar.project.student": "Meu Projeto",
    "sidebar.project.new": "Novo / Editar Projeto",
    "sidebar.project.view": "Ver meu Projeto",
    "sidebar.profile": "Perfil",
    "sidebar.profile.student": "Meu Perfil",
    "sidebar.profile.exalumno": "Meu Perfil",
    "sidebar.cv": "Otimizar Currículo",
    "sidebar.editProfile": "Editar Perfil",
    "sidebar.connections": "Minhas Conexões",
    "sidebar.matches": "Meus Matches",
    "sidebar.retribuye": "Retribua à UCR",
    "sidebar.talleres": "Workshops",
    "sidebar.feed": "Feed da Comunidade",
    "sidebar.messages": "Meus Chats",
    "sidebar.settings": "Configurações",
    "sidebar.help": "Ajuda",
    "sidebar.startProject": "Iniciar um Projeto",
    "sidebar.admin": "Administração",
    "sidebar.semanaU": "Semana UCR",
    "topbar.login": "Entrar",
    "auth.tagline": "Conectando talentos, promovendo o legado e construindo o futuro da nossa comunidade universitária.",
    "auth.backToDashboard": "Voltar ao Painel",
    "auth.back": "Voltar",
    "auth.hasAccount": "Já tem uma conta?",
    "auth.loginHere": "Entre aqui",
    "auth.login.title": "Bem-vindo de volta",
    "auth.login.subtitle": "Acesse a plataforma de Ex-alunos UCR",
    "auth.login.emailLabel": "E-mail",
    "auth.login.passwordLabel": "Senha",
    "auth.login.forgotPassword": "Esqueceu sua senha?",
    "auth.login.showPassword": "Mostrar senha",
    "auth.login.hidePassword": "Ocultar senha",
    "auth.login.submitting": "Entrando...",
    "auth.login.submit": "Entrar",
    "auth.login.noAccount": "Não tem uma conta?",
    "auth.login.registerHere": "Cadastre-se aqui",
    "auth.login.toastSuccessTitle": "Login realizado com sucesso",
    "auth.login.toastSuccessDesc": "Redirecionando para o seu painel...",
    "auth.login.toastErrorTitle": "Erro de autenticação",
    "auth.login.toastErrorUnverifiedSuffix": " (E-mail não verificado)",
    "auth.login.toastGenericErrorTitle": "Erro",
    "auth.login.toastUnexpectedError": "Ocorreu um erro inesperado.",
    "auth.login.errorCredentials": "E-mail ou senha incorretos.",
    "auth.login.errorConfiguration": "Erro de configuração do servidor. Tente novamente.",
    "auth.login.errorAccessDenied": "Acesso negado. Sua conta pode estar pendente de verificação.",
    "auth.login.errorEmailNotVerified": "Você deve verificar seu e-mail antes de entrar.",
    "auth.login.errorGeneric": "Erro ao entrar.",
    "auth.registroSelect.title": "Junte-se à Comunidade",
    "auth.registroSelect.subtitle": "Selecione como deseja participar da plataforma.",
    "auth.registroSelect.studentTitle": "Sou Estudante",
    "auth.registroSelect.studentDesc": "Procuro mentoria, estágios ou apoio para meu projeto de graduação.",
    "auth.registroSelect.alumniTitle": "Sou Ex-aluno",
    "auth.registroSelect.alumniDesc": "Quero oferecer mentoria, empregos ou apoiar projetos de novos talentos.",
    "auth.registroSelect.cta": "Cadastrar-se",
    "auth.registroEstudiante.title": "Junte-se como Estudante",
    "auth.registroEstudiante.subtitle": "Crie sua conta institucional para receber mentoria, estágios e apoio para seu projeto de graduação.",
    "auth.registroExalumno.title": "Cadastro de Ex-aluno",
    "auth.registroExalumno.subtitle": "Crie sua conta profissional para se conectar com estudantes e oferecer oportunidades ou mentoria.",
    "auth.forgotPassword.title": "Recuperar Senha",
    "auth.forgotPassword.subtitle": "Digite seu e-mail e enviaremos uma senha temporária para você entrar.",
    "auth.forgotPassword.emailLabel": "E-mail",
    "auth.forgotPassword.submit": "Enviar senha temporária",
    "auth.forgotPassword.submitting": "Enviando...",
    "auth.forgotPassword.backToLogin": "Voltar ao login",
    "auth.forgotPassword.goToLogin": "Ir para o login",
    "auth.forgotPassword.successTitle": "Verifique seu e-mail",
    "auth.forgotPassword.successDescPrefix": "Se existir uma conta associada a",
    "auth.forgotPassword.successDescSuffix": "você receberá uma senha temporária para entrar.",
    "auth.forgotPassword.stepsTitle": "Próximos passos:",
    "auth.forgotPassword.step1": "Abra o e-mail e copie a senha temporária.",
    "auth.forgotPassword.step2": "Entre com essa senha.",
    "auth.forgotPassword.step3": "Vá em Configurações → Alterar senha para escolher uma nova.",
    "auth.forgotPassword.toastSuccessTitle": "Solicitação processada",
    "footer.tagline": "A plataforma que conecta estudantes e ex-alunos da Universidade de Costa Rica para impulsionar mentorias, empregos, doações e projetos de graduação.",
    "footer.brandSubtitle": "Impacto e Legado",
    "footer.platform": "Plataforma",
    "footer.impact": "Impacto",
    "footer.contact": "Contato",
    "footer.contactAddress": "San Pedro de Montes de Oca, San José, Costa Rica",
    "footer.rights": "Todos os direitos reservados.",
    "footer.madeWith": "Feito com",
    "footer.madeWithSuffix": "para a comunidade UCR",
    "footer.link.jobs": "Vagas de Emprego",
    "footer.link.directory": "Diretório de Ex-alunos",
    "footer.link.workshops": "Workshops",
    "footer.link.feed": "Feed da Comunidade",
    "footer.link.donations": "Doações",
    "footer.link.giveback": "Retribua à UCR",
    "footer.link.matches": "Meus Matches",
    "footer.link.privacy": "Política de Privacidade",
    "footer.link.legal": "Aviso Legal",
    "footer.link.help": "Ajuda",
    "a11y.title": "Acessibilidade",
    "a11y.largeText": "Texto Grande",
    "a11y.highContrast": "Alto Contraste",
    "a11y.grayscale": "Escala de Cinza",
    "a11y.highlightLinks": "Destacar Links",
    "a11y.textToSpeech": "Leitura em Voz Alta",
    "a11y.reset": "Restaurar",
    "a11y.ttsEnabled": "Leitura em voz alta ativada.",
    "a11y.openPanel": "Abrir painel de acessibilidade",
    "a11y.closePanel": "Fechar painel de acessibilidade",
    "settings.title": "Configurações da Plataforma",
    "settings.subtitle": "Configure suas preferências de idioma, tema e acesse o suporte legal e técnico.",
    "settings.tab.general": "Geral",
    "settings.tab.terms": "Termos e Condições",
    "settings.tab.help": "Ajuda e Suporte",
    "settings.lang.title": "Idioma da interface",
    "settings.lang.desc": "Selecione o idioma no qual deseja ver a plataforma.",
    "settings.theme.title": "Tema visual",
    "settings.theme.desc": "Escolha entre a aparência clara ou escura para a interface.",
    "settings.theme.light": "Modo Claro",
    "settings.theme.dark": "Modo Escuro",
    "settings.terms.title": "Termos de Serviço e Privacidade",
    "settings.terms.desc": "Leia atentamente os termos e condições de uso da Fundação Exalumnos U.",
    "settings.help.faq.title": "Perguntas Frequentes (FAQs)",
    "settings.help.faq.desc": "Encontre respostas rápidas para as dúvidas comuns sobre a rede.",
    "settings.help.contact.title": "Formulário de Contato",
    "settings.help.contact.desc": "Se você tiver algum problema ou sugestão, envie-nos uma mensagem.",
    "settings.help.contact.name": "Nome Completo",
    "settings.help.contact.email": "Endereço de E-mail",
    "settings.help.contact.message": "Mensagem ou Consulta",
    "settings.help.contact.send": "Enviar Mensagem",
    "settings.help.contact.success": "Mensagem enviada com sucesso! Entraremos em contato em breve.",
    "settings.help.contact.sending": "Enviando...",
    "dashboard.title.student": "Comunidade de Ex-alunos da UCR",
    "dashboard.title.exalumno": "Portal de Mentoria e Filantropia",
    "dashboard.subtitle.student": "Conectando gerações da Universidade de Costa Rica",
    "dashboard.subtitle.exalumno": "Apoie a comunidade estudantil e compartilhe sua experiência profissional",
    "dashboard.welcome.student": "Bem-vindo de volta, Gabriel",
    "dashboard.welcome.exalumno": "Painel do Ex-aluno",
    "dashboard.welcome.title.student": "Seu caminho para a graduação está",
    "dashboard.welcome.title.exalumno": "Sua rede está ativa.",
    "dashboard.welcome.desc.student": "Continue o excelente trabalho no seu Projeto de Graduação. Você tem 2 revisões pendentes do seu mentor esta semana.",
    "dashboard.welcome.desc.exalumno": "Obrigado por apoiar o talento da UCR. Você tem 3 solicitações de café virtual de estudantes aguardando sua resposta esta semana.",
    "dashboard.welcome.btn.milestones": "Ver Marcos",
    "dashboard.welcome.btn.logbook": "Diário de bordo",
    "dashboard.welcome.btn.students": "Ver Estudantes",
    "dashboard.welcome.btn.postJob": "Publicar Emprego",
    "dashboard.status.title": "Status do Projeto",
    "dashboard.status.ontrack": "EM ANDAMENTO",
    "dashboard.applications.title": "Candidaturas Recentes",
    "dashboard.applications.viewall": "Ver Todas",
    "dashboard.support.title": "Apoio e Recursos",
    "dashboard.support.funds": "Fundos de Bolsa",
    "dashboard.support.mentorships": "Mentorias Ativas",
    "dashboard.support.available": "Bolsa de Carreira Disponível",
    "dashboard.support.available.desc": "Seu perfil se qualifica para o fundo de Excelência de Ex-alunos.",
    "dashboard.support.apply": "Candidatar-se Agora",
    "dashboard.mentors.title": "Mentores Recomendados",
    "dashboard.mentors.ia": "⚡ COMBINAÇÃO IA",
    "dashboard.mentors.coffee": "Solicitar Café Virtual",
    "dashboard.mentors.find": "Encontrar Mais Mentores",
    "dashboard.mentors.find.desc": "Explore nosso banco de dados com mais de 5.000 ex-alunos verificados.",
    "dashboard.mentors.explore": "Explorar Diretório",
    "dashboard.impact.title": "Seu Impacto",
    "dashboard.impact.badge": "FILANTROPO UCR",
    "dashboard.impact.total": "Doação Total Acumulada",
    "dashboard.impact.sponsored": "Projetos Patrocinados",
    "dashboard.applicants.title": "Candidatos às suas Vagas",
    "dashboard.applicants.viewall": "Ver Todas",
    "dashboard.projects.title": "Projetos Estudantis buscando Apoio",
    "dashboard.projects.details": "Ver Detalhes e Doar",
    "dashboard.students.title": "Estudantes Sugeridos para Mentoria",
    "dashboard.students.offer": "Oferecer Mentoria",
  },
  fr: {
    "sidebar.dashboard": "Tableau de Bord",
    "sidebar.directory": "Annuaire",
    "sidebar.directory.student": "Annuaire des Étudiants",
    "sidebar.directory.exalumno": "Trouver des Mentors",
    "sidebar.positions": "Postes",
    "sidebar.positions.student": "Offres d'Emploi",
    "sidebar.positions.exalumno": "Publier un Emploi",
    "sidebar.donations": "Dons",
    "sidebar.donations.student": "Dons Reçus",
    "sidebar.donations.exalumno": "Faire un Don",
    "sidebar.donations.history": "Mes Dons",
    "sidebar.applications.student": "Mes Candidatures",
    "sidebar.positions.own": "Mes Postes",
    "sidebar.project.student": "Mon Projet",
    "sidebar.project.new": "Nouveau / Modifier Projet",
    "sidebar.project.view": "Voir mon Projet",
    "sidebar.profile": "Profil",
    "sidebar.profile.student": "Mon Profil",
    "sidebar.profile.exalumno": "Mon Profil",
    "sidebar.cv": "Optimiser le CV",
    "sidebar.editProfile": "Modifier le Profil",
    "sidebar.connections": "Mes Connexions",
    "sidebar.matches": "Mes Matches",
    "sidebar.retribuye": "Redonner à l'UCR",
    "sidebar.talleres": "Ateliers",
    "sidebar.feed": "Fil Communautaire",
    "sidebar.messages": "Mes Chats",
    "sidebar.settings": "Paramètres",
    "sidebar.help": "Aide",
    "sidebar.startProject": "Démarrer un Projet",
    "sidebar.admin": "Administration",
    "sidebar.semanaU": "Semaine UCR",
    "topbar.login": "Se Connecter",
    "auth.tagline": "Connecter les talents, favoriser l'héritage et construire l'avenir de notre communauté universitaire.",
    "auth.backToDashboard": "Retour au Tableau de Bord",
    "auth.back": "Retour",
    "auth.hasAccount": "Vous avez déjà un compte ?",
    "auth.loginHere": "Connectez-vous ici",
    "auth.login.title": "Bon retour",
    "auth.login.subtitle": "Connectez-vous à la plateforme des Anciens de l'UCR",
    "auth.login.emailLabel": "Adresse E-mail",
    "auth.login.passwordLabel": "Mot de Passe",
    "auth.login.forgotPassword": "Mot de passe oublié ?",
    "auth.login.showPassword": "Afficher le mot de passe",
    "auth.login.hidePassword": "Masquer le mot de passe",
    "auth.login.submitting": "Connexion en cours...",
    "auth.login.submit": "Se Connecter",
    "auth.login.noAccount": "Vous n'avez pas de compte ?",
    "auth.login.registerHere": "Inscrivez-vous ici",
    "auth.login.toastSuccessTitle": "Connexion réussie",
    "auth.login.toastSuccessDesc": "Redirection vers votre tableau de bord...",
    "auth.login.toastErrorTitle": "Erreur d'authentification",
    "auth.login.toastErrorUnverifiedSuffix": " (E-mail non vérifié)",
    "auth.login.toastGenericErrorTitle": "Erreur",
    "auth.login.toastUnexpectedError": "Une erreur inattendue s'est produite.",
    "auth.login.errorCredentials": "E-mail ou mot de passe incorrect.",
    "auth.login.errorConfiguration": "Erreur de configuration du serveur. Veuillez réessayer.",
    "auth.login.errorAccessDenied": "Accès refusé. Votre compte est peut-être en attente de vérification.",
    "auth.login.errorEmailNotVerified": "Vous devez vérifier votre e-mail avant de vous connecter.",
    "auth.login.errorGeneric": "Erreur de connexion.",
    "auth.registroSelect.title": "Rejoignez la Communauté",
    "auth.registroSelect.subtitle": "Sélectionnez comment vous souhaitez participer à la plateforme.",
    "auth.registroSelect.studentTitle": "Je suis Étudiant",
    "auth.registroSelect.studentDesc": "Je recherche du mentorat, des stages ou un soutien pour mon projet de fin d'études.",
    "auth.registroSelect.alumniTitle": "Je suis Ancien Élève",
    "auth.registroSelect.alumniDesc": "Je souhaite offrir du mentorat, des emplois ou soutenir des projets de nouveaux talents.",
    "auth.registroSelect.cta": "S'inscrire",
    "auth.registroEstudiante.title": "Rejoignez en tant qu'Étudiant",
    "auth.registroEstudiante.subtitle": "Créez votre compte institutionnel pour recevoir du mentorat, des stages et un soutien pour votre projet de fin d'études.",
    "auth.registroExalumno.title": "Inscription des Anciens Élèves",
    "auth.registroExalumno.subtitle": "Créez votre compte professionnel pour vous connecter avec des étudiants et offrir des opportunités ou du mentorat.",
    "auth.forgotPassword.title": "Récupérer le Mot de Passe",
    "auth.forgotPassword.subtitle": "Entrez votre adresse e-mail et nous vous enverrons un mot de passe temporaire pour vous connecter.",
    "auth.forgotPassword.emailLabel": "Adresse e-mail",
    "auth.forgotPassword.submit": "Envoyer un mot de passe temporaire",
    "auth.forgotPassword.submitting": "Envoi en cours...",
    "auth.forgotPassword.backToLogin": "Retour à la connexion",
    "auth.forgotPassword.goToLogin": "Aller à la connexion",
    "auth.forgotPassword.successTitle": "Vérifiez votre e-mail",
    "auth.forgotPassword.successDescPrefix": "Si un compte existe pour",
    "auth.forgotPassword.successDescSuffix": "vous recevrez un mot de passe temporaire pour vous connecter.",
    "auth.forgotPassword.stepsTitle": "Étapes suivantes :",
    "auth.forgotPassword.step1": "Ouvrez l'e-mail et copiez le mot de passe temporaire.",
    "auth.forgotPassword.step2": "Connectez-vous avec ce mot de passe.",
    "auth.forgotPassword.step3": "Allez dans Paramètres → Changer le mot de passe pour en choisir un nouveau.",
    "auth.forgotPassword.toastSuccessTitle": "Demande traitée",
    "footer.tagline": "La plateforme qui connecte étudiants et anciens élèves de l'Université du Costa Rica pour stimuler le mentorat, l'emploi, les dons et les projets de fin d'études.",
    "footer.brandSubtitle": "Impact et Héritage",
    "footer.platform": "Plateforme",
    "footer.impact": "Impact",
    "footer.contact": "Contact",
    "footer.contactAddress": "San Pedro de Montes de Oca, San José, Costa Rica",
    "footer.rights": "Tous droits réservés.",
    "footer.madeWith": "Fait avec",
    "footer.madeWithSuffix": "pour la communauté UCR",
    "footer.link.jobs": "Offres d'Emploi",
    "footer.link.directory": "Annuaire des Anciens",
    "footer.link.workshops": "Ateliers",
    "footer.link.feed": "Fil Communautaire",
    "footer.link.donations": "Dons",
    "footer.link.giveback": "Redonner à l'UCR",
    "footer.link.matches": "Mes Matches",
    "footer.link.privacy": "Politique de Confidentialité",
    "footer.link.legal": "Mentions Légales",
    "footer.link.help": "Aide",
    "a11y.title": "Accessibilité",
    "a11y.largeText": "Texte Agrandi",
    "a11y.highContrast": "Contraste Élevé",
    "a11y.grayscale": "Niveaux de Gris",
    "a11y.highlightLinks": "Surligner les Liens",
    "a11y.textToSpeech": "Synthèse Vocale",
    "a11y.reset": "Réinitialiser",
    "a11y.ttsEnabled": "Synthèse vocale activée.",
    "a11y.openPanel": "Ouvrir le panneau d'accessibilité",
    "a11y.closePanel": "Fermer le panneau d'accessibilité",
    "settings.title": "Paramètres de la Plateforme",
    "settings.subtitle": "Configurez vos préférences de langue, de thème et accédez à l'assistance juridique et technique.",
    "settings.tab.general": "Général",
    "settings.tab.terms": "Conditions d'Utilisation",
    "settings.tab.help": "Aide et Support",
    "settings.lang.title": "Langue de l'interface",
    "settings.lang.desc": "Sélectionnez la langue dans laquelle vous souhaitez afficher la plateforme.",
    "settings.theme.title": "Thème visuel",
    "settings.theme.desc": "Choisissez entre une apparence claire ou sombre pour l'interface.",
    "settings.theme.light": "Mode Clair",
    "settings.theme.dark": "Mode Sombre",
    "settings.terms.title": "Conditions de Service et Confidentialité",
    "settings.terms.desc": "Veuillez lire attentivement les conditions d'utilisation de la Fondation Exalumnos U.",
    "settings.help.faq.title": "Foire Aux Questions (FAQ)",
    "settings.help.faq.desc": "Trouvez des réponses rapides aux questions courantes sur le réseau.",
    "settings.help.contact.title": "Formulaire de Contact",
    "settings.help.contact.desc": "Si vous avez un problème ou une suggestion, envoyez-nous un message.",
    "settings.help.contact.name": "Nom Complet",
    "settings.help.contact.email": "Adresse E-mail",
    "settings.help.contact.message": "Message ou Demande",
    "settings.help.contact.send": "Envoyer le Message",
    "settings.help.contact.success": "Message envoyé avec succès ! Nous vous contacterons bientôt.",
    "settings.help.contact.sending": "Envoi en cours...",
    "dashboard.title.student": "Communauté des Anciens de l'UCR",
    "dashboard.title.exalumno": "Portail de Mentorat & Philantropie",
    "dashboard.subtitle.student": "Connecter les générations de l'Université du Costa Rica",
    "dashboard.subtitle.exalumno": "Soutenez la communauté étudiante et partagez votre expérience professionnelle",
    "dashboard.welcome.student": "Bon retour, Gabriel",
    "dashboard.welcome.exalumno": "Tableau de Bord des Anciens",
    "dashboard.welcome.title.student": "Votre chemin vers la remise des diplômes est",
    "dashboard.welcome.title.exalumno": "Votre réseau est actif.",
    "dashboard.welcome.desc.student": "Continuez votre excellent travail sur votre projet de fin d'études. Vous avez 2 révisions en attente de votre mentor cette semaine.",
    "dashboard.welcome.desc.exalumno": "Merci de soutenir les talents de l'UCR. Vous avez 3 demandes de café virtuel d'étudiants en attente de réponse cette semaine.",
    "dashboard.welcome.btn.milestones": "Voir les Jalons",
    "dashboard.welcome.btn.logbook": "Carnet de Bord",
    "dashboard.welcome.btn.students": "Voir les Étudiants",
    "dashboard.welcome.btn.postJob": "Publier un Emploi",
    "dashboard.status.title": "Statut du Projet",
    "dashboard.status.ontrack": "EN BONNE VOIE",
    "dashboard.applications.title": "Candidatures Récentes",
    "dashboard.applications.viewall": "Voir Tout",
    "dashboard.support.title": "Aide & Ressources",
    "dashboard.support.funds": "Fonds de Bourses",
    "dashboard.support.mentorships": "Mentorat Actif",
    "dashboard.support.available": "Bourse de Carrière Disponible",
    "dashboard.support.available.desc": "Votre profil est éligible au fonds d'excellence des anciens.",
    "dashboard.support.apply": "Postuler Maintenant",
    "dashboard.mentors.title": "Mentors Recommandés",
    "dashboard.mentors.ia": "⚡ MATCHING IA",
    "dashboard.mentors.coffee": "Demander un Café Virtuel",
    "dashboard.mentors.find": "Trouver Plus de Mentors",
    "dashboard.mentors.find.desc": "Explorez notre base de données de plus de 5 000 anciens élèves vérifiés.",
    "dashboard.mentors.explore": "Explorer l'Annuaire",
    "dashboard.impact.title": "Votre Impact",
    "dashboard.impact.badge": "PHILANTHROPE UCR",
    "dashboard.impact.total": "Don Total Cumulé",
    "dashboard.impact.sponsored": "Projets Parrainés",
    "dashboard.applicants.title": "Candidats à vos Offres",
    "dashboard.applicants.viewall": "Voir Tout",
    "dashboard.projects.title": "Projets Étudiants Cherchant un Soutien",
    "dashboard.projects.details": "Voir les Détails et Donner",
    "dashboard.students.title": "Étudiants Suggérés pour le Mentorat",
    "dashboard.students.offer": "Offrir du Mentorat",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language | null;
    if (savedLang === "es" || savedLang === "en" || savedLang === "pt" || savedLang === "fr") {
      setLanguageState(savedLang);
    } else {
      // Sin preferencia guardada: usar el idioma del navegador (como YouTube
      // detecta el país/idioma para el doblaje automático) en vez de forzar español.
      const browserLang = navigator.language?.slice(0, 2).toLowerCase();
      if (browserLang === "en" || browserLang === "pt" || browserLang === "fr") {
        setLanguageState(browserLang);
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: TranslationKeys): string => {
    // Antes de montar no se conoce el idioma detectado del navegador todavía,
    // así que se muestra español (el default del servidor) en vez de la clave cruda.
    if (!mounted) return translations.es[key] || key;
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
