/**
 * Calcula la afinidad entre un estudiante y un exalumno.
 * Score máximo: 100 puntos
 * 
 * Criterios:
 * 1. Misma carrera UCR (30 pts)
 * 2. Áreas de interés en común (Hasta 30 pts)
 * 3. Sector profesional <-> área temática del proyecto (20 pts)
 * 4. Tipo de apoyo ofrecido <-> buscado (20 pts)
 */
exports.calcularAfinidad = (estudiante, exalumno) => {
  let score = 0;
  const reasons = [];

  // Los campos de estudiante y exalumno en backend pueden diferir un poco,
  // adaptamos a la estructura si es necesario (usamos los campos que mapeamos en Prisma/Sequelize)
  const estCarrera = (estudiante.carrera || estudiante.proyecto_tipo || '').toLowerCase().trim();
  const exaCarrera = (exalumno.carrera || exalumno.escuela_facultad || '').toLowerCase().trim();

  if (estCarrera && exaCarrera && estCarrera === exaCarrera) {
    score += 30;
    reasons.push("Carrera compartida");
  }

  // 2. Áreas de interés en común (Hasta 30 puntos)
  const estArea = (estudiante.area_proyecto || estudiante.proyecto_titulo || '').toLowerCase().trim();
  const exaAreas = Array.isArray(exalumno.areas_interes) ? exalumno.areas_interes : [];
  const areasInteresNorm = exaAreas.map((a) => typeof a === 'string' ? a.toLowerCase().trim() : '');
  
  if (estArea && areasInteresNorm.includes(estArea)) {
    score += 30;
    reasons.push(`Interés en común: ${estudiante.area_proyecto || 'Área relacionada'}`);
  }

  // 3. Sector profesional del exalumno <-> área temática del proyecto (20 puntos)
  const exaSector = (exalumno.sector || exalumno.empresa_actual || '').toLowerCase().trim();
  if (estArea && exaSector) {
    if (exaSector === estArea || exaSector.includes(estArea) || estArea.includes(exaSector)) {
      score += 20;
      reasons.push("Sector profesional y proyecto coinciden");
    }
  }

  // 4. Tipo de apoyo ofrecido <-> buscado (20 puntos)
  const apoyoBuscadoSet = new Set((Array.isArray(estudiante.apoyo_buscado) ? estudiante.apoyo_buscado : []).map((a) => typeof a === 'string' ? a.toLowerCase().trim() : ''));
  const apoyoOfrecidoSet = new Set((Array.isArray(exalumno.apoyo_ofrecido) ? exalumno.apoyo_ofrecido : []).map((a) => typeof a === 'string' ? a.toLowerCase().trim() : ''));

  // También mapeamos los booleanos de apoyo del modelo antiguo por si acaso
  if (exalumno.ofrece_mentoria) apoyoOfrecidoSet.add('mentoría');
  if (estudiante.busca_mentoria) apoyoBuscadoSet.add('mentoría');
  if (exalumno.ofrece_empleo) apoyoOfrecidoSet.add('empleo');
  if (estudiante.busca_empleo) apoyoBuscadoSet.add('empleo');
  if (exalumno.ofrece_pasantia) apoyoOfrecidoSet.add('pasantía');
  if (estudiante.busca_pasantia) apoyoBuscadoSet.add('pasantía');

  const interseccionApoyo = Array.from(apoyoBuscadoSet).filter((apoyo) => apoyo && apoyoOfrecidoSet.has(apoyo));
  if (interseccionApoyo.length > 0) {
    score += 20;
    reasons.push(`Coincidencia en apoyo: ${interseccionApoyo.join(", ")}`);
  }

  return { score: Math.min(score, 100), reasons };
};
