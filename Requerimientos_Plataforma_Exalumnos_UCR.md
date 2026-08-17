# Documento de Requerimientos - Plataforma Digital Fundación Exalumnos UCR

Documento de Requerimientos 
Plataforma Digital — Fundación Exalumnos UCR 
 
Versión: 1.0 
Fecha: Mayo 2026 
Clasificación: Confidencial — Uso interno de la Fundación de Exalumnos UCR 
 


1. Descripción General del Proyecto 
1.1 Contexto y Propósito 
La Fundación de Exalumnos de la Universidad de Costa Rica (UCR) requiere una plataforma 
digital que conecte a egresados de la UCR con estudiantes activos que enfrentan dificultades 
para financiar sus proyectos de graduación o que poseen becas socioeconómicas de nivel 4 o 5.​
​
La misión de la Fundación es articular la voluntad de los exalumnos para que contribuyan como 
instrumento legítimo, autónomo, íntegro y activo en beneficio de la comunidad estudiantil y de 
la sociedad costarricense. 
1.2 Áreas Prioritarias de la Fundación 
1. Promover la generación de conocimiento 
2. Gestionar la recaudación de fondos (exalumnos y terceros) 
3. Apoyar la transferencia de cultura 
1.3 Objetivos de la Plataforma 
●​ Crear un directorio verificado de exalumnos dispuestos a contribuir 
●​ Crear un directorio de estudiantes con proyectos de graduación activos 
●​ Facilitar el matching inteligente entre ambas partes 
●​ Gestionar donaciones económicas (SINPE Móvil y transferencia bancaria) 
●​ Proveer herramientas administrativas para la Fundación 
1.4 Tipos de Contribución de Exalumnos 
Tipo 
Descripción 
Mentoría 
Tiempo y conocimiento para guiar un proyecto 
Empleo 
Oferta de trabajo formal mientras el estudiante 
estudia 
Pasantía 
Práctica profesional relacionada con el proyecto 
Proyecto empresarial 
Colaboración en proyecto de tesis/TFG con 
empresa 
Donación económica 
Aporte monetario directo al proyecto o fondo 
general 
 


2. Usuarios del Sistema 
2.1 Tipos de Usuario 
Rol 
Descripción 
Validación de identidad 
Estudiante 
Alumno activo UCR con proyecto 
de graduación 
Correo institucional @ucr.ac.cr 
(magic link) 
Exalumno 
Egresado de la UCR dispuesto a 
contribuir 
Autodeclaración + confirmación 
de correo personal 
Administrador 
Personal de la Fundación que 
gestiona la plataforma 
Cuenta creada manualmente 
por otro administrador 
2.2 Permisos por Rol 
Acción 
Estudiante 
Exalumno 
Admin 
Ver directorio de 
exalumnos 
✅ 
✅ 
✅ 
Ver directorio de 
estudiantes 
✅ 
✅ 
✅ 
Ver datos sensibles del 
estudiante (beca) 
Solo el propio 
Solo tras aceptar 
contacto 
✅ 
Iniciar contacto / match 
✅ 
✅ 
✅ 
Donar dinero 
❌ 
✅ 
❌ 
Confirmar donaciones 
❌ 
❌ 
✅ 
Ver panel de reportes 
❌ 
❌ 
✅ 
Gestionar usuarios 
❌ 
❌ 
✅ 
Reportar perfiles 
✅ 
✅ 
✅ 
 


3. Requerimientos Funcionales 
RF-01: Registro y Autenticación 
RF-01.1 Registro de Estudiante 
Prioridad: Alta 
El sistema debe permitir que un estudiante activo de la UCR cree una cuenta verificada. 
 
Campos del formulario: 
Campo 
Tipo 
Obligatorio 
Validación 
Correo electrónico 
Email 
Sí 
Debe terminar en 
@ucr.ac.cr 
Nombre completo 
Texto 
Sí 
Mín. 3 caracteres 
Contraseña 
Password 
Sí 
Mín. 8 caracteres, 1 
mayúscula, 1 número 
 
Flujo de verificación: 
1. El estudiante ingresa su correo @ucr.ac.cr 
2. El sistema envía un magic link a ese correo 
3. El estudiante hace clic → cuenta activada 
4. El sistema redirige al formulario de perfil completo 
5. Si el correo no termina en @ucr.ac.cr → error, no permite continuar 
 
Criterios de Aceptación: 
☐  Un correo estudiante@ucr.ac.cr puede registrarse exitosamente 
☐  Un correo persona@gmail.com es rechazado con mensaje claro 
☐  El magic link expira en 24 horas 
☐  Si no verifica en 24 horas, puede solicitar reenvío 
☐  No se puede acceder al directorio sin verificar el correo 
RF-01.2 Registro de Exalumno 
Prioridad: Alta 


El sistema debe permitir que un egresado de la UCR cree una cuenta por autodeclaración. 
 
Campos del formulario: 
Campo 
Tipo 
Obligatorio 
Validación 
Correo electrónico 
Email 
Sí 
Cualquier dominio 
válido 
Nombre completo 
Texto 
Sí 
Mín. 3 caracteres 
Contraseña 
Password 
Sí 
Mín. 8 caracteres, 1 
mayúscula, 1 número 
Carrera(s) cursada(s) en 
la UCR 
Selector múltiple 
Sí 
Al menos 1 carrera 
Escuela o Facultad 
Selector 
Sí 
Lista predefinida 
Año de graduación 
Número 
Sí 
Entre 1940 y año actual 
 
Criterios de Aceptación: 
☐  El exalumno puede registrarse con correo Gmail, Outlook u otro 
☐  El perfil queda en estado "pendiente" hasta confirmar el correo 
☐  Un perfil no confirmado NO aparece en el directorio 
☐  Si el exalumno aún tiene correo @ucr.ac.cr activo, el sistema le pregunta si ya se graduó 
para asignarlo al rol correcto 
RF-01.3 Autenticación General 
Prioridad: Alta 
☐  Login con correo y contraseña para todos los roles 
☐  Opción "Olvidé mi contraseña" con restablecimiento por correo 
☐  Sesión expira tras 30 días de inactividad 
☐  El sistema redirige a cada rol a su vista correspondiente tras el login 
 


RF-02: Perfil de Exalumno 
Prioridad: Alta 
Tras el registro, el exalumno debe completar su perfil para aparecer en el directorio. 
Sección 1 — Información Personal 
Campo 
Tipo 
Obligatorio 
Notas 
Foto de perfil 
Imagen 
No 
Máx. 2MB, 
JPG/PNG/WEBP 
País y ciudad de 
residencia 
Texto 
Sí 
 
URL de LinkedIn 
URL 
Sí 
Disuasivo anti-fraude 
Biografía profesional 
Texto 
Sí 
Máx. 500 caracteres 
Sección 2 — Historial Académico UCR 
Campo 
Tipo 
Obligatorio 
Carrera(s) en la UCR 
Selector múltiple 
Sí 
Escuela / Facultad 
Selector 
Sí 
Año de graduación 
Número 
Sí 
Sección 3 — Información Profesional Actual 
Campo 
Tipo 
Obligatorio 
Empresa o institución actual 
Texto 
Sí 
Cargo actual 
Texto 
Sí 
Sector / Industria 
Selector múltiple 
Sí 
Años de experiencia 
Número 
Sí 
Sección 4 — Áreas de Interés donde puede ayudar 
Campo 
Tipo 
Obligatorio 
Notas 
Áreas de interés 
Selector múltiple 
Sí (mín. 1) 
Del catálogo de 14 
áreas (ver sección 5) 
Nota para desarrolladores: Este campo va más allá de la carrera formal. Un ingeniero puede 
marcar "Salud" o "Emprendimiento" si tiene experiencia o deseo de apoyar en esas áreas. Permite 
matches interdisciplinarios. 
Sección 5 — Tipo de Apoyo Ofrecido 
Campo 
Tipo 
Obligatorio 
Notas 
¿Ofrece mentoría? 
Checkbox 
Sí 
 
Horas disponibles por 
mes 
Número 
Solo si ofrece mentoría 
1–40 horas 
¿Ofrece empleo? 
Checkbox 
Sí 
 
¿Ofrece pasantía? 
Checkbox 
Sí 
 
¿Ofrece colaboración 
en proyecto 
empresarial? 
Checkbox 
Sí 
 
¿Ofrece donación 
económica? 
Checkbox 
Sí 
 


Monto máximo de 
donación 
Número 
Solo si ofrece donación 
 
Moneda 
Selector 
Solo si ofrece donación 
CRC o USD 
 
Criterios de Aceptación: 
☐  Indicador de progreso visible; no aparece en directorio hasta perfil al 100% 
☐  El exalumno puede editar cualquier campo en cualquier momento 
☐  El monto de donación es visible solo para el propio exalumno y el admin 
☐  El perfil público muestra: foto, nombre, carrera UCR, sector, áreas de interés y tipos de 
apoyo 
 


RF-03: Perfil de Estudiante 
Prioridad: Alta 
Sección 1 — Información Académica 
Campo 
Tipo 
Obligatorio 
Notas 
Carné UCR 
Texto 
Sí 
Validar formato UCR 
Carrera 
Selector 
Sí 
Lista de carreras UCR 
Escuela / Facultad 
Selector 
Sí 
 
Sede UCR 
Selector 
Sí 
Central, Alajuela, 
Cartago, Limón, etc. 
Año de ingreso 
Número 
Sí 
 
Nivel académico 
Selector 
Sí 
Bachillerato / 
Licenciatura / Maestría 
/ Doctorado 
Promedio ponderado 
Decimal 
No 
Privado, para matching 
avanzado 
Sección 2 — Situación Socioeconómica 
Campo 
Tipo 
Obligatorio 
Notas 
Nivel de beca 
socioeconómica 
Selector 
Sí 
Sin beca / Nivel 1 / 2 / 3 
/ 4 / 5 
Nota de privacidad: El nivel de beca es información privada. Solo el propio estudiante y el admin la 
ven. Los exalumnos NO ven este dato hasta que el estudiante acepta el contacto. 
Sección 3 — Proyecto de Graduación 
Campo 
Tipo 
Obligatorio 
Notas 
Título del proyecto 
Texto 
Sí 
Máx. 200 caracteres 
Descripción del 
proyecto 
Texto largo 
Sí 
Máx. 1000 caracteres 
Área temática 
Selector 
Sí 
Lista predefinida UCR 
Tipo de proyecto 
Selector 
Sí 
TFG / Tesis / Práctica 
Dirigida / Seminario 
Porcentaje de avance 
Número 
Sí 
0–100 
Necesidades específicas 
Checkbox múltiple 
Sí 
Financiamiento / 
Mentoría técnica / 
Acceso a datos / 
Infraestructura / 
Validación empresarial 
/ Empleo paralelo 
Sección 4 — Áreas de Interés del Proyecto 
Campo 
Tipo 
Obligatorio 
Notas 
Áreas de interés 
Selector múltiple 
Sí (mín. 1) 
Del catálogo de 14 
áreas (ver sección 5) 
Nota para desarrolladores: El estudiante selecciona las áreas temáticas de su proyecto. Un 
biólogo puede marcar "Tecnología" si su proyecto usa bioinformática. Es el campo más importante 
para el matching interdisciplinario. 


Sección 5 — Tipo de Apoyo Buscado 
Campo 
Tipo 
Obligatorio 
¿Busca financiamiento 
económico? 
Checkbox 
Sí 
¿Busca mentoría técnica? 
Checkbox 
Sí 
¿Busca empleo mientras 
estudia? 
Checkbox 
Sí 
¿Busca pasantía relacionada? 
Checkbox 
Sí 
Sección 6 — Habilidades 
Campo 
Tipo 
Obligatorio 
Notas 
Habilidades técnicas 
Tags de texto libre 
No 
Ej: Python, AutoCAD, 
SPSS, diseño UX 
 
Criterios de Aceptación: 
☐  El perfil incompleto no aparece en el directorio 
☐  El nivel de beca NO es visible en el perfil público ni en el directorio 
☐  El nivel de beca SOLO se revela al exalumno cuando el estudiante acepta su solicitud de 
contacto 
☐  El estudiante puede marcar su perfil como "pausado" para no recibir contactos 
temporalmente 
☐  Si el avance del proyecto llega a 100%, el sistema pregunta si desea marcarlo como 
finalizado 
 


RF-04: Directorio de Exalumnos 
Prioridad: Alta 
Página con tarjetas de exalumnos, filtrable y buscable, accesible para usuarios autenticados. 
 
Filtros disponibles: 
Filtro 
Tipo 
Carrera UCR 
Selector múltiple 
Sector / Industria 
Selector múltiple 
Áreas de interés 
Selector múltiple 
Tipo de apoyo ofrecido 
Checkbox múltiple (Mentoría / Empleo / Pasantía 
/ Proyecto / Donación) 
País / Ciudad 
Texto libre 
 
Información visible en la tarjeta pública: 
●​ Foto de perfil 
●​ Nombre completo 
●​ Carrera(s) UCR 
●​ Cargo y empresa actual 
●​ Áreas de interés (tags) 
●​ Tipos de apoyo que ofrece (íconos/tags) 
●​ Botón "Conectar" 
 
Criterios de Aceptación: 
☐  El directorio es accesible solo para usuarios autenticados 
☐  Los filtros se combinan con AND lógico 
☐  Búsqueda por nombre con coincidencia parcial 
☐  Resultados ordenados por score de match si el usuario tiene perfil completo 
☐  Perfiles con visible_en_directorio = false no aparecen 
RF-05: Directorio de Estudiantes 
Prioridad: Alta 
Página con tarjetas de estudiantes y sus proyectos, filtrable. 
 


Filtros disponibles: 
Filtro 
Tipo 
Carrera 
Selector múltiple 
Área temática del proyecto 
Selector múltiple 
Áreas de interés 
Selector múltiple 
Tipo de apoyo buscado 
Checkbox múltiple 
Tipo de proyecto 
Selector 
Sede UCR 
Selector 
 
Información visible en tarjeta pública: 
●​ Foto de perfil (opcional) 
●​ Nombre completo 
●​ Carrera y sede 
●​ Título del proyecto 
●​ Área temática y tipo de proyecto 
●​ Porcentaje de avance (barra de progreso) 
●​ Áreas de interés (tags) 
●​ Tipo de apoyo buscado (tags) 
●​ Botón "Ofrecer apoyo" 
NUNCA visible: nivel de beca, promedio, situación socioeconómica 
 
Criterios de Aceptación: 
☐  La información socioeconómica nunca aparece en la tarjeta pública 
☐  Proyectos marcados como "finalizados" no aparecen en el directorio activo 
☐  Los filtros se pueden combinar libremente 
 


RF-06: Sistema de Matching 
Prioridad: Alta 
Algoritmo que sugiere conexiones relevantes entre exalumnos y estudiantes. 
 
Algoritmo de Puntuación (score 0–100): 
Criterio 
Puntos 
Lógica 
Misma carrera UCR 
30 pts 
Coincidencia exacta entre 
carrera del exalumno y del 
estudiante 
Áreas de interés en común 
30 pts 
Proporcional a la intersección 
(ej: 3/3 áreas = 30 pts, 1/3 = 10 
pts) 
Sector del exalumno ↔ área 
temática del proyecto 
20 pts 
Coincidencia entre sector 
profesional y área del proyecto 
Tipo de apoyo ofrecido ↔ 
buscado 
20 pts 
Al menos 1 tipo coincide = 20 
pts 
 
Flujo del Matching: 
1. Al completar el perfil, el sistema genera automáticamente una lista de matches 
2. Cada usuario ve /mis-matches con sugerencias ordenadas por score 
3. Cualquiera puede iniciar la conexión → la otra parte recibe notificación por email 
4. El receptor acepta o rechaza la conexión 
5. Al aceptar: ambas partes ven el contacto completo del otro (email) 
6. El admin recibe notificación de nuevo match activo 
 
Estados del Match: 
Estado 
Descripción 
sugerido 
Generado por el sistema, ninguna parte ha 
actuado 
contactado 
Una parte inició la conexión 
activo 
Ambas partes aceptaron 
cerrado 
El apoyo fue completado o cancelado 
 
Criterios de Aceptación: 


☐  Un exalumno de Ingeniería Civil con área "ambiente" tiene score alto con un estudiante 
de Química con proyecto ambiental (match interdisciplinario) 
☐  Matches con score 0 no aparecen en las sugerencias 
☐  El estudiante puede rechazar sin dar explicación 
☐  Un exalumno rechazado no puede volver a solicitar conexión al mismo estudiante 
☐  El admin ve todos los matches con filtros por estado, carrera y fecha 
 


RF-07: Donaciones 
Prioridad: Alta 
Módulo para que exalumnos realicen donaciones económicas a proyectos o al fondo general. 
 
Métodos de Pago Soportados: 
Método 
Flujo 
SINPE Móvil 
El exalumno transfiere al número de la Fundación 
y sube comprobante 
Transferencia bancaria (IBAN) 
El exalumno transfiere al IBAN y sube 
comprobante 
 
Flujo completo de donación: 
1. El exalumno elige: proyecto específico o fondo general 
2. Ingresa monto y moneda (CRC o USD) 
3. El sistema muestra el SINPE Móvil o IBAN con instrucciones claras 
4. El exalumno realiza la transferencia externamente 
5. Sube el comprobante (foto o PDF, máx. 5MB) 
6. El sistema confirma recepción y notifica al admin 
7. El admin revisa el comprobante y confirma o rechaza (SLA: 48 horas hábiles) 
8. Al confirmar: exalumno y estudiante reciben email de confirmación 
9. La donación queda registrada en el historial 
 
Campos del formulario de donación: 
Campo 
Tipo 
Obligatorio 
Proyecto destino 
Selector o "Fondo general" 
Sí 
Monto 
Número 
Sí 
Moneda 
Selector (CRC / USD) 
Sí 
Método de pago 
Selector (SINPE / Transferencia) 
Sí 
Fecha y hora de la transferencia 
Fecha/hora 
Sí 
Número de referencia 
Texto 
No 
Comprobante 
Upload de archivo 
Sí 
Mensaje para el estudiante 
Texto 
No — Máx. 300 chars 
 


Criterios de Aceptación: 
☐  Solo exalumnos pueden realizar donaciones 
☐  El comprobante es obligatorio para iniciar el proceso 
☐  El admin recibe notificación por email dentro de los 5 minutos 
☐  La donación permanece en estado "pendiente" hasta que el admin la confirme 
☐  Si pasan 48 horas sin confirmación, el sistema envía recordatorio al admin 
☐  El exalumno puede ver el historial de sus donaciones y el estado de cada una 
☐  Los comprobantes son visibles solo para el admin 
 


RF-08: Panel Administrativo 
Prioridad: Alta — Área privada para el personal de la Fundación. 
RF-08.1 Gestión de Matches — /admin/matches 
●​ Tabla con columnas: exalumno, estudiante, tipo de apoyo, score, estado, fecha 
●​ Filtros: carrera, tipo de apoyo, estado, rango de fechas 
●​ El admin puede actualizar el estado y agregar notas internas 
●​ Exportable a CSV 
●​ Matches "activos" por más de 6 meses generan alerta de seguimiento 
Criterios de Aceptación: 
☐  La tabla es exportable a CSV 
☐  El admin puede marcar un match como "cerrado exitosamente" o "cancelado" 
☐  Los matches activos por más de 6 meses generan una alerta visible 
RF-08.2 Gestión de Donaciones — /admin/donaciones 
●​ Cola de donaciones pendientes ordenada por antigüedad 
●​ Indicador rojo si lleva más de 24 horas pendiente 
●​ Visor de comprobante (imagen o PDF) en pantalla 
●​ Botones "Confirmar" / "Rechazar" (motivo obligatorio si se rechaza) 
●​ Cada acción queda auditada: quién, cuándo, con qué comprobante 
Criterios de Aceptación: 
☐  Al confirmar, el sistema envía emails al donante y al estudiante automáticamente 
☐  Al rechazar, el sistema envía email al donante con el motivo 
☐  Cada acción queda auditada: quién, cuándo, con qué comprobante 
☐  El historial muestra totales en CRC y USD por período seleccionado 
RF-08.3 Dashboard de Impacto — /admin/reportes 
Métrica 
Descripción 
Total donado 
Monto confirmado en CRC y USD, con filtro por 
período 
Proyectos apoyados 
Proyectos con al menos 1 donación o match activo 
Matches activos 
Conexiones en estado "activo" actualmente 
Matches cerrados exitosamente 
Histórico de conexiones completadas 
Exalumnos / Estudiantes activos 
Perfiles completos y visibles 
Distribución por carrera 
Gráfico: matches y donaciones por 
carrera/facultad 
Distribución por sede 
Gráfico: estudiantes por sede UCR 
Donantes nuevos vs. recurrentes 
Primera donación vs. donantes con historial 


Criterios de Aceptación: 
☐  Todos los gráficos tienen filtro por rango de fechas 
☐  El dashboard es exportable como PDF 
☐  Los datos se actualizan en tiempo real (o con máximo 5 minutos de retraso) 
 


RF-09: Seguridad y Gestión de Fraude 
Prioridad: Alta 
RF-09.1 Reporte de Perfiles 
●​ Cualquier usuario autenticado puede reportar un perfil (motivo predefinido + descripción 
opcional) 
●​ 3 reportes sobre el mismo perfil → suspensión automática temporal 
●​ El admin puede reactivar o eliminar permanentemente el perfil 
●​ El usuario reportado NO sabe quién lo reportó (anonimato garantizado) 
Criterios de Aceptación: 
☐  El botón "Reportar perfil" está visible en todos los perfiles públicos 
☐  El usuario reportado NO recibe notificación de quién lo reportó 
☐  El admin recibe email cuando un perfil es suspendido automáticamente 
☐  Un perfil suspendido no aparece en los directorios ni en los matches 
RF-09.2 Validaciones de Coherencia para Estudiantes 
●​ Año de ingreso + más de 8 años en UCR sin cambio de nivel → alerta al admin 
●​ Porcentaje de avance al 100% → el sistema pregunta si el proyecto finalizó 
●​ Carné con formato inválido → error de validación al guardar 
 


4. Requerimientos No Funcionales 
ID 
Requerimiento 
Criterio de Cumplimiento 
RNF-01 
Rendimiento 
Las páginas del directorio cargan 
en < 3 segundos con hasta 500 
perfiles 
RNF-02 
Responsividad 
La plataforma es totalmente 
funcional en móvil (mín. 375px 
de ancho) 
RNF-03 
Seguridad de datos 
Los datos sensibles (beca, 
comprobantes) con acceso 
restringido por rol 
RNF-04 
Disponibilidad 
La plataforma debe tener 99% 
de uptime mensual 
RNF-05 
Accesibilidad 
Cumplimiento mínimo WCAG 
2.1 nivel AA 
RNF-06 
Idioma 
La plataforma es enteramente 
en español 
RNF-07 
Privacidad 
Cumplimiento de la Ley 8968 de 
Protección de Datos Personales 
de Costa Rica 
RNF-08 
Auditoría 
Toda acción del admin sobre 
donaciones queda registrada 
con usuario, fecha y hora 
 


5. Catálogo de Áreas de Interés 
Base del matching interdisciplinario. Ambos perfiles (exalumno y estudiante) seleccionan de la 
misma lista de 14 áreas: 
 
# 
Código 
Etiqueta visible 
1 
tecnologia 
Tecnología e Innovación 
2 
salud 
Salud y Bienestar 
3 
educacion 
Educación y Pedagogía 
4 
ambiente 
Medio Ambiente y 
Sostenibilidad 
5 
arte_cultura 
Arte y Cultura 
6 
ciencias_sociales 
Ciencias Sociales 
7 
agro 
Agro y Alimentación 
8 
emprendimiento 
Emprendimiento y Negocios 
9 
ingenieria 
Ingeniería y Construcción 
10 
derecho 
Derecho y Política Pública 
11 
economia 
Economía y Finanzas 
12 
comunicacion 
Comunicación y Medios 
13 
turismo 
Turismo y Patrimonio 
14 
investigacion 
Investigación Científica 
 


6. Modelo de Datos (Esquema SQL) 
Base de datos PostgreSQL. A continuación el DDL completo para crear las tablas del sistema: 
 
-- Usuarios base​
CREATE TABLE users (​
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),​
  email TEXT UNIQUE NOT NULL,​
  nombre TEXT NOT NULL,​
  tipo TEXT CHECK (tipo IN ('estudiante', 'exalumno', 'admin')) NOT NULL,​
  email_verified BOOLEAN DEFAULT FALSE,​
  foto_url TEXT,​
  activo BOOLEAN DEFAULT TRUE,​
  reportes_recibidos INT DEFAULT 0,​
  created_at TIMESTAMP DEFAULT NOW()​
);​
​
-- Perfil de exalumno​
CREATE TABLE exalumnos (​
  user_id UUID PRIMARY KEY REFERENCES users(id),​
  carrera_ucr TEXT NOT NULL,​
  escuela_facultad TEXT NOT NULL,​
  anio_graduacion INT NOT NULL,​
  empresa_actual TEXT NOT NULL,​
  cargo_actual TEXT NOT NULL,​
  sector_industria TEXT[] NOT NULL,​
  areas_de_interes TEXT[] NOT NULL,​
  pais_ciudad TEXT NOT NULL,​
  anos_experiencia INT NOT NULL,​
  linkedin_url TEXT NOT NULL,​
  bio TEXT,​
  ofrece_mentoria BOOLEAN DEFAULT FALSE,​
  horas_mes_mentoria INT,​
  ofrece_empleo BOOLEAN DEFAULT FALSE,​
  ofrece_pasantia BOOLEAN DEFAULT FALSE,​
  ofrece_proyecto BOOLEAN DEFAULT FALSE,​
  ofrece_donacion_dinero BOOLEAN DEFAULT FALSE,​
  monto_maximo_donacion DECIMAL,​
  moneda_donacion TEXT CHECK (moneda_donacion IN ('CRC', 'USD')),​
  visible_en_directorio BOOLEAN DEFAULT TRUE,​
  perfil_completo BOOLEAN DEFAULT FALSE​
);​
​
-- Perfil de estudiante​
CREATE TABLE estudiantes (​
  user_id UUID PRIMARY KEY REFERENCES users(id),​
  carnet_ucr TEXT NOT NULL,​
  carrera TEXT NOT NULL,​
  escuela_facultad TEXT NOT NULL,​
  sede TEXT NOT NULL,​
  anio_ingreso INT NOT NULL,​
  nivel_academico TEXT CHECK (nivel_academico IN​


    ('bachillerato','licenciatura','maestria','doctorado')) NOT NULL,​
  promedio_ponderado DECIMAL,​
  beca_socioeconomica TEXT CHECK (beca_socioeconomica IN​
    ('ninguna','nivel1','nivel2','nivel3','nivel4','nivel5')),​
  proyecto_titulo TEXT NOT NULL,​
  proyecto_descripcion TEXT NOT NULL,​
  proyecto_area_tematica TEXT NOT NULL,​
  proyecto_tipo TEXT CHECK (proyecto_tipo IN​
    ('tfg','tesis','practica_dirigida','seminario')) NOT NULL,​
  proyecto_porcentaje_avance INT CHECK (proyecto_porcentaje_avance BETWEEN 0 
AND 100),​
  proyecto_necesidades TEXT[],​
  areas_de_interes TEXT[] NOT NULL,​
  habilidades TEXT[],​
  busca_financiamiento BOOLEAN DEFAULT FALSE,​
  busca_mentoria BOOLEAN DEFAULT FALSE,​
  busca_empleo BOOLEAN DEFAULT FALSE,​
  busca_pasantia BOOLEAN DEFAULT FALSE,​
  proyecto_activo BOOLEAN DEFAULT TRUE,​
  visible_en_directorio BOOLEAN DEFAULT TRUE,​
  perfil_completo BOOLEAN DEFAULT FALSE​
);​
​
-- Matches​
CREATE TABLE matches (​
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),​
  exalumno_id UUID REFERENCES users(id) NOT NULL,​
  estudiante_id UUID REFERENCES users(id) NOT NULL,​
  tipo_apoyo TEXT NOT NULL,​
  score_match INT CHECK (score_match BETWEEN 0 AND 100),​
  estado TEXT CHECK (estado IN​
    ('sugerido','contactado','activo','cerrado')) DEFAULT 'sugerido',​
  iniciado_por TEXT CHECK (iniciado_por IN 
('plataforma','exalumno','estudiante')),​
  resultado TEXT CHECK (resultado IN ('exitoso','cancelado','en_progreso')),​
  notas_admin TEXT,​
  created_at TIMESTAMP DEFAULT NOW(),​
  updated_at TIMESTAMP DEFAULT NOW()​
);​
​
-- Donaciones​
CREATE TABLE donaciones (​
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),​
  exalumno_id UUID REFERENCES users(id) NOT NULL,​
  proyecto_estudiante_id UUID REFERENCES users(id),​
  monto DECIMAL NOT NULL,​
  moneda TEXT CHECK (moneda IN ('CRC','USD')) NOT NULL,​
  metodo_pago TEXT CHECK (metodo_pago IN ('sinpe','transferencia_bancaria')) 
NOT NULL,​
  fecha_transferencia TIMESTAMP NOT NULL,​
  numero_referencia TEXT,​
  comprobante_url TEXT NOT NULL,​
  mensaje_estudiante TEXT,​
  estado TEXT CHECK (estado IN ('pendiente','confirmada','rechazada')) 
DEFAULT 'pendiente',​


  confirmado_por UUID REFERENCES users(id),​
  motivo_rechazo TEXT,​
  created_at TIMESTAMP DEFAULT NOW(),​
  updated_at TIMESTAMP DEFAULT NOW()​
);​
​
-- Reportes de fraude​
CREATE TABLE reportes_perfil (​
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),​
  reportado_por UUID REFERENCES users(id) NOT NULL,​
  perfil_reportado UUID REFERENCES users(id) NOT NULL,​
  motivo TEXT NOT NULL,​
  descripcion TEXT,​
  resuelto BOOLEAN DEFAULT FALSE,​
  created_at TIMESTAMP DEFAULT NOW()​
); 
 


7. Estructura de Rutas (Next.js) 
/                              → Landing page (información de la Fundación)​
/registro/exalumno             → Registro de exalumno​
/registro/estudiante           → Registro de estudiante + verificación de 
correo​
/verificar-email               → Pantalla "revisa tu correo"​
/login                         → Inicio de sesión​
/recuperar-contrasena          → Restablecimiento de contraseña​
​
/directorio/exalumnos          → Directorio público con filtros​
/directorio/estudiantes        → Directorio público con filtros​
/perfil/[id]                   → Perfil público de cualquier usuario​
​
/mi-perfil                     → Ver y editar mi perfil​
/mis-matches                   → Sugerencias y conexiones activas​
/donaciones                    → Formulario de donación (solo exalumnos)​
/mis-donaciones                → Historial de donaciones del exalumno​
​
/admin                         → Dashboard de administración​
/admin/matches                 → Gestión de matches​
/admin/donaciones              → Cola y gestión de donaciones​
/admin/reportes                → Dashboard de impacto y métricas​
/admin/usuarios                → Gestión de usuarios (suspender/activar)​
/admin/posiciones              → Gestión de posiciones (pausar/eliminar)​
​
/posiciones                    → Directorio de posiciones activas con filtros​
/posiciones/[id]               → Detalle de una posición​
/posiciones/nueva              → Publicar nueva posición (solo exalumnos)​
/mis-posiciones                → Posiciones publicadas por el exalumno​
/mis-posiciones/[id]/aplicantes → Gestión de aplicantes de una posición​
​
/mi-curriculum                 → Editor de CV del estudiante​
/mi-curriculum/adaptar/[id]    → Adaptar CV a posición con IA​
/mis-aplicaciones              → Historial de aplicaciones del estudiante 
 


8. Stack Tecnológico Definido 
Capa 
Tecnología 
Justificación 
Framework 
Next.js 14+ (App Router) 
SEO, Server Actions, fullstack en 
un solo proyecto 
Base de datos 
PostgreSQL vía Supabase 
Hosted, backup automático, Row 
Level Security nativo 
Autenticación 
NextAuth.js v5 
Magic links, sessions, fácil 
integración 
Email transaccional 
Resend 
API simple, buenas tasas de 
entrega, free tier generoso 
Almacenamiento 
Supabase Storage 
Fotos y comprobantes con 
acceso restringido por rol 
Estilos 
Tailwind CSS + shadcn/ui 
Componentes accesibles y 
consistentes, rápido de 
prototipar 
Deployment 
Vercel 
CI/CD automático desde GitHub, 
preview deployments 
IA de adaptación de CV 
Claude API (claude-sonnet-4-6) 
Motor de reescritura de CV con 
criterio de reclutador 
profesional. Streaming para 
feedback en tiempo real. 
Costo estimado 
~$25–50/mes + uso de API 
Supabase Pro + Vercel 
Hobby/Pro + Claude API por 
tokens 
 


9. Flujos de Usuario Clave (User Journeys) 
Journey 1 — Exalumno dona a un proyecto específico 
1. El exalumno entra a /directorio/estudiantes 
2. Filtra por carrera "Ingeniería Química" + área de interés "Ambiente" 
3. Encuentra el proyecto de Ana, estudiante con proyecto de biodegradables 
4. Hace clic en "Ofrecer apoyo" → modal con opciones de tipo de apoyo 
5. Selecciona "Donación económica" → redirige a /donaciones?proyecto=ana-id 
6. Llena el formulario, transfiere por SINPE, sube comprobante 
7. Recibe email: "Tu donación está siendo verificada" 
8. Admin confirma en menos de 24 horas 
9. Exalumno y Ana reciben email de confirmación con mensaje personalizado 
Journey 2 — Estudiante busca mentoría 
1. El estudiante completa su perfil con proyecto de IA en salud 
2. Entra a /mis-matches → ve 5 exalumnos sugeridos con score 
3. El primero: Ingeniero en Sistemas, trabaja en empresa de salud digital, ofrece mentoría — 
score 85/100 
4. Hace clic en "Solicitar conexión" 
5. El exalumno recibe email y acepta desde la plataforma 
6. Ambos reciben el correo del otro para coordinar directamente 
7. El admin ve el match como "activo" en su panel 
Journey 3 — Estudiante aplica a una pasantía con CV adaptado por IA 
1. Carlos (Ingeniería en Computación, proyecto de ML) entra a /posiciones 
2. Filtra por tipo "Pasantía" + habilidad "Python" + modalidad "Híbrido" 
3. Encuentra la posición: "Pasante de Ciencia de Datos" publicada por una exalumna de 
Estadística 
4. Lee la descripción → hace clic en "Adaptar mi CV a esta posición" 
5. La IA (Claude) analiza su CV y los requisitos del puesto en ~10 segundos 


6. Ve su CV actual vs. versión sugerida lado a lado: bullets reescritos con verbos de acción, 
keywords del puesto alineados 
7. Acepta 4 sugerencias, edita 1 y descarta 1 que no aplica a su experiencia 
8. Guarda la versión: "CV para Pasante de Ciencia de Datos" 
9. Hace clic en "Aplicar" → adjunta la versión adaptada + escribe mensaje breve 
10. La exalumna recibe notificación, abre el CV, lo selecciona 
11. Carlos recibe email de selección; los demás aplicantes reciben descarte anónimo 
 


RF-10: Publicación de Posiciones (Empleo y Pasantía) 
Prioridad: Alta 
Solo exalumnos verificados con perfil completo pueden publicar posiciones. Los campos son 
idénticos para empleo y pasantía — solo el campo "Tipo" los diferencia. 
Datos Básicos de la Posición 
Campo 
Tipo 
Obligatorio 
Notas 
Título del puesto 
Texto 
Sí 
Máx. 100 caracteres 
Tipo 
Selector 
Sí 
Empleo / Pasantía 
Modalidad 
Selector 
Sí 
Presencial / Remoto / 
Híbrido 
Jornada 
Selector 
Sí 
Tiempo completo / 
Medio tiempo / Por 
proyecto 
Lugar de trabajo 
Texto 
Sí 
Ciudad y país 
Empresa / Organización 
Texto 
Sí 
Puede diferir de la 
empresa actual del 
exalumno 
Sector 
Selector múltiple 
Sí 
Del catálogo de 
sectores existente 
Fecha límite de 
aplicación 
Fecha 
Sí 
Cierre automático al 
vencerse 
Habilidades requeridas 
Tags 
Sí (mín. 1) 
Usadas por la IA de CV 
y el algoritmo de 
matching 
Descripción del Rol 
Campo 
Tipo 
Obligatorio 
Notas 
Descripción general del 
puesto 
Texto largo 
Sí 
Máx. 1500 caracteres 
Responsabilidades 
principales 
Lista de bullets 
Sí 
Mín. 3, máx. 10 items 
Contexto del equipo / a 
quién reporta 
Texto 
No 
Máx. 300 caracteres 
Ciclo de Vida de una Posición 
Estado 
Descripción 
Disparador 
activa 
Visible en el directorio, recibe 
aplicaciones 
Al publicar 
cerrada 
Invisible en directorio, no recibe 
aplicaciones 
Automático al vencer fecha 
límite 
cubierta 
El exalumno seleccionó a un 
candidato 
Manual por el exalumno 
pausada 
El exalumno la oculta 
temporalmente 
Manual por el exalumno 
 


Criterios de Aceptación: 
☐  Solo exalumnos con perfil completo pueden publicar posiciones 
☐  Al vencer la fecha límite, la posición pasa automáticamente a "cerrada" y desaparece del 
directorio 
☐  Al marcar como "cubierta", todos los aplicantes pendientes reciben email anónimo de 
notificación 
☐  El exalumno puede editar una posición mientras está activa 
☐  El admin puede pausar o eliminar cualquier posición desde su panel 
☐  El directorio de posiciones tiene filtros por: tipo, modalidad, sector, habilidades y jornada 
 


RF-11: Curriculum Vitae del Estudiante 
Prioridad: Alta 
Editor de CV dentro de la plataforma basado en mejores prácticas de reclutadores profesionales. 
No usa plantillas visuales — el foco está en el contenido estructurado y optimizado para ATS 
(Applicant Tracking Systems). 
Nota para desarrolladores: El editor guía al estudiante a construir un CV con criterio de 
reclutador: logros cuantificables, verbos de acción, relevancia por contexto y optimización ATS. La IA 
actúa como un reclutador senior que revisa y mejora el contenido. 
Sección 1 — Información Académica 
Campo 
Tipo 
Obligatorio 
Universidad 
Texto (UCR por defecto) 
Sí 
Carrera 
Selector 
Sí 
Nivel académico actual 
Selector 
Sí 
Promedio ponderado 
Decimal 
No 
Año de ingreso 
Número 
Sí 
Cursos relevantes 
Tags 
No 
Proyecto de graduación (título y 
descripción breve) 
Texto 
No 
Sección 2 — Experiencia y Proyectos 
Cada entrada incluye: 
Campo 
Tipo 
Obligatorio 
Notas 
Tipo de experiencia 
Selector 
Sí 
Empleo / Voluntariado / 
Proyecto universitario / 
Asistencia / 
Investigación 
Título / Rol 
Texto 
Sí 
 
Organización / 
Contexto 
Texto 
Sí 
 
Fecha inicio 
Mes/Año 
Sí 
 
Fecha fin 
Mes/Año 
No 
NULL = posición actual 
Descripción en bullets 
Lista de texto 
Sí 
Mín. 1, máx. 5 bullets. 
Máx. 120 chars c/u. La 
IA sugiere reescritura. 
Sección 3 — Habilidades e Idiomas 
Campo 
Tipo 
Notas 
Habilidades técnicas 
Tags con nivel 
Básico / Intermedio / Avanzado 
Habilidades blandas 
Tags 
Lista abierta 
Idiomas 
Tags con nivel 
A1 → C2 (Marco Europeo de 
Referencia) 


Sección 4 — Certificaciones y Logros 
Campo 
Tipo 
Nombre de la certificación / logro 
Texto 
Institución / Fuente 
Texto 
Fecha 
Mes/Año 
URL de verificación 
URL (opcional) 
 
Criterios de Aceptación: 
☐  El CV se guarda automáticamente y forma parte del perfil del estudiante 
☐  El CV puede exportarse como PDF con formato limpio y profesional 
☐  Los bullets de experiencia tienen límite de 120 caracteres (enforced por el editor) 
☐  El editor muestra indicadores de completitud por sección 
☐  El CV NO es visible públicamente — solo se comparte al aplicar a una posición 
 


RF-12: IA de Adaptación de CV a Posiciones 
Prioridad: Alta 
Motor de IA: Claude API (claude-sonnet-4-6) actuando como reclutador profesional senior. 
Flujo de Adaptación 
1. El estudiante entra a la página de detalle de una posición en /posiciones/[id] 
2. Hace clic en "Adaptar mi CV a esta posición" 
3. La plataforma envía a Claude: el CV completo del estudiante + descripción del puesto + 
responsabilidades + habilidades requeridas 
4. Claude analiza y devuelve sugerencias de reescritura por sección (respuesta en streaming) 
5. El estudiante ve su CV actual vs. la versión sugerida en vista lado a lado 
6. Por cada bullet o párrafo puede: Aceptar / Editar y aceptar / Descartar 
7. Al finalizar, guarda la versión como "CV adaptado para: [título del puesto]" 
8. Al aplicar a esa posición, el sistema sugiere adjuntar el CV adaptado 
Criterio de Reclutador Profesional (Prompt de Sistema) 
El modelo recibe instrucciones para aplicar estas prácticas profesionales: 
●​ Verbos de acción al inicio de cada bullet (Desarrollé, Lideré, Optimicé, Implementé…) 
●​ Cuantificación de logros: cuando el CV no cuantifica, sugerir placeholders ("X% de mejora", 
"N usuarios") 
●​ Alineación de keywords con los términos exactos del puesto (optimización ATS) 
●​ Eliminación de relleno: quitar frases genéricas sin valor ("responsable de…", "apoyé en…") 
●​ Relevancia por contexto: priorizar experiencias pertinentes al puesto 
●​ Tono: profesional, directo, primera persona implícita (sin "yo") 
Versiones del CV 
Versión 
Descripción 
Base 
El CV original del estudiante, siempre editable 
Adaptada [puesto] 
CV ajustado para una posición específica — hasta 
10 versiones guardadas simultáneamente 
 
Criterios de Aceptación: 
☐  La IA nunca inventa experiencias ni habilidades que no existen en el CV original — solo 
reformula y reorganiza 


☐  Ninguna sugerencia se aplica sin confirmación explícita del estudiante 
☐  Si el CV no tiene información suficiente, la IA indica qué falta en lugar de inventar 
☐  Las versiones adaptadas se guardan por separado y no sobreescriben el CV base 
☐  El proceso de análisis tarda menos de 15 segundos (streaming de respuesta) 
☐  El estudiante puede tener hasta 10 versiones adaptadas guardadas simultáneamente 
 


RF-13: Proceso de Aplicación a Posiciones 
Prioridad: Alta 
Flujo de Aplicación (Estudiante) 
1. El estudiante encuentra una posición en /posiciones o en /mis-matches 
2. Hace clic en "Aplicar" 
3. El sistema muestra un modal: selector de CV (base o versión adaptada) + campo de 
mensaje de presentación (opcional, máx. 500 chars) 
4. El estudiante confirma la aplicación 
5. El exalumno recibe notificación por email y en la plataforma 
6. La aplicación aparece en el panel del exalumno 
Estados de una Aplicación 
Estado 
Visible para el estudiante 
Disparador 
enviada 
"Tu aplicación fue enviada" 
Al aplicar 
en_revision 
"El exalumno está revisando tu 
perfil" 
El exalumno abre la aplicación 
seleccionado 
"¡Fuiste seleccionado! Revisa tu 
correo" 
El exalumno lo elige 
descartado 
"La posición fue cubierta por 
otro candidato" 
El exalumno o cierre automático 
Panel de Gestión de Aplicaciones (Exalumno) 
En /mis-posiciones/[id]/aplicantes, el exalumno ve: 
●​ Lista de estudiantes que aplicaron (nombre, carrera, sede) 
●​ Score de compatibilidad calculado automáticamente por el sistema 
●​ Botón para ver el CV adjunto de cada aplicante 
●​ Botones de acción: "En revisión" / "Seleccionar" / "Descartar" 
●​ Al seleccionar: el sistema pregunta si desea cerrar la posición y notificar a los demás 
 
Criterios de Aceptación: 
☐  Un estudiante no puede aplicar dos veces a la misma posición 
☐  Los estudiantes no ven quién más aplicó ni cuántos aplicantes hay 
☐  El CV adjunto es visible solo para el exalumno que publicó la posición 
☐  Al seleccionar un candidato, los demás reciben email de descarte automático y anónimo 


☐  El estudiante puede retirar su aplicación mientras está en estado "enviada" 
 


Modelo de Datos — Nuevas Tablas (RF-10 a RF-13) 
Las siguientes tablas se agregan al esquema existente para soportar posiciones, CV, IA y 
aplicaciones: 
 
-- Posiciones de empleo y pasantía (mismos campos para ambos tipos)​
CREATE TABLE posiciones (​
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),​
  exalumno_id UUID REFERENCES users(id) NOT NULL,​
  tipo TEXT CHECK (tipo IN ('empleo', 'pasantia')) NOT NULL,​
  titulo TEXT NOT NULL,​
  modalidad TEXT CHECK (modalidad IN ('presencial','remoto','hibrido')) NOT 
NULL,​
  jornada TEXT CHECK (jornada IN​
    ('tiempo_completo','medio_tiempo','por_proyecto')) NOT NULL,​
  lugar TEXT NOT NULL,​
  empresa TEXT NOT NULL,​
  sector TEXT[] NOT NULL,​
  habilidades_requeridas TEXT[] NOT NULL,​
  descripcion_general TEXT NOT NULL,​
  responsabilidades TEXT[] NOT NULL,​
  contexto_equipo TEXT,​
  fecha_limite DATE NOT NULL,​
  estado TEXT CHECK (estado IN​
    ('activa','cerrada','cubierta','pausada')) DEFAULT 'activa',​
  created_at TIMESTAMP DEFAULT NOW(),​
  updated_at TIMESTAMP DEFAULT NOW()​
);​
​
-- CV base del estudiante​
CREATE TABLE curriculum (​
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),​
  estudiante_id UUID REFERENCES users(id) UNIQUE NOT NULL,​
  cursos_relevantes TEXT[],​
  proyecto_graduacion_resumen TEXT,​
  habilidades_tecnicas JSONB,    -- [{nombre, nivel}]​
  habilidades_blandas TEXT[],​
  idiomas JSONB,                 -- [{idioma, nivel}]​
  created_at TIMESTAMP DEFAULT NOW(),​
  updated_at TIMESTAMP DEFAULT NOW()​
);​
​
-- Entradas de experiencia del CV​
CREATE TABLE curriculum_experiencia (​
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),​
  curriculum_id UUID REFERENCES curriculum(id) NOT NULL,​
  tipo TEXT CHECK (tipo IN (​
    'empleo','voluntariado','proyecto_universitario',​
    'asistencia','investigacion')) NOT NULL,​
  titulo TEXT NOT NULL,​
  organizacion TEXT NOT NULL,​
  fecha_inicio TEXT NOT NULL,​


  fecha_fin TEXT,​
  bullets TEXT[] NOT NULL,       -- máx 5 items, máx 120 chars c/u​
  orden INT NOT NULL​
);​
​
-- Certificaciones y logros del CV​
CREATE TABLE curriculum_certificaciones (​
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),​
  curriculum_id UUID REFERENCES curriculum(id) NOT NULL,​
  nombre TEXT NOT NULL,​
  institucion TEXT NOT NULL,​
  fecha TEXT NOT NULL,​
  url_verificacion TEXT,​
  orden INT NOT NULL​
);​
​
-- Versiones de CV adaptadas por IA para posiciones específicas​
CREATE TABLE curriculum_versiones (​
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),​
  curriculum_id UUID REFERENCES curriculum(id) NOT NULL,​
  posicion_id UUID REFERENCES posiciones(id) NOT NULL,​
  nombre_version TEXT NOT NULL,​
  contenido_adaptado JSONB NOT NULL,  -- snapshot del CV con cambios 
aplicados​
  sugerencias_ia JSONB,               -- sugerencias originales de Claude​
  created_at TIMESTAMP DEFAULT NOW(),​
  UNIQUE (curriculum_id, posicion_id)​
);​
​
-- Aplicaciones de estudiantes a posiciones​
CREATE TABLE aplicaciones (​
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),​
  posicion_id UUID REFERENCES posiciones(id) NOT NULL,​
  estudiante_id UUID REFERENCES users(id) NOT NULL,​
  curriculum_version_id UUID REFERENCES curriculum_versiones(id),​
  mensaje_presentacion TEXT,​
  estado TEXT CHECK (estado IN (​
    'enviada','en_revision','seleccionado','descartado')) DEFAULT 'enviada',​
  created_at TIMESTAMP DEFAULT NOW(),​
  updated_at TIMESTAMP DEFAULT NOW(),​
  UNIQUE (posicion_id, estudiante_id)  -- evita doble aplicación​
); 
 


Matching Extendido — Posiciones incluidas 
Además del matching entre exalumnos y estudiantes (mentoría), el algoritmo ahora también 
conecta estudiantes con posiciones publicadas de empleo y pasantía. 
 
Score de Compatibilidad Estudiante ↔ Posición (0–100): 
Criterio 
Puntos 
Lógica 
Carrera del estudiante ↔ sector 
de la posición 
35 pts 
Coincidencia entre 
escuela/facultad y sector 
Habilidades del CV ↔ 
habilidades requeridas 
35 pts 
Intersección proporcional de 
habilidades 
Áreas de interés en común 
20 pts 
Misma lógica que el matching de 
mentoría 
Tipo de apoyo buscado coincide 
10 pts 
Estudiante busca empleo o 
pasantía según corresponda 
Las posiciones con score > 50 aparecen en /mis-matches del estudiante junto con los matches de 
mentoría. 
 


10. Criterios de Aceptación del MVP Completo 
Para considerar el prototipo funcional y listo para pruebas con usuarios reales, deben cumplirse 
todos los siguientes puntos: 
 
Módulos originales (RF-01 al RF-09): 
☐  Un estudiante puede registrarse con correo UCR, completar su perfil con proyecto y 
aparecer en el directorio 
☐  Un exalumno puede registrarse, completar su perfil y aparecer en el directorio 
☐  El algoritmo de matching sugiere conexiones con score visible 
☐  Ambas partes pueden iniciar y aceptar una conexión 
☐  Un exalumno puede completar el flujo de donación incluyendo subir comprobante 
☐  Un admin puede confirmar una donación y ambas partes reciben email 
☐  El admin puede ver el dashboard de impacto con métricas básicas 
☐  La plataforma funciona correctamente en móvil (Chrome y Safari) 
☐  Los datos sensibles del estudiante no son visibles en el directorio público 
☐  El sistema de reporte suspende automáticamente perfiles tras 3 denuncias 
 
Nuevos módulos (RF-10 al RF-13): 
☐  Un exalumno puede publicar una posición de empleo o pasantía con todos sus campos 
☐  La posición se cierra automáticamente al vencer la fecha límite 
☐  Un estudiante puede crear y editar su CV con las 4 secciones dentro de la plataforma 
☐  El CV puede exportarse como PDF desde la plataforma 
☐  La IA analiza el CV y la posición, y devuelve sugerencias de reescritura por sección 
☐  El estudiante puede aceptar, editar o descartar cada sugerencia individualmente 
☐  La IA nunca inventa información que no existe en el CV original 
☐  El estudiante puede aplicar adjuntando su CV base o versión adaptada 


☐  El exalumno gestiona aplicaciones desde su panel y puede seleccionar o descartar 
candidatos 
☐  Las posiciones aparecen en los matches del estudiante con score de compatibilidad visible 
