# BioPAU — Web + Usuarios (Supabase) + Pagos (Stripe) en Vercel

Tu landing sigue intacta. Alrededor se ha añadido autenticación real y pagos con Stripe,
todo en un proyecto desplegable en Vercel. **Nada de auth con `localStorage`, ninguna clave
secreta en el navegador, y el precio lo decide el servidor.**

---

## 1. Arquitectura elegida (y por qué)

- **Frontend estático** (tu HTML/CSS/JS, sin framework) servido por **Vercel**.
- **Supabase** para **Auth** (email/contraseña, recuperación, sesiones con JWT) y **Postgres** con **RLS**.
- **Stripe Checkout** (página de pago alojada) + **webhook** verificado + **Customer Portal**.
- **Funciones serverless** en `/api` (Node.js en Vercel) para todo lo que necesita la clave secreta.

Es la combinación más estándar, segura y mantenible partiendo de un HTML: secretos solo en el
servidor, control de acceso real en base de datos (RLS) y despliegue en un solo sitio.

> La sesión se guarda como **JWT firmado por Supabase** (no es "auth de `localStorage`"): el token
> se verifica en el servidor en cada operación sensible y RLS restringe los datos por usuario.

---

## 2. Estructura del proyecto

```
index.html                     Tu landing (editada al mínimo)
precios.html                   Planes y botón de compra
login.html · registro.html     Acceso y alta
recuperar-password.html        Solicitar enlace de recuperación
actualizar-password.html       Fijar nueva contraseña (desde el email)
cuenta.html                    Perfil + gestionar suscripción (protegida)
checkout-success.html          Vuelta OK de Stripe
checkout-cancel.html           Vuelta cancelada de Stripe
app/index.html                 Área privada (solo suscriptores)

css/auth.css                   Estilos de las páginas nuevas (reusa tus tokens)
js/config.js                   Claves PÚBLICAS (Supabase URL/anon, Stripe publishable)
js/supabaseClient.js           Crea el cliente de Supabase
js/auth.js                     Núcleo: nav de sesión, guards, registro/login/recuperación
js/account.js                  Lógica de /cuenta
js/pricing.js                  Lógica de /precios (checkout)
js/checkout-success.js         Confirma el acceso tras el pago
js/app-gate.js                 Saludo del área privada

api/create-checkout-session.js Crea el pago (el servidor fija el precio)
api/stripe-webhook.js          Recibe y VERIFICA eventos de Stripe → actualiza BD
api/create-portal-session.js   Abre el portal de facturación de Stripe

supabase/schema.sql            Tablas + RLS + trigger + función de username
package.json · vercel.json     Config del proyecto
.env.example · .gitignore      Variables y exclusiones
```

---

## 3. Puesta en marcha — paso a paso

### A) Supabase (auth + base de datos)
1. Crea un proyecto en https://supabase.com.
2. **SQL Editor → New query** → pega el contenido de `supabase/schema.sql` → **Run**.
3. **Authentication → Providers → Email**: deja **Confirm email** activado (recomendado en producción).
   Para pruebas rápidas puedes desactivarlo y así el registro inicia sesión al instante.
4. **Authentication → URL Configuration → Redirect URLs**: añade
   `https://TU-DOMINIO/actualizar-password.html` (y la de localhost si pruebas en local).
5. **Project Settings → API**: copia **Project URL** y **anon key** (públicas) y **service_role** (secreta).

### B) Stripe (pagos)
1. Entra en https://dashboard.stripe.com con **Test mode** activado.
2. **Products → Add product**: "BioPAU".
   - Precio **recurrente mensual**: **2,99 € / mes** → copia su **API ID** (`price_...`) → `STRIPE_PRICE_MONTHLY`.
   - (Opcional) Precio **recurrente anual** (p. ej. 29,99 €/año) → `STRIPE_PRICE_ANNUAL`.
3. **Developers → API keys**: copia **Secret key** (`sk_test_...`) y **Publishable key** (`pk_test_...`).
4. **Customer portal**: actívalo en https://dashboard.stripe.com/test/settings/billing/portal (Save).
5. **Webhook** (después de desplegar, cuando ya tengas la URL):
   **Developers → Webhooks → Add endpoint** → URL: `https://TU-DOMINIO/api/stripe-webhook`
   Eventos a escuchar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   Copia el **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`.

### C) Rellenar claves
- **Públicas (navegador):** edita `js/config.js` con tu `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `STRIPE_PUBLISHABLE_KEY`, `HAS_ANNUAL` y las etiquetas de precio.
- **Secretas (servidor):** en Vercel → **Settings → Environment Variables**, añade las de
  `.env.example` (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL, APP_URL).

### D) Desplegar en Vercel
1. Sube el proyecto a un repositorio (GitHub/GitLab) o usa `vercel` CLI.
2. **Import Project** en https://vercel.com → detecta las funciones de `/api` automáticamente.
3. Añade las variables de entorno (paso C) y **Deploy**.
4. Copia la URL final y ponla en `APP_URL` (y en el webhook de Stripe, paso B5). Redeploy si hace falta.

---

## 4. Variables de entorno

| Variable | Dónde | Secreta | Para qué |
|---|---|---|---|
| `SUPABASE_URL` | Vercel + `js/config.js` | No | Proyecto Supabase |
| `SUPABASE_ANON_KEY` | `js/config.js` | No (protegida por RLS) | Cliente del navegador |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | **Sí** | Webhook/funciones escriben la BD |
| `STRIPE_PUBLISHABLE_KEY` | `js/config.js` | No | Frontend (opcional con redirect) |
| `STRIPE_SECRET_KEY` | Vercel | **Sí** | Crear checkout/portal |
| `STRIPE_WEBHOOK_SECRET` | Vercel | **Sí** | Verificar firma del webhook |
| `STRIPE_PRICE_MONTHLY` | Vercel | No | Precio mensual (2,99 €) |
| `STRIPE_PRICE_ANNUAL` | Vercel | No | Precio anual (opcional) |
| `APP_URL` | Vercel | No | URLs de retorno de Stripe |

---

## 5. Base de datos

Supabase gestiona `auth.users` (credenciales, hash de contraseña). Añadimos **`public.profiles`** (1:1):

`id · username(único, sin distinguir mayúsculas) · email · created_at · updated_at ·
stripe_customer_id · stripe_subscription_id · subscription_status · plan · payment_status`

**Seguridad (RLS + privilegios de columna):**
- Cada usuario **solo lee/edita su propia fila**.
- El usuario **solo puede cambiar `username`**; los campos de facturación **solo** los escribe el
  webhook con la *service_role* (el usuario **no** puede auto-activarse el pago).
- Un **trigger** crea el perfil al registrarse; una función `username_available()` permite comprobar
  el nombre sin exponer datos de otros.

---

## 6. Autenticación (cómo funciona)

- **Registro:** valida en cliente, comprueba `username` libre, `supabase.auth.signUp` con el username
  en metadatos. Si la confirmación por email está activada, se avisa; si no, inicia sesión y redirige.
- **Login:** `signInWithPassword`, con estados de carga y errores claros (sin filtrar detalles).
- **Recuperación:** `resetPasswordForEmail` → email con enlace → `actualizar-password.html` fija la
  nueva con `updateUser`. Respuesta neutra para no revelar si el email existe.
- **Sesión:** JWT persistente y auto-refrescado. La nav muestra *Entrar/Empieza* o *Mi cuenta* según sesión.

---

## 7. Stripe (checkout y webhooks)

- **Checkout:** el navegador solo manda el **plan** (`monthly`/`annual`). El servidor mapea plan→`price_id`
  desde variables de entorno, crea/reutiliza el cliente y abre **Stripe Checkout** (modo suscripción).
- **Webhook:** verifica la **firma** y actualiza `profiles` con la *service_role*. Es la **única** fuente de
  verdad del estado de pago. Maneja alta, actualización, cancelación, renovación y pago fallido.
- **Portal:** desde *Mi cuenta*, el usuario gestiona/cancela su suscripción en el portal de Stripe.
- **Acceso premium:** `body[data-requires-plan]` en `/app` verifica sesión **y** suscripción activa contra
  el servidor antes de mostrar nada. El contenido premium real debe servirse autenticado (BD/función),
  no incrustado en HTML estático.

---

## 8. Pruebas (Stripe Test Mode)

Tarjetas de test de Stripe:
- **Pago correcto:** `4242 4242 4242 4242`, fecha futura, CVC cualquiera.
- **Pago rechazado:** `4000 0000 0000 0002`.
- **Requiere autenticación (3DS):** `4000 0025 0000 3155`.

Webhook en local (opcional) con Stripe CLI:
```
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
# usa el whsec_... que imprime como STRIPE_WEBHOOK_SECRET en local
```

Checklist:
- [ ] Registro correcto / email duplicado / username duplicado / contraseñas distintas / contraseña débil.
- [ ] Login correcto / contraseña incorrecta / usuario inexistente / logout / sesión persistente.
- [ ] Recuperación: solicitar, enlace válido, enlace caducado, cambio de contraseña.
- [ ] Checkout correcto / cancelado / rechazado; webhook actualiza `subscription_status`.
- [ ] Usuario sin sesión no entra a `/app` (redirige a login).
- [ ] Usuario sin pago no entra a `/app` (redirige a precios).
- [ ] Un usuario no puede leer datos de otro (RLS) ni cambiar su estado de pago.

---

## 9. Notas de seguridad ya aplicadas

- Clave secreta de Stripe y service_role **solo en el servidor**.
- Precio/producto **fijado por el servidor** (no se acepta importe del navegador).
- Estado de pago **solo** vía **webhook con firma verificada**.
- **RLS** + privilegios de columna: aislamiento entre usuarios y campos de facturación bloqueados.
- Mensajes de error sin *stack traces* ni secretos.

---

## 10. Ejecutar en local (opcional)

Con Vercel CLI (recomendado, levanta también las funciones `/api`):
```
npm i -g vercel
npm install
vercel dev
# crea un .env.local con las variables de .env.example
```
La web quedará en `http://localhost:3000`. Ajusta `APP_URL=http://localhost:3000` y las Redirect URLs
de Supabase para probar en local.
