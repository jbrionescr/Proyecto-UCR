// T-13: calcula perfil_completo para todos los perfiles existentes (backfill
// único). Sin esto, el directorio quedaría vacío al activar el filtro, ya que
// la columna nueva/hasta ahora nunca escrita queda en `false` por defecto.
//
// Uso:
//   node scripts/backfill_perfil_completo.mjs            (dry-run)
//   node scripts/backfill_perfil_completo.mjs --apply     (aplica)

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = join(__dirname, "..", ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const APPLY = process.argv.includes("--apply");

// Réplica de lib/profile-completeness.ts (mantener en sync si cambia).
const REQUERIDOS_EXALUMNO = [
  "carrera", "escuela_facultad", "anio_graduacion", "empresa_actual",
  "cargo_actual", "sector", "pais_ciudad", "linkedin_url", "biografia", "anios_experiencia",
];
const REQUERIDOS_ESTUDIANTE = [
  "carnet_ucr", "carrera", "escuela_facultad", "sede", "anio_ingreso",
  "nivel_academico", "proyecto_titulo", "proyecto_tipo", "proyecto_descripcion", "area_tematica",
];

function tieneAreas(areas) {
  return Array.isArray(areas) && areas.length >= 1;
}

function esCompletoExalumno(row, areas) {
  const faltantes = REQUERIDOS_EXALUMNO.filter((c) => !row[c]);
  if (!tieneAreas(areas)) faltantes.push("areas_interes");
  return faltantes.length === 0;
}

function esCompletoEstudiante(row, areas) {
  const faltantes = REQUERIDOS_ESTUDIANTE.filter((c) => !row[c]);
  if (!tieneAreas(areas)) faltantes.push("areas_interes");
  const apoyoOK = !!(row.busca_financiamiento || row.busca_mentoria || row.busca_empleo || row.busca_pasantia);
  if (!apoyoOK) faltantes.push("apoyo_buscado");
  return faltantes.length === 0;
}

async function main() {
  const client = new pg.Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();
  console.log(APPLY ? "Modo: APLICAR cambios\n" : "Modo: DRY-RUN (usa --apply para confirmar)\n");

  const { rows: areasRows } = await client.query(`SELECT user_id, area_codigo FROM "USUARIOS_AREAS"`);
  const areasPorUsuario = new Map();
  for (const r of areasRows) {
    const actuales = areasPorUsuario.get(r.user_id) ?? [];
    actuales.push(r.area_codigo);
    areasPorUsuario.set(r.user_id, actuales);
  }

  let totalCompletos = 0;
  let totalIncompletos = 0;

  for (const [tabla, calcular] of [["EXALUMNOS", esCompletoExalumno], ["ESTUDIANTES", esCompletoEstudiante]]) {
    const { rows } = await client.query(`SELECT * FROM "${tabla}"`);
    for (const row of rows) {
      const areas = areasPorUsuario.get(row.user_id) ?? [];
      const completo = calcular(row, areas);
      if (completo) totalCompletos++; else totalIncompletos++;
      console.log(`[${tabla}] ${row.user_id} -> perfil_completo=${completo}`);
      if (APPLY) {
        await client.query(`UPDATE "${tabla}" SET perfil_completo = $1 WHERE user_id = $2`, [completo, row.user_id]);
      }
    }
  }

  console.log(`\nCompletos: ${totalCompletos} | Incompletos: ${totalIncompletos}`);
  if (!APPLY) console.log("\nDry-run: no se escribió nada. Corre con --apply para confirmar.");

  await client.end();
}

main().catch((err) => {
  console.error("Error en el backfill:", err);
  process.exit(1);
});
