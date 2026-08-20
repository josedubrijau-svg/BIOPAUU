-- ============================================================================
-- BioPAU — Calendario/Tracker v2 (anotaciones, tareas, temas del día y
-- fechas control). Ejecútalo en Supabase → SQL Editor → New query → Run.
-- Es idempotente y NO borra los días que ya tengas marcados.
-- ============================================================================

-- 1) Ampliar la tabla de días de estudio que ya existe -----------------------
--    (si aún no la tienes, ejecuta antes dashboard-schema.sql)
create table if not exists public.study_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null,
  minutes int  not null default 0,
  note    text,
  primary key (user_id, day)
);

-- Campos nuevos: tareas del día (checklist) y minutos objetivo
alter table public.study_days add column if not exists tasks jsonb not null default '[]';
alter table public.study_days add column if not exists mood  text;

-- 2) Temas estudiados en un día concreto ------------------------------------
--    Un mismo tema puede aparecer en varios días (repasos).
create table if not exists public.day_topics (
  id       bigserial primary key,
  user_id  uuid not null references auth.users(id) on delete cascade,
  day      date not null,
  topic_id text not null,                      -- id de js/study-data.js
  estado   text not null default 'en_progreso',-- en_progreso | repasando | completado
  minutos  int  not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists day_topics_user_day_idx on public.day_topics (user_id, day);
create unique index if not exists day_topics_unique_idx on public.day_topics (user_id, day, topic_id);

-- 3) Fechas control (exámenes, entregas, hitos) ------------------------------
create table if not exists public.control_dates (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  day        date not null,
  titulo     text not null,
  tipo       text not null default 'examen',   -- examen | entrega | hito
  color      text,
  bloques    jsonb not null default '[]',      -- ids de bloques que entran
  created_at timestamptz not null default now()
);
create index if not exists control_dates_user_day_idx on public.control_dates (user_id, day);

-- ---------------------------------------------------------------------------
-- RLS: cada alumno solo ve y edita lo suyo
-- ---------------------------------------------------------------------------
alter table public.study_days    enable row level security;
alter table public.day_topics    enable row level security;
alter table public.control_dates enable row level security;

do $$
declare t text;
begin
  foreach t in array array['study_days','day_topics','control_dates'] loop
    execute format('drop policy if exists "%1$s_select_own" on public.%1$I', t);
    execute format('create policy "%1$s_select_own" on public.%1$I for select using (auth.uid() = user_id)', t);
    execute format('drop policy if exists "%1$s_insert_own" on public.%1$I', t);
    execute format('create policy "%1$s_insert_own" on public.%1$I for insert with check (auth.uid() = user_id)', t);
    execute format('drop policy if exists "%1$s_update_own" on public.%1$I', t);
    execute format('create policy "%1$s_update_own" on public.%1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('drop policy if exists "%1$s_delete_own" on public.%1$I', t);
    execute format('create policy "%1$s_delete_own" on public.%1$I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

grant select, insert, update, delete on public.study_days    to authenticated;
grant select, insert, update, delete on public.day_topics    to authenticated;
grant select, insert, update, delete on public.control_dates to authenticated;
grant usage, select on sequence public.day_topics_id_seq    to authenticated;
grant usage, select on sequence public.control_dates_id_seq to authenticated;

-- ============================================================================
-- Listo. El calendario funciona aunque no tengas ninguna fecha control:
-- en ese caso el motor de recomendación usa la fecha de la PAU como objetivo.
-- ============================================================================
