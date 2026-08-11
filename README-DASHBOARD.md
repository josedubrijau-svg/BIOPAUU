# BioPAU — Área privada VIP (Dashboard)

Guía de la nueva zona de estudio: cómo está organizada y **cómo añadir contenido**
en las próximas iteraciones sin tocar la estructura.

---

## 1. Por qué HTML/CSS/JS y no React + Tailwind

Tu proyecto es estático (HTML + Vercel + Supabase), sin bundler ni build. Meter React
o Tailwind aquí obligaría a añadir Node, compilación, dependencias y un despliegue distinto,
para una ganancia real casi nula en esta pantalla. He mantenido la línea del proyecto:
**HTML semántico + CSS propio con tus tokens + JS en módulos**, sin build.

Ventajas concretas: carga instantánea, cero dependencias que se rompan, mismo despliegue
que ya tienes, y el mismo sistema de diseño que la landing (tipografías, verde pino/lima).
Si algún día el área privada crece mucho (editor de contenidos, estado complejo), migrar a
React es fácil porque **los datos ya están separados de la vista** (ver punto 3).

---

## 2. Arquitectura por capas

```
┌─ VISTA        app/index.html, apuntes.html, examenes.html, calendario.html
│              (solo maquetación: cada página escribe únicamente SU contenido)
├─ SHELL        js/shell.js      → sidebar, topbar, iconos SVG, avatares
├─ LÓGICA       js/dashboard.js, js/apuntes.js, js/examenes.js, js/calendario.js
├─ DATOS (app)  js/progress.js   → progreso, racha, nivel, sugerencias
├─ CATÁLOGO     js/study-data.js → EL TEMARIO (única fuente de verdad)
└─ BASE DATOS   supabase/dashboard-schema.sql (RLS: cada alumno ve solo lo suyo)
```

**Regla de oro:** el contenido vive en `js/study-data.js`, nunca dentro del HTML.
Así, añadir un tema actualiza a la vez: el temario, el % de progreso, el nivel,
las barras por bloque y las sugerencias. Sin tocar ni una vista.

---

## 3. Cómo añadir contenido (próximas iteraciones)

### Añadir un tema nuevo
En `js/study-data.js`, dentro del bloque que toque:
```js
{ id: 'gen-05', titulo: 'Genética de poblaciones', resumen: 'Hardy-Weinberg y frecuencias alélicas.' }
```
Eso es todo. El tema aparece en Apuntes, cuenta para el progreso y entra en las sugerencias.

> ⚠️ **Nunca cambies un `id` ya publicado**: se guarda en la base de datos para registrar
> qué ha completado cada alumno. Si lo cambias, ese progreso queda huérfano.

### Publicar los apuntes de un tema
Dos opciones, según cuánto contenido tengas:

1. **Página por tema** (recomendado): crea `app/temas/gen-01.html` copiando la estructura de
   cualquier vista (sidebar + topbar + tu contenido) y añade `url: '/app/temas/gen-01.html'`
   al tema. Luego, en `js/apuntes.js`, haz que el título enlace a `t.url`.
2. **Contenido embebido**: añade un campo `contenido: '<h3>…</h3><p>…</p>'` al tema y píntalo
   en un panel desplegable dentro de `js/apuntes.js`.

### Añadir exámenes
En `EXAMENES` de `js/study-data.js`:
```js
{ id: 'pau-2026-ord', anio: 2026, convocatoria: 'Ordinaria',
  bloques: ['genetica','metabolismo'], url: '/examenes/2026-ordinaria.pdf' }
```
Después, en `js/examenes.js`, cambia el chip "Próximamente" por un enlace a `ex.url`.

### Crear una sección nueva en el menú
1. Añade la entrada al array `NAV` de `js/shell.js`.
2. Crea `app/mi-seccion.html` copiando la estructura de `app/novedades.html`.
3. Pon `data-page="mi-seccion"` en el `<body>` para que se marque como activa.

---

## 4. Qué hace cada funcionalidad

| Funcionalidad | Dónde vive | Cómo funciona |
|---|---|---|
| Saludo por hora | `dashboard.js` → `construirSaludo()` | 4 franjas (madrugada/mañana/tarde/noche) con varias frases; la semilla es el día + hora, así no cambia en cada recarga |
| Anillo de progreso | `dashboard.js` → `pintarAnillo()` | SVG con `stroke-dasharray` animado; % = temas completados (los "en curso" cuentan la mitad) |
| Racha | `dashboard-schema.sql` → `touch_streak()` | **Se calcula en el servidor** al abrir el panel: +1 si estudiaste ayer, reinicia si fallaste. No es manipulable desde el navegador |
| Nivel | `study-data.js` → `NIVELES` + `nivelPara()` | Se desbloquea por temas completados (12 temas = "Nivel 5: Célula Experta") |
| Avatar | `shell.js` → `avatarSVG()` | 6 avatares dibujados en SVG (sin imágenes externas), guardados en `user_stats.avatar_id` |
| Cuenta atrás | `dashboard.js` → `iniciarCuentaAtras()` | Usa `PAU_TARGET` de `study-data.js`, la misma fecha que la landing |
| Sugerencias | `progress.js` → `recommendations()` | Prioriza lo empezado a medias, reserva un hueco para repaso espaciado (temas hechos hace +7 días) y rellena con temas nuevos |
| Calendario | `calendario.js` + tabla `study_days` | Rejilla mensual; marcar/desmarcar un día lo guarda en la base de datos |

---

## 5. Puesta en marcha

1. Ejecuta `supabase/dashboard-schema.sql` en **Supabase → SQL Editor → Run**
   (después de `schema.sql`).
2. Sube los archivos y despliega. Nada más: no hay dependencias nuevas ni build.

Si aún no has ejecutado el SQL, el dashboard **no se rompe**: muestra un aviso naranja
y los contadores a cero.

---

## 6. Seguridad

- Las páginas del área privada llevan `data-requires-plan`: `js/auth.js` verifica **sesión
  activa + suscripción** antes de mostrar nada (el contenido está oculto por CSS hasta validar).
- Todas las tablas nuevas tienen **RLS**: un alumno solo puede leer y escribir sus propias filas.
- La racha se calcula con una función `security definer` en el servidor, no en el navegador.

> **Nota importante para cuando publiques el temario real:** ocultar contenido con CSS/JS
> no es protección. Cuando los apuntes tengan valor, sírvelos desde la base de datos
> (una tabla `topic_content` con RLS que exija suscripción activa) o desde una función
> autenticada, no incrustados en HTML estático.

---

## 7. Pendiente / siguientes pasos sugeridos

- [ ] Rellenar el contenido de los temas (el catálogo ya está montado).
- [ ] Subir los PDF de exámenes y enlazarlos.
- [ ] Preguntas aleatorias de repaso (el motor de sugerencias ya elige qué tema toca).
- [ ] Revisar el temario contra la fuente oficial de la Generalitat y ajustar los bloques.
- [ ] Actualizar `PAU_TARGET` cuando se publique el calendario oficial de 2027.
