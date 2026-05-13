# La Razón — Herramienta de Encuestas

Widget de encuestas embebible vía iframe para el CMS de La Razón.  
El redactor crea una encuesta en el panel de admin, copia el código `<iframe>` y lo pega en el artículo.

## Tecnologías

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4**
- **Prisma 7** + **SQLite** (via `@prisma/adapter-better-sqlite3`)

---

## Desarrollo local

```bash
# 1. Clonar el repo
git clone https://github.com/MaxLR12/LaRazn.git
cd LaRazn

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Instalar dependencias
npm install

# 4. Crear la base de datos y aplicar migraciones
npx prisma migrate dev --name init

# 5. Arrancar el servidor
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) → redirige automáticamente a `/admin`.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Ruta al archivo SQLite | `file:./prisma/dev.db` |

En **Railway con volumen persistente** usar:

```
DATABASE_URL=file:/app/prisma/data.db
```

> El directorio `/app/prisma` debe ser el punto de montaje del volumen (ver sección Railway más abajo).

---

## Deploy en Railway

### Paso 1 — Crear proyecto

1. Ir a [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Seleccionar el repo `MaxLR12/LaRazn`
3. Railway detectará automáticamente Next.js y usará el script `npm run build`

### Paso 2 — Añadir volumen persistente

SQLite guarda los datos en un archivo. Sin un volumen ese archivo se pierde en cada redeploy.

1. En el panel del servicio → pestaña **Volumes** → **Add Volume**
2. **Mount Path**: `/app/prisma`
3. Railway creará el directorio y lo mantendrá entre deploys

### Paso 3 — Variables de entorno

En el panel del servicio → pestaña **Variables**, añadir:

```
DATABASE_URL=file:/app/prisma/data.db
```

> Usar `/app/prisma/data.db` (ruta absoluta dentro del volumen).  
> No usar `file:./prisma/dev.db` en producción.

### Paso 4 — Deploy

Railway ejecutará automáticamente:

```bash
npm run build
# = prisma migrate deploy && prisma generate && next build
```

`prisma migrate deploy` aplica las migraciones pendientes en cada deploy sin necesidad de intervención manual.

El servidor de producción arranca con:

```bash
npm run start
# = next start
```

### Resumen de configuración Railway

| Campo | Valor |
|---|---|
| Build Command | `npm run build` (auto-detectado) |
| Start Command | `npm run start` (auto-detectado) |
| Volume Mount Path | `/app/prisma` |
| `DATABASE_URL` | `file:/app/prisma/data.db` |

---

## Estructura del proyecto

```
app/
  admin/          → Panel de administración (/admin)
    page.tsx      → Página principal con lista de encuestas
    PollForm.tsx  → Formulario de creación
    PollList.tsx  → Lista con código iframe y acciones
  api/
    polls/
      route.ts              → GET lista / POST crear
      [id]/
        route.ts            → DELETE eliminar
        results/route.ts    → GET resultados + estado de voto
        vote/route.ts       → POST registrar voto
  embed/
    [id]/
      page.tsx      → Página embebible (/embed/[id])
      PollEmbed.tsx → Widget de votación + resultados
      layout.tsx    → Layout mínimo para iframe
lib/
  prisma.ts       → Singleton del cliente Prisma
prisma/
  schema.prisma   → Modelos: Poll, Option, Vote
  migrations/     → Migraciones SQL versionadas
```

---

## Uso desde el CMS

Una vez creada la encuesta en `/admin`, copiar el código iframe generado:

```html
<iframe
  src="https://tu-dominio.railway.app/embed/[ID_ENCUESTA]"
  width="100%"
  height="520"
  frameborder="0"
  scrolling="no"
  style="border:none;overflow:hidden"
  allowtransparency="true">
</iframe>
```

---

## API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/polls` | Lista todas las encuestas |
| `POST` | `/api/polls` | Crea una encuesta nueva |
| `GET` | `/api/polls/[id]/results` | Resultados + estado de voto del usuario |
| `POST` | `/api/polls/[id]/vote` | Registra un voto |
| `DELETE` | `/api/polls/[id]` | Elimina una encuesta |
