-- ============================================================================
-- BioPAU — Esquema del Dashboard VIP (progreso, racha, avatar, calendario)
-- Ejecútalo DESPUÉS de schema.sql en: Supabase → SQL Editor → New query → Run.
-- Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- ============================================================================

-- 1) Estadísticas del alumno (una fila por usuario)
create table if not exists public.user_stats (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  avatar_id       text not null default 'cell',
  streak_days     int  not null default 0,
  longest_streak  int  not null default 0,
  last_study_date date,
  updated_at      timestamptz not null default now()
);

-- 2) Progreso por tema (los ids vienen de js/study-data.js)
create table if not exists public.topic_progress (
  user_id         uuid not null references auth.users(id) on delete cascade,
  topic_id        text not null,
  status          text not null default 'pending',  -- pending | in_progress | done
  last_reviewed_at timestamptz,
  times_reviewed  int not null default 0,
  updated_at      timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- 3) Días marcados en el calendario/tracker de estudio
create table if not exists public.study_days (
  user_id   uuid not null references auth.users(id) on delete cascade,
  day       date not null,
  minutes   int  not null default 0,
  note      text,
  primary key (user_id, day)
);

-- ---------------------------------------------------------------------------
-- Row-Level Security: cada alumno SOLO ve y edita sus propios datos
-- ---------------------------------------------------------------------------
alter table public.user_stats     enable row level security;
alter table public.topic_progress enable row level security;
alter table public.study_days     enable row level security;

do $$
declare t text;
begin
  foreach t in array array['user_stats','topic_progress','study_days'] loop
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

grant select, insert, update, delete on public.user_stats     to authenticated;
grant select, insert, update, delete on public.topic_progress to authenticated;
grant select, insert, update, delete on public.study_days     to authenticated;

-- ---------------------------------------------------------------------------
-- 4) Racha calculada EN EL SERVIDOR (no manipulable desde el navegador):
--    se llama al abrir el dashboard. Si el último día fue ayer, suma 1;
--    si fue hoy, no hace nada; si fue antes, reinicia a 1.
-- ---------------------------------------------------------------------------
create or replace function public.touch_streak()
returns public.user_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row public.user_stats;
begin
  if uid is null then
    raise exception 'No autenticado';
  end if;

  insert into public.user_stats (user_id, last_study_date, streak_days, longest_streak)
  values (uid, current_date, 1, 1)
  on conflict (user_id) do nothing;

  select * into row from public.user_stats where user_id = uid;

  if row.last_study_date is null or row.last_study_date < current_date - 1 then
    row.streak_days := 1;                       -- se rompió la racha
  elsif row.last_study_date = current_date - 1 then
    row.streak_days := row.streak_days + 1;     -- día consecutivo
  end if;                                       -- si es hoy, se mantiene

  update public.user_stats
     set streak_days    = row.streak_days,
         longest_streak = greatest(coalesce(longest_streak, 0), row.streak_days),
         last_study_date = current_date,
         updated_at     = now()
   where user_id = uid
   returning * into row;

  -- registrar el día en el calendario de estudio
  insert into public.study_days (user_id, day)
  values (uid, current_date)
  on conflict (user_id, day) do nothing;

  return row;
end;
$$;

grant execute on function public.touch_streak() to authenticated;

-- ---------------------------------------------------------------------------
-- 5) Marcar el estado de un tema (crea la fila si no existe)
-- ---------------------------------------------------------------------------
create or replace function public.set_topic_status(p_topic_id text, p_status text)
returns public.topic_progress
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  row public.topic_progress;
begin
  if uid is null then raise exception 'No autenticado'; end if;
  if p_status not in ('pending','in_progress','done') then
    raise exception 'Estado no válido';
  end if;

  insert into public.topic_progress (user_id, topic_id, status, last_reviewed_at, times_reviewed)
  values (uid, p_topic_id, p_status, now(), 1)
  on conflict (user_id, topic_id) do update
    set status = excluded.status,
        last_reviewed_at = now(),
        times_reviewed = public.topic_progress.times_reviewed + 1,
        updated_at = now()
  returning * into row;

  return row;
end;
$$;

grant execute on function public.set_topic_status(text, text) to authenticated;

-- ============================================================================
-- Listo. El dashboard funciona aunque un alumno todavía no tenga filas:
-- se crean solas la primera vez que entra.
-- ============================================================================
