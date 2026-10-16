# Cacao con historia — Trazabilidad para Asoprocacao

MVP de software para que una asociación cacaotera del Huila registre la recepción de lotes, sus transformaciones y su comercialización con trazabilidad, control de inventario, alertas, balance económico y una ficha pública con código QR.

> Proyecto desarrollado en el II Hackathon de Programación — II Feria Universitaria de Ciencia, Tecnología e Innovación del Huila (Universidad Surcolombiana, 15 y 16 de octubre de 2026). El caso, la asociación y los datos son simulados.

**Estado:** en construcción. Este README se completa al cierre con la instalación limpia verificada.

## Requisitos

- PostgreSQL 16: con Docker Desktop (contenedor) o instalado en el equipo
- Java 21
- Node.js 22 LTS
- Git

## Puesta en marcha (desarrollo)

```bash
cp .env.example .env              # en Windows: copy .env.example .env
docker compose up -d              # PostgreSQL en localhost:5433

cd backend
./mvnw spring-boot:run            # en Windows: mvnw.cmd spring-boot:run  → http://localhost:8080

cd ../frontend
npm install
npm run dev                       # → http://localhost:5173
```

Sin Docker: instalar PostgreSQL, crear el usuario y la base `cacao` (ver `docs/CONTRATO_TECNICO.md`, sección 4), poner el puerto en `DB_PORT` del `.env` y omitir `docker compose up -d`.

Flyway crea el esquema y carga los datos sintéticos (CAC001, CAC002, CAC003) al arrancar el backend.

## Usuarios de demostración

| Usuario | Contraseña | Rol |
|---|---|---|
| `operador1` | `cacao123` | Operador |
| `admin1` | `admin123` | Administrador |

## Estructura

| Carpeta | Contenido |
|---|---|
| `backend/` | API REST (Java 21, Spring Boot 3.5, Spring Security JWT, JPA, Flyway) |
| `frontend/` | Aplicación web (React, Vite, Tailwind CSS) |
| `datos/` | Respaldo de demostración, scripts de respaldo/restauración y prueba de rendimiento |
| `docs/` | Contrato técnico del equipo |
| `documentos/` | Entregables E01–E09 |
| `pitch/` | Presentación comercial |

## Equipo

- Miguel Ángel Medina Díaz — Base de datos y backend
- Juan David Fierro Calderón — Frontend e integración
- Juan Manuel Villalba Rincón — Documentación, pruebas manuales, usabilidad y pitch

Programa de Ingeniería de Software — Universidad Surcolombiana.
