-- ============================================================================
-- BioPAU — Perfil personal del estudiante (Fase A: personalización)
-- ----------------------------------------------------------------------------
-- Ejecuta este archivo UNA VEZ en Supabase → SQL Editor → New query → Run.
-- Crea la tabla student_profile (1 fila por usuario) con RLS: cada estudiante
-- solo puede leer y escribir SU propia fila.
-- No toca ninguna tabla existente. Es seguro ejecutarlo varias veces.
-- ============================================================================

create table if not exists public.student_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- ---- Datos personales ----
  first_name   text,
  last_name    text,
  nickname     text,              -- cómo quiere que bioPau se dirija a él/ella
  photo_url    text,
  phone        text,
  birthdate    date,
  city         text,
  region       text,              -- comunidad autónoma
  school       text,              -- instituto / centro
  course       text,              -- curso actual (p. ej. 2n Batxillerat)
  modality     text,              -- modalidad de bachillerato
  language     text default 'es', -- idioma preferido (es / ca)
  timezone     text,

  -- ---- Objetivo / "Mi futuro" ----
  career_goal      text,          -- carrera a la que aspira
  university_goal  text,          -- universidad objetivo
  university_2     text,          -- segunda opción
  city_goal        text,          -- ciudad donde quiere estudiar
  career_reason    text,          -- por qué quiere esa carrera
  career_dream     text,          -- sueño relacionado
  target_grade     numeric(6,3),  -- nota de acceso objetivo (p. ej. 12.450)
  cutoff_grade     numeric(6,3),  -- nota de corte de referencia
  main_motivation  text,          -- motivación principal (corto)

  -- ---- Personalización ----
  assistant_tone text default 'motivador',  -- motivador|exigente|tranquilo|amigo|coach|minimalista
  accent_color   text default 'lime',       -- acento de perfil
  theme          text default 'dark',        -- dark|light|auto
  avatar_style   text,                        -- minimalista|cartoon|profesional|...
  avatar_id      text,                        -- id del avatar SVG existente
  personal_quote text,                        -- "Mi frase"
  motivation_text text,                       -- "Mi motivación" (texto libre)

  -- ---- Académico extra ----
  exam_date    date,               -- fecha PAU/Selectividad (si la personaliza)
  academic     jsonb default '{}'::jsonb,  -- asignaturas, notas, fuertes/débiles…

  -- ---- Estado / meta ----
  onboarding_completed boolean default false,

  -- ---- Flexible (preferencias, widgets, privacidad, notificaciones…) ----
  prefs jsonb default '{}'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Mantener updated_at
create or replace function public.touch_student_profile()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_touch_student_profile on public.student_profile;
create trigger trg_touch_student_profile
  before update on public.student_profile
  for each row execute function public.touch_student_profile();

-- ---- Seguridad por filas ----
alter table public.student_profile enable row level security;

drop policy if exists sp_select on public.student_profile;
create policy sp_select on public.student_profile
  for select using (auth.uid() = user_id);

drop policy if exists sp_insert on public.student_profile;
create policy sp_insert on public.student_profile
  for insert with check (auth.uid() = user_id);

drop policy if exists sp_update on public.student_profile;
create policy sp_update on public.student_profile
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- (No hace falta delete: al borrar el usuario, on delete cascade limpia la fila.)
