-- ============================================================================
-- BioPAU — Esquema de base de datos (Supabase / Postgres)
-- Ejecútalo en: Supabase → SQL Editor → New query → Run.
-- Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- ============================================================================

-- 1) Tabla de perfiles (1:1 con auth.users, que gestiona Supabase Auth)
create table if not exists public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  username                text not null,
  email                   text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  stripe_customer_id      text unique,
  stripe_subscription_id  text,
  subscription_status     text not null default 'none',   -- none | active | trialing | past_due | canceled | incomplete
  plan                    text,                            -- monthly | annual
  payment_status          text not null default 'none'     -- none | paid | failed
);

-- Unicidad de username sin distinguir mayúsculas/minúsculas
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

-- 2) Row-Level Security
alter table public.profiles enable row level security;

-- Un usuario solo puede LEER su propia fila
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Un usuario solo puede ACTUALIZAR su propia fila...
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3) Seguridad a nivel de COLUMNA:
--    El usuario autenticado solo puede tocar "username" y "updated_at".
--    Los campos de facturación (subscription_status, payment_status, plan,
--    stripe_*) SOLO los puede escribir el webhook con la service_role key.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (username, updated_at) on public.profiles to authenticated;
-- (anon no tiene ningún acceso directo a la tabla)

-- 4) Al crear un usuario en Auth, se crea automáticamente su perfil.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), 'user_' || substr(new.id::text, 1, 8)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) Mantener updated_at al día en cambios del propio usuario
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 6) Comprobar disponibilidad de username SIN exponer datos de otros perfiles.
--    Se llama desde el navegador (anon/authenticated) vía supabase.rpc().
create or replace function public.username_available(name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(trim(name))
  );
$$;

grant execute on function public.username_available(text) to anon, authenticated;

-- ============================================================================
-- Listo. Recuerda en Supabase → Authentication → Providers → Email:
--   • Deja activada la confirmación por email en PRODUCCIÓN (recomendado).
--   • Para pruebas rápidas puedes desactivar "Confirm email" temporalmente.
-- Y en Authentication → URL Configuration añade tu dominio a "Redirect URLs":
--   https://tu-dominio.vercel.app/actualizar-password.html
-- ============================================================================
