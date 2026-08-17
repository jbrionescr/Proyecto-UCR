// T-11: migra los valores de texto libre en ESTUDIANTES.areas_interes y
// EXALUMNOS.areas_interes hacia la tabla relacional USUARIOS_AREAS, mapeando
// cada término a una de las 14 áreas del catálogo por coincidencia de
// palabras clave (normalizado: minúsculas, sin acentos).
//
// Uso:
//   node scripts/migrate_areas_interes.mjs            (dry-run, no escribe nada)
//   node scripts/migrate_areas_interes.mjs --apply     (aplica los cambios)
//
// Lee DIRECT_URL de Frontend/.env.local.

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

// Palabras clave por código de catálogo. Se evalúan en este orden — el
// primer código cuyas palabras clave coincidan con el término gana.
const KEYWORDS = [
  ["derecho_politica", ["derecho", "legal", "legisla", "arbitraje", "politic", " ley "]],
  ["salud_medicina", ["salud", "medic", "cardiolog", "biomedic", "healthtech", "farmac", "odont", "nutri", "clinic"]],
  ["medio_ambiente", ["ambient", "sostenib", "renovable", "ecolog", "energetic", "conservacion marina", "manufactura sostenible"]],
  ["ciencias_exactas", ["biodivers", "bioindicador", "biolog", "quimic", "fisic", "matem", "molecular", "marina", "conservacion"]],
  ["ingenieria_construccion", ["civil", "arquitect", "mecanic", "electr", "constru", "vial", "edificacion", "infraestructura", "industrial", "automatizacion", "iot", "eficiencia energetica", "logistic"]],
  ["tecnologia_software", ["tecnolog", "comput", "softw", "sistem", "digital", "desarroll web", "desarrollo movil", "mobile", "backend", "devops", "ciberseg", "cyber", "cloud", "ux", "app", " ia", "inteligencia artificial", "ciencia de datos", "startup tech", "e-commerce", "healthtech", "open source", "privacidad de datos"]],
  ["negocios_finanzas", ["banca", "financ", "finanzas", "invers", "capital", "fintech", "emprendimiento", "econom", "contab", "gerenc", "negocio", "corporat"]],
  ["comunicacion_periodismo", ["comunicac", "marketing", "periodis", "public", "branding", "content"]],
  ["ciencias_sociales", ["psicolog", "organizacional", "recursos humanos", "coaching", "bienestar laboral", "social", "antropo"]],
  ["arte_diseno", ["diseñ", "diseno", "arte ", "grafic", "music", "pintura"]],
  ["turismo_hospitalidad", ["turis", "hoteler", "gastronom", "hospi"]],
  ["agricultura_agroindustria", ["agro", "agricult", "zootecn"]],
  ["educacion_docencia", ["educa", "enseñ", "ensen", "pedagog", "docen"]],
  ["investigacion_desarrollo", ["investigac", "desarrollo", "laborator", "simulacion", "optimizacion de procesos", "lean manufacturing", "analisis de datos"]],
];

function normalizar(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // quita acentos
}

// Términos cortos/abreviaturas que no son seguros de matchear por substring
// (ej. "IA" adentro de "artificial", "industria", etc.) — se comparan exactos.
const EXACTOS = { ia: "tecnologia_software" };

function mapearTermino(termino) {
  const n = normalizar(termino).trim();
  if (EXACTOS[n]) return EXACTOS[n];
  for (const [codigo, keywords] of KEYWORDS) {
    if (keywords.some((k) => n.includes(normalizar(k)))) return codigo;
  }
  return null;
}

async function main() {
  const client = new pg.Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();

  console.log(APPLY ? "Modo: APLICAR cambios\n" : "Modo: DRY-RUN (no se escribe nada, usa --apply para confirmar)\n");

  const sinMapear = [];
  const paraInsertar = []; // { user_id, area_codigo, termino, tabla }

  for (const tabla of ["ESTUDIANTES", "EXALUMNOS"]) {
    const { rows } = await client.query(
      `SELECT user_id, areas_interes FROM "${tabla}" WHERE areas_interes IS NOT NULL AND areas_interes::text NOT IN ('[]', 'null')`
    );

    for (const row of rows) {
      const terminos = Array.isArray(row.areas_interes) ? row.areas_interes : [];
      const codigosDeEsteUsuario = new Set();
      for (const termino of terminos) {
        if (typeof termino !== "string" || !termino.trim()) continue;
        const codigo = mapearTermino(termino);
        if (codigo) {
          codigosDeEsteUsuario.add(codigo);
        } else {
          sinMapear.push({ tabla, user_id: row.user_id, termino });
        }
      }
      for (const codigo of codigosDeEsteUsuario) {
        paraInsertar.push({ user_id: row.user_id, area_codigo: codigo, tabla });
      }
    }
  }

  console.log(`Asociaciones (usuario, área) a insertar: ${paraInsertar.length}`);
  for (const p of paraInsertar) {
    console.log(`  [${p.tabla}] ${p.user_id} -> ${p.area_codigo}`);
  }

  console.log(`\nTérminos que NO se pudieron mapear a ninguna área (revisar manualmente): ${sinMapear.length}`);
  for (const s of sinMapear) {
    console.log(`  [${s.tabla}] ${s.user_id} -> "${s.termino}"`);
  }

  if (APPLY) {
    let insertados = 0;
    for (const p of paraInsertar) {
      const res = await client.query(
        `INSERT INTO "USUARIOS_AREAS" (user_id, area_codigo) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [p.user_id, p.area_codigo]
      );
      insertados += res.rowCount;
    }
    console.log(`\nFilas insertadas en USUARIOS_AREAS: ${insertados}`);
  } else {
    console.log("\nDry-run: no se insertó nada. Corre con --apply para confirmar.");
  }

  await client.end();
}

main().catch((err) => {
  console.error("Error en la migración:", err);
  process.exit(1);
});
