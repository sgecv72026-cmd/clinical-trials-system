# SAEC — Guía de arranque del proyecto

## ✅ Correcciones aplicadas automáticamente

| # | Problema | Estado |
|---|---|---|
| 1 | LoginPage redirigía a `/dashboard` (ruta inexistente) | ✅ Corregido → redirige a `/` |
| 2 | LoginForm redirigía a `/dashboard` como fallback | ✅ Corregido → redirige a `/` |
| 3 | JOIN FETCH + Pageable en AuditoriaRepo (carga todo en memoria) | ✅ Corregido |
| 4 | Java 22 instalado pero pom.xml declaraba Java 21 | ✅ Corregido → Java 22 |
| 5 | `ddl-auto: validate` crasheaba si faltaban tablas | ✅ Cambiado a `update` |

---

## 🔧 PASO 1 — Instalar Maven (OBLIGATORIO)

El backend es Spring Boot y necesita Maven para compilarse.
No está instalado en tu sistema.

### Opción A — Instalar con winget (más fácil)
Abre PowerShell como Administrador y ejecuta:
```
winget install Apache.Maven
```
Luego cierra y vuelve a abrir la terminal.

### Opción B — Descargar manualmente
1. Ve a https://maven.apache.org/download.cgi
2. Descarga **apache-maven-3.9.x-bin.zip**
3. Extrae en `C:\Users\Karen Gaitan\Documents\apache-maven-3.9.6`
4. Ya con eso, `start-backend.cmd` lo encontrará automáticamente

### Opción C — Usar IntelliJ IDEA (sin instalar Maven)
IntelliJ IDEA Community (gratis) tiene Maven integrado:
1. Abre IntelliJ IDEA
2. File → Open → selecciona la carpeta `saec-backend`
3. Clic en el botón ▶ Run de la clase `SaecApplication`

---

## 🗄️ PASO 2 — Verificar la base de datos

Asegúrate de que PostgreSQL está corriendo y que existe la BD `saec`.

### Verificar en pgAdmin
1. Abre pgAdmin
2. Conecta a `localhost:5432` con usuario `postgres`
3. Verifica que existe la base de datos **saec**
4. Verifica que existen las tablas: `usuario`, `cat_tipo_rol`, `centro_investigacion`, `auditoria_acceso`, `usuario_centro`

### Si las tablas NO existen
Con `ddl-auto: update` (ya configurado), Hibernate las creará automáticamente al iniciar el backend.
Luego ejecuta el seed:
```sql
-- En pgAdmin: abre Query Tool sobre la BD "saec" y ejecuta:
-- database/seed_auth.sql
```

### Contraseña de PostgreSQL
El backend usa `postgres` como contraseña por defecto.
Si la tuya es diferente, crea la variable de entorno:
```
DB_PASSWORD=tu_contraseña_aqui
```

---

## 🚀 PASO 3 — Arrancar el proyecto

### Terminal 1 — Backend (Spring Boot)
```
cd saec-backend
start-backend.cmd
```
Espera hasta ver: `Started SaecApplication in X seconds`
Puerto: http://localhost:8080/api

### Terminal 2 — Frontend (React + Vite)
```
cd saec-frontend
start-dev.cmd
```
Puerto: http://localhost:5173

### Luego abre el navegador
Ve a: **http://localhost:5173**

Credenciales de prueba:
- Email: `admin@saec.cl`
- Contraseña: `Saec2026!`

---

## 🗂️ Estructura del proyecto

```
Ensayos_clinicos/
├── saec-backend/          ← Spring Boot (Java 22, Maven)
│   ├── start-backend.cmd  ← Script de arranque del backend
│   └── pom.xml
├── saec-frontend/         ← React 18 + Vite
│   └── start-dev.cmd      ← Script de arranque del frontend
├── database/
│   ├── seed_auth.sql      ← Datos de prueba (usuarios y roles)
│   └── database_esquem.sql.txt  ← Documentación del esquema
└── INSTRUCCIONES_ARRANQUE.md  ← Este archivo
```
