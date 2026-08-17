// Tipo de cambio USD → CRC. Se usa para unificar a colones cualquier monto
// que se haya registrado en dólares (ej. la meta de financiamiento de un
// proyecto estudiantil, ver app/proyectos/nuevo/page.tsx), ya que las
// donaciones en la plataforma siempre se registran en colones.

const SOURCE_URL = "http://apis.gometa.org/tdc/tdc.json";

export interface ExchangeRate {
  compra: number;
  venta: number;
  date: string;
}

// Respaldo si la API externa no responde, para no romper páginas que
// dependen de la conversión.
const FALLBACK_RATE: ExchangeRate = { compra: 450, venta: 460, date: "" };

const CACHE_MS = 60 * 60 * 1000; // 1 hora — el tipo de cambio del BCCR se actualiza una vez al día
let cache: { data: ExchangeRate; fetchedAt: number } | null = null;

async function fetchRealRate(): Promise<ExchangeRate> {
  const res = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const data: ExchangeRate = {
    compra: Number(json.compra),
    venta: Number(json.venta),
    date: json.venta_date ?? "",
  };
  if (!data.venta || Number.isNaN(data.venta)) throw new Error("Respuesta inválida");
  cache = { data, fetchedAt: Date.now() };
  return data;
}

// Además del AbortSignal en el fetch, se corre una carrera con un timeout
// propio: así, sin importar la causa (DNS lento, la API externa colgada,
// una limitación del runtime con AbortSignal), esta función nunca deja
// esperando indefinidamente a quien la llama.
export async function getExchangeRate(): Promise<ExchangeRate> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_MS) return cache.data;

  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));

  try {
    const result = await Promise.race([fetchRealRate(), timeout]);
    if (result) return result;
    console.error("[getExchangeRate] Tiempo de espera agotado, usando respaldo/caché.");
    return cache?.data ?? FALLBACK_RATE;
  } catch (error) {
    console.error("[getExchangeRate] No se pudo obtener el tipo de cambio, usando respaldo:", error);
    return cache?.data ?? FALLBACK_RATE;
  }
}

// Convención del proyecto: los montos en dólares se expresan en colones al
// tipo de "venta" (lo que cuesta comprar USD), que es el estándar para
// mostrar el costo en moneda local de algo cotizado en dólares.
export function usdToCrc(usd: number, rate: ExchangeRate): number {
  return Math.round((Number(usd) || 0) * rate.venta);
}
