/**
 * Nodo "Code" de n8n — Validación de comprobante de donación (UCR Alumni)
 * -----------------------------------------------------------------------
 * Modo del nodo: "Run Once for All Items" (JavaScript).
 * Va DESPUÉS del nodo de OCR (Google Vision) y ANTES del HTTP que llama al
 * callback /api/donaciones/[id]/validacion.
 *
 * Toma:
 *   - El body del Webhook: { donacion_id, formulario: {...}, comprobante_url }
 *   - El texto que devolvió el OCR.
 * Devuelve: { donacion_id, estado, confianza, checks, motivos }
 */

const CONFIG = {
  toleranciaMontoColones: 0,   // 0 = debe coincidir exacto
  toleranciaFechaDias: 1,      // ±1 día para absorber zona horaria
  requiereReferencia: false,   // el form la marca como opcional
};

// --- Helpers de normalización ---------------------------------------------

function normalizarMonto(v) {
  if (v == null) return null;
  if (typeof v === 'number') return Math.round(v * 100) / 100;
  let s = String(v).replace(/[^\d.,-]/g, ''); // quita ₡, $, letras, espacios
  if (!s) return null;
  const ultimaComa = s.lastIndexOf(',');
  const ultimoPunto = s.lastIndexOf('.');
  if (ultimaComa > ultimoPunto) {
    s = s.replace(/\./g, '').replace(',', '.'); // 50.000,00 -> 50000.00
  } else {
    s = s.replace(/,/g, '');                     // 50,000.00 -> 50000.00
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.round(n * 100) / 100;
}

function detectarMoneda(texto) {
  if (!texto) return null;
  const t = String(texto);
  if (/₡|CRC|colones/i.test(t)) return 'CRC';
  if (/\$|USD|d[oó]lares/i.test(t)) return 'USD';
  return null;
}

function aFecha(v) {
  if (!v) return null;
  let d = new Date(v);
  if (!isNaN(d)) return d;
  const m = String(v).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/); // dd/mm/yyyy
  if (m) {
    let [, dd, mm, yy] = m;
    if (yy.length === 2) yy = '20' + yy;
    d = new Date(Number(yy), Number(mm) - 1, Number(dd));
    if (!isNaN(d)) return d;
  }
  return null;
}

function normalizarRef(v) {
  if (v == null) return null;
  const s = String(v).replace(/[\s\-_.]/g, '').toUpperCase();
  return s.length ? s : null;
}

function extraerDeTexto(texto) {
  const out = {};
  if (!texto) return out;
  const t = String(texto);
  const mMonto = t.match(/(?:₡|CRC|monto[:\s]*)\s*([\d.,]+)/i);
  if (mMonto) out.monto = mMonto[1];
  const mFecha = t.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  if (mFecha) out.fecha = mFecha[1];
  const mRef = t.match(/(?:referencia|comprobante|ref)[:#\s]*([A-Z0-9\-]{4,})/i);
  if (mRef) out.referencia = mRef[1];
  return out;
}

// --- Lógica de comparación --------------------------------------------------

function validar(formulario, ocr) {
  const checks = [];
  const motivos = [];

  const parsed = extraerDeTexto(ocr.texto_completo);
  const ocrMonto = ocr.monto_detectado ?? parsed.monto;
  const ocrFecha = ocr.fecha_detectada ?? parsed.fecha;
  const ocrRef = ocr.referencia_detectada ?? parsed.referencia;
  const ocrMoneda = detectarMoneda(ocr.texto_completo);

  // 1) MONTO
  const mForm = normalizarMonto(formulario.monto);
  const mOcr = normalizarMonto(ocrMonto);
  let estadoMonto;
  if (mForm == null || mOcr == null) {
    estadoMonto = 'indeterminado';
    motivos.push('No se pudo leer el monto en el comprobante.');
  } else if (Math.abs(mForm - mOcr) <= CONFIG.toleranciaMontoColones) {
    estadoMonto = 'ok';
  } else {
    estadoMonto = 'fail';
    motivos.push(`Monto no coincide: formulario ${mForm}, comprobante ${mOcr}.`);
  }
  checks.push({ campo: 'monto', esperado: mForm, detectado: mOcr, estado: estadoMonto });

  // 2) MONEDA
  let estadoMoneda;
  if (!ocrMoneda) {
    estadoMoneda = 'indeterminado';
  } else if (ocrMoneda === formulario.moneda) {
    estadoMoneda = 'ok';
  } else {
    estadoMoneda = 'fail';
    motivos.push(`Moneda no coincide: formulario ${formulario.moneda}, comprobante ${ocrMoneda}.`);
  }
  checks.push({ campo: 'moneda', esperado: formulario.moneda, detectado: ocrMoneda, estado: estadoMoneda });

  // 3) FECHA
  const fForm = aFecha(formulario.fecha_transferencia);
  const fOcr = aFecha(ocrFecha);
  let estadoFecha;
  if (!fForm || !fOcr) {
    estadoFecha = 'indeterminado';
    motivos.push('No se pudo leer la fecha en el comprobante.');
  } else {
    const difDias = Math.abs(fForm - fOcr) / 86400000;
    estadoFecha = difDias <= CONFIG.toleranciaFechaDias ? 'ok' : 'fail';
    if (estadoFecha === 'fail') motivos.push(`Fecha fuera de rango: ${difDias.toFixed(1)} días de diferencia.`);
  }
  checks.push({
    campo: 'fecha',
    esperado: fForm ? fForm.toISOString().slice(0, 10) : null,
    detectado: fOcr ? fOcr.toISOString().slice(0, 10) : null,
    estado: estadoFecha,
  });

  // 4) REFERENCIA (opcional)
  const rForm = normalizarRef(formulario.numero_referencia);
  const rOcr = normalizarRef(ocrRef);
  let estadoRef;
  if (!rForm) {
    estadoRef = CONFIG.requiereReferencia ? 'fail' : 'no_aplica';
  } else if (!rOcr) {
    estadoRef = 'indeterminado';
  } else {
    estadoRef = rForm === rOcr ? 'ok' : 'fail';
    if (estadoRef === 'fail') motivos.push(`Referencia no coincide: formulario ${rForm}, comprobante ${rOcr}.`);
  }
  checks.push({ campo: 'referencia', esperado: rForm, detectado: rOcr, estado: estadoRef });

  // --- Veredicto ------------------------------------------------------------
  const criticos = checks.filter(c => ['monto', 'moneda', 'fecha'].includes(c.campo));
  const hayFail = checks.some(c => c.estado === 'fail');
  const hayIndeterminado = criticos.some(c => c.estado === 'indeterminado');

  let estado;
  if (hayFail) estado = 'discrepancia';           // rojo
  else if (hayIndeterminado) estado = 'revision_manual'; // amarillo
  else estado = 'pre_validada';                    // verde

  const peso = { monto: 45, moneda: 15, fecha: 25, referencia: 15 };
  let confianza = 0;
  for (const c of checks) {
    if (c.estado === 'ok') confianza += peso[c.campo] || 0;
    else if (c.estado === 'no_aplica') confianza += (peso[c.campo] || 0) * 0.5;
  }

  return { estado, confianza, checks, motivos };
}

// --- Ejecución en n8n -------------------------------------------------------
// Lee el body del Webhook y el texto del OCR. Ajusta la ruta del texto según
// la salida real del nodo de Google Vision en tu n8n.

const entrada = $('Webhook (la app dispara)').first().json.body || {};
const formulario = entrada.formulario || {};
const donacion_id = entrada.donacion_id;

const item = $input.first().json;
const textoOCR =
  item.textAnnotations?.[0]?.description ||
  item.fullTextAnnotation?.text ||
  item.text ||
  '';

const ocr = { texto_completo: textoOCR, monto_detectado: null, fecha_detectada: null, referencia_detectada: null };
const validacion = validar(formulario, ocr);

return [{ json: { donacion_id, ...validacion } }];
