# 🔐 Sistema de Aprobación de Exalumnos - Implementación

## ✅ Cambios Realizados

### 1. **Configuración de Resend (Email Service)**
- **Archivo de configuración**: `backend/.env` (no versionado; ver [`backend/.env.example`](backend/.env.example))
- **Variables requeridas** (los valores se definen en el entorno, nunca en la documentación):
  - `RESEND_API_KEY`
  - `TEMPLATE_ALUMNI_APPROVED`
  - `FROM_EMAIL`

### 2. **Funciones de Email** 
- **Archivo actualizado**: `backend/src/config/email.js`
- **Nueva función**: `sendAlumniApprovedEmail(to, nombre)`
  - Envía el email de aprobación usando el template de Resend
  - Pasa datos al template: `nombre` y `loginUrl`

### 3. **Lógica de Aprobación**
- **Archivo actualizado**: `backend/src/services/auth.service.js`
- **Función mejorada**: `approveAlumni(userId)`
  - Obtiene datos del exalumno
  - Activa su cuenta (`activo: true`)
  - Envía email de aprobación automáticamente
  - Maneja errores de email sin fallar la aprobación

### 4. **Endpoint del Admin Dashboard**
- **Archivo actualizado**: `backend/src/routes/admin.routes.js`
- **Nuevo endpoint**: `GET /api/admin/alumni-pending`
  - Solo accesible para usuarios con rol `ADMINISTRADOR`
  - Retorna lista de exalumnos pendientes de aprobación
  - Incluye información: nombre, email, fecha de registro, escuela, año de graduación
  - Respuesta:
    ```json
    {
      "totalPending": 5,
      "alumni": [
        {
          "id": "uuid",
          "email": "exalumno@ejemplo.com",
          "nombre": "Juan Pérez",
          "email_verified": true,
          "createdAt": "2026-06-08T10:30:00Z",
          "Exalumno": {
            "escuela_facultad": "Ingeniería",
            "anio_graduacion": 2020
          }
        }
      ]
    }
    ```

### 5. **Flujo Completo**

#### Registro (Ya existía)
1. Exalumno se registra en `/api/auth/register/alumni`
2. Se crea usuario con `activo: false`
3. Se envía email de confirmación

#### Aprobación (Nuevo)
1. Admin accede a `GET /api/admin/alumni-pending` para ver pendientes
2. Admin hace `PATCH /api/auth/approve/:userId`
3. Backend:
   - Activa la cuenta (`activo: true`)
   - Envía email de aprobación usando template de Resend
   - Retorna confirmación

#### Usuario Aprobado
1. Recibe email de bienvenida desde template_h4avnom
2. Puede iniciar sesión en `/auth/login`
3. Accede a funcionalidades de exalumno

## 📋 Endpoints Disponibles

```
# Ver exalumnos pendientes
GET /api/admin/alumni-pending
Authorization: Bearer {token}

# Aprobar un exalumno
PATCH /api/auth/approve/:userId
Authorization: Bearer {token}
```

## 🔧 Variables de Entorno Requeridas

```env
# Definir en backend/.env (nunca versionar este archivo)
RESEND_API_KEY=tu_api_key_de_resend
TEMPLATE_ALUMNI_APPROVED=id_del_template_de_resend
FROM_EMAIL=no-reply@tu-dominio.com
FRONTEND_URL=http://localhost:3000
```

## 📝 Notas
- El template de Resend debe tener props: `nombre` y `loginUrl`
- Si falla el envío de email, la aprobación se realiza de todas formas
- Logs de error estarán en consola si hay problemas con email
- Los exalumnos verán sus cuentas activas inmediatamente después de aprobación
