# Verificación de comprobantes de donación con OCR (n8n)

Automatiza la pre-validación de comprobantes SINPE/transferencia: al subir un
comprobante, n8n corre OCR, lo compara con lo que declaró el exalumno y marca la
donación en la cola del admin como **verde** (pre-validada), **rojo** (discrepancia)
o **amarillo** (revisión manual). **El admin siempre confirma o rechaza al final** (RF-08.2).

## Lo que YA está hecho en la app (probado)

- Columnas nuevas en `DONACIONES`: `fecha_transferencia`, `numero_referencia`,
  `validacion_estado`, `validacion_confianza`, `validacion_detalle`, `validacion_at`
  (migración `supabase/migrations/25_donacion_validacion_ocr.sql`, ya aplicada).
- Formulario de donación (RF-07): captura monto, moneda, método, **fecha/hora de
  transferencia**, número de referencia y **sube el comprobante a Cloudinary**.
- La app **dispara el webhook** a n8n al registrar la donación (`lib/n8n.ts`).
- **Endpoint callback** `POST /api/donaciones/[id]/validacion` que recibe el veredicto
  (protegido con el header `x-n8n-secret`).
- La **cola admin** `/admin/donaciones` muestra el semáforo + detalle campo por campo.

Solo falta montar n8n y conectar el OCR. Esta carpeta trae todo listo.

## Archivos
- `workflow-validacion-comprobantes.json` — workflow para importar en n8n.
- `nodo-comparacion-ocr.js` — el nodo Code completo (pégalo si el import no lo trae).

## Paso a paso

### 1. Levantar n8n
**Opción rápida (demo, local con Docker):**
```bash
docker run -it --rm -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```
Abre http://localhost:5678 y crea tu usuario. (Para producción: n8n Cloud o un
servidor con dominio y HTTPS.)

### 2. Importar el workflow
En n8n → **Workflows → Import from File** → elige `workflow-validacion-comprobantes.json`.

### 3. Credencial de Google Vision (OCR)
1. En Google Cloud: crea un proyecto, habilita **Cloud Vision API** y genera una
   credencial (Service Account o API key).
2. En n8n → nodo **OCR (Google Vision)** → conecta la credencial.
3. Verifica en el nodo Code la ruta del texto (`textAnnotations[0].description`);
   ajústala si tu salida difiere.

### 4. Pegar la lógica de comparación
Abre el nodo **Comparar OCR vs formulario (Code)** y pega el contenido de
`nodo-comparacion-ocr.js` (si el import ya lo trae, verifica que esté completo).

### 5. Configurar el callback a la app
En el nodo **Devolver veredicto a la app**:
- URL: `https://TU-APP.com/api/donaciones/{{ $json.donacion_id }}/validacion`
  (en local: `http://host.docker.internal:3000/...` si n8n corre en Docker).
- Header `x-n8n-secret` = el mismo valor de `N8N_WEBHOOK_SECRET` de tu `.env.local`.
  En n8n guárdalo como variable de entorno `N8N_WEBHOOK_SECRET`.

### 6. Conectar la app con n8n
1. Activa el workflow (toggle **Active**) y copia la **Production URL** del nodo Webhook
   (ej. `https://tu-n8n/webhook/validar-comprobante`).
2. En `Frontend/.env.local`:
   ```
   N8N_WEBHOOK_URL=https://tu-n8n/webhook/validar-comprobante
   N8N_WEBHOOK_SECRET=<un-secreto-largo-y-aleatorio>   # el mismo en n8n
   ```
3. Reinicia el `next dev`. Listo: cada donación con comprobante dispara la validación.

## Probar sin n8n (simular el veredicto)
El callback ya funciona; puedes simular lo que enviaría n8n:
```bash
curl -X POST "http://localhost:3000/api/donaciones/<ID>/validacion" \
  -H "Content-Type: application/json" -H "x-n8n-secret: <TU_SECRETO>" \
  -d '{"estado":"pre_validada","confianza":100,
       "checks":[{"campo":"monto","esperado":50000,"detectado":50000,"estado":"ok"}],
       "motivos":[]}'
```
Estados válidos: `pre_validada` (verde), `discrepancia` (rojo), `revision_manual` (amarillo).

## Notas de diseño (para el pitch)
- El OCR **pre-valida, no confirma**. La aprobación final es humana (RF-08.2) — así se
  vende como *"acelera al admin y detecta fraude"*, no como *"aprueba plata solo"*.
- 3 estados, no 2: el amarillo (`revision_manual`) es para cuando el OCR no pudo leer
  un campo (foto borrosa) — no es fraude, la máquina no está segura.
- La normalización de montos (`₡50.000,00` ↔ `50000`) es lo que hace que SINPE funcione.
- El `CONFIG` del nodo Code es la perilla de ajuste en vivo (ej. `toleranciaFechaDias`).
