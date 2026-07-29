-- =============================================================
--  Gestion du stock des illustrations physiques
--  ------------------------------------------------------------
--  Modèle : réservation à la création de la session Stripe,
--  confirmation au webhook `checkout.session.completed`,
--  libération automatique à l'expiration (TTL) ou à
--  `checkout.session.expired`.
--
--  → `illustration_stock.quantity` = stock DISPONIBLE à la vente
--    (les réservations en cours sont déjà déduites).
--  → Une illustration SANS ligne dans `illustration_stock` est
--    considérée comme non suivie = stock illimité.
--
--  Script idempotent : peut être rejoué sans risque.
-- =============================================================

-- ── 1. Tables ────────────────────────────────────────────────

create table if not exists public.illustration_stock (
  contentful_id text primary key,
  quantity      integer     not null default 0,
  updated_at    timestamptz not null default now()
);

-- Colonnes ajoutées si la table préexiste
alter table public.illustration_stock
  add column if not exists quantity integer not null default 0;
alter table public.illustration_stock
  add column if not exists updated_at timestamptz not null default now();

-- Le stock ne peut jamais devenir négatif
do $$
begin
  alter table public.illustration_stock
    add constraint illustration_stock_quantity_non_negative check (quantity >= 0);
exception
  when duplicate_object then null;
end
$$;

-- Journal des réservations : une ligne par (session Stripe, illustration)
create table if not exists public.stock_reservations (
  stripe_session_id text        not null,
  contentful_id     text        not null,
  quantity          integer     not null check (quantity > 0),
  status            text        not null default 'reserved'
                                check (status in ('reserved', 'confirmed', 'released')),
  expires_at        timestamptz not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  primary key (stripe_session_id, contentful_id)
);

create index if not exists stock_reservations_expiry_idx
  on public.stock_reservations (status, expires_at);

create index if not exists stock_reservations_contentful_idx
  on public.stock_reservations (contentful_id);

-- ── 2. RLS ───────────────────────────────────────────────────

alter table public.illustration_stock enable row level security;

drop policy if exists illustration_stock_public_read on public.illustration_stock;
create policy illustration_stock_public_read
  on public.illustration_stock
  for select
  to anon, authenticated
  using (true);

-- Aucune policy d'écriture : seul le service_role (webhook / checkout) écrit.

alter table public.stock_reservations enable row level security;
-- Aucune policy : table strictement réservée au service_role.

-- ── 3. Helpers ───────────────────────────────────────────────

-- Normalise le payload JSON `[{contentful_id, quantity}, ...]`
-- (agrège les doublons, force quantity >= 1)
create or replace function public.stock_request_items(p_items jsonb)
returns table (contentful_id text, quantity integer)
language sql
immutable
as $$
  select (i ->> 'contentful_id')::text,
         sum(greatest(coalesce((i ->> 'quantity')::integer, 1), 1))::integer
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) as i
  where coalesce(i ->> 'contentful_id', '') <> ''
  group by 1;
$$;

-- Libère les réservations expirées et restitue le stock.
-- Appelée en amont de chaque lecture/réservation → pas besoin de pg_cron.
create or replace function public.release_expired_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  with expired as (
    update public.stock_reservations
       set status = 'released', updated_at = now()
     where status = 'reserved'
       and expires_at < now()
    returning contentful_id, quantity
  ),
  grouped as (
    select contentful_id, sum(quantity)::integer as quantity
    from expired
    group by 1
  )
  update public.illustration_stock s
     set quantity = s.quantity + g.quantity,
         updated_at = now()
    from grouped g
   where s.contentful_id = g.contentful_id;

  get diagnostics v_count = row_count;
  return coalesce(v_count, 0);
end;
$$;

-- ── 4. Lecture / validation (appelable côté client) ──────────

-- Vérifie la disponibilité sans rien modifier.
-- Retour : { ok, items: [{ contentful_id, requested, available, tracked, ok }] }
create or replace function public.check_stock(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
begin
  perform public.release_expired_reservations();

  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'contentful_id', r.contentful_id,
               'requested',     r.quantity,
               'available',     s.quantity,           -- null si non suivi
               'tracked',       s.contentful_id is not null,
               'ok',            s.contentful_id is null or s.quantity >= r.quantity
             )
             order by r.contentful_id
           ),
           '[]'::jsonb
         )
    into v_items
    from public.stock_request_items(p_items) r
    left join public.illustration_stock s on s.contentful_id = r.contentful_id;

  return jsonb_build_object(
    'ok', not exists (
      select 1
      from public.stock_request_items(p_items) r
      join public.illustration_stock s on s.contentful_id = r.contentful_id
      where s.quantity < r.quantity
    ),
    'items', v_items
  );
end;
$$;

-- ── 5. Réservation / confirmation / libération (service_role) ─

-- Réserve le stock pour une session Stripe.
-- Atomique : verrouillage `for update` des lignes concernées,
-- puis vérification + décrément dans la même transaction.
-- Retour : { ok, reserved, already_reserved, unavailable: [...] }
create or replace function public.reserve_stock(
  p_session_id    text,
  p_items         jsonb,
  p_ttl_minutes   integer default 40
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_unavailable jsonb := '[]'::jsonb;
  v_reserved    integer := 0;
begin
  if coalesce(p_session_id, '') = '' then
    raise exception 'reserve_stock: p_session_id requis';
  end if;

  perform public.release_expired_reservations();

  -- Rejeu (retry réseau) : la session a déjà sa réservation
  if exists (
    select 1 from public.stock_reservations
     where stripe_session_id = p_session_id
       and status in ('reserved', 'confirmed')
  ) then
    return jsonb_build_object(
      'ok', true, 'reserved', 0, 'already_reserved', true, 'unavailable', '[]'::jsonb
    );
  end if;

  -- Verrouillage déterministe (ordre alphabétique) → pas d'interblocage
  -- entre deux sessions qui réservent les mêmes illustrations.
  perform 1
    from public.illustration_stock s
    join public.stock_request_items(p_items) r on r.contentful_id = s.contentful_id
   order by s.contentful_id
     for update of s;

  -- Lignes insuffisantes (les illustrations non suivies sont ignorées)
  select coalesce(
           jsonb_agg(
             jsonb_build_object(
               'contentful_id', r.contentful_id,
               'requested',     r.quantity,
               'available',     s.quantity
             )
             order by r.contentful_id
           ),
           '[]'::jsonb
         )
    into v_unavailable
    from public.stock_request_items(p_items) r
    join public.illustration_stock s on s.contentful_id = r.contentful_id
   where s.quantity < r.quantity;

  if jsonb_array_length(v_unavailable) > 0 then
    return jsonb_build_object('ok', false, 'reserved', 0, 'unavailable', v_unavailable);
  end if;

  update public.illustration_stock s
     set quantity = s.quantity - r.quantity,
         updated_at = now()
    from public.stock_request_items(p_items) r
   where s.contentful_id = r.contentful_id;

  insert into public.stock_reservations
    (stripe_session_id, contentful_id, quantity, status, expires_at)
  select p_session_id, r.contentful_id, r.quantity, 'reserved',
         now() + make_interval(mins => greatest(p_ttl_minutes, 1))
    from public.stock_request_items(p_items) r
    join public.illustration_stock s on s.contentful_id = r.contentful_id
  on conflict (stripe_session_id, contentful_id) do update
     set quantity   = excluded.quantity,
         status     = 'reserved',
         expires_at = excluded.expires_at,
         updated_at = now();

  get diagnostics v_reserved = row_count;

  return jsonb_build_object(
    'ok', true, 'reserved', v_reserved, 'already_reserved', false, 'unavailable', '[]'::jsonb
  );
end;
$$;

-- Confirme la vente : la réservation devient définitive.
-- Retour : { action, confirmed }
--   action = 'confirmed'        → réservation transformée en vente
--            'already_confirmed'→ webhook rejoué, rien à faire
--            'reclaimed'        → réservation expirée entre-temps, stock redéduit
--            'none'             → aucune réservation (→ décrément direct côté appelant)
create or replace function public.confirm_stock(p_session_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
  v_row   record;
begin
  if coalesce(p_session_id, '') = '' then
    raise exception 'confirm_stock: p_session_id requis';
  end if;

  update public.stock_reservations
     set status = 'confirmed', updated_at = now()
   where stripe_session_id = p_session_id
     and status = 'reserved';

  get diagnostics v_count = row_count;
  if v_count > 0 then
    return jsonb_build_object('action', 'confirmed', 'confirmed', v_count);
  end if;

  if exists (
    select 1 from public.stock_reservations
     where stripe_session_id = p_session_id and status = 'confirmed'
  ) then
    return jsonb_build_object('action', 'already_confirmed', 'confirmed', 0);
  end if;

  -- Réservation libérée (TTL) mais paiement finalement encaissé :
  -- on redéduit le stock, borné à 0.
  for v_row in
    select contentful_id, quantity
      from public.stock_reservations
     where stripe_session_id = p_session_id
       and status = 'released'
     order by contentful_id
       for update
  loop
    update public.illustration_stock
       set quantity = greatest(quantity - v_row.quantity, 0),
           updated_at = now()
     where contentful_id = v_row.contentful_id;

    update public.stock_reservations
       set status = 'confirmed', updated_at = now()
     where stripe_session_id = p_session_id
       and contentful_id = v_row.contentful_id;

    v_count := v_count + 1;
  end loop;

  if v_count > 0 then
    return jsonb_build_object('action', 'reclaimed', 'confirmed', v_count);
  end if;

  return jsonb_build_object('action', 'none', 'confirmed', 0);
end;
$$;

-- Libère une réservation (session annulée / expirée). Idempotent.
create or replace function public.release_stock(p_session_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if coalesce(p_session_id, '') = '' then
    raise exception 'release_stock: p_session_id requis';
  end if;

  with released as (
    update public.stock_reservations
       set status = 'released', updated_at = now()
     where stripe_session_id = p_session_id
       and status = 'reserved'
    returning contentful_id, quantity
  ),
  grouped as (
    select contentful_id, sum(quantity)::integer as quantity
    from released
    group by 1
  )
  update public.illustration_stock s
     set quantity = s.quantity + g.quantity,
         updated_at = now()
    from grouped g
   where s.contentful_id = g.contentful_id;

  get diagnostics v_count = row_count;
  return coalesce(v_count, 0);
end;
$$;

-- Décrément direct, borné à 0 — filet de sécurité du webhook quand
-- aucune réservation n'existe (session créée avant cette feature,
-- paiement hors tunnel, etc.). Le paiement étant déjà encaissé, on
-- n'échoue jamais : on signale le sur-stock vendu via `oversold`.
create or replace function public.decrement_stock(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row      record;
  v_before   integer;
  v_applied  integer := 0;
  v_oversold jsonb := '[]'::jsonb;
begin
  for v_row in
    select r.contentful_id, r.quantity
      from public.stock_request_items(p_items) r
     order by r.contentful_id
  loop
    select quantity into v_before
      from public.illustration_stock
     where contentful_id = v_row.contentful_id
       for update;

    if not found then
      continue;                       -- illustration non suivie
    end if;

    if v_before < v_row.quantity then
      v_oversold := v_oversold || jsonb_build_object(
        'contentful_id', v_row.contentful_id,
        'requested',     v_row.quantity,
        'available',     v_before
      );
    end if;

    update public.illustration_stock
       set quantity = greatest(v_before - v_row.quantity, 0),
           updated_at = now()
     where contentful_id = v_row.contentful_id;

    v_applied := v_applied + 1;
  end loop;

  return jsonb_build_object('applied', v_applied, 'oversold', v_oversold);
end;
$$;

-- ── 6. Droits d'exécution ────────────────────────────────────

revoke all on function public.stock_request_items(jsonb)          from public;
revoke all on function public.release_expired_reservations()      from public;
revoke all on function public.check_stock(jsonb)                  from public;
revoke all on function public.reserve_stock(text, jsonb, integer) from public;
revoke all on function public.confirm_stock(text)                 from public;
revoke all on function public.release_stock(text)                 from public;
revoke all on function public.decrement_stock(jsonb)              from public;

-- Lecture seule : ouverte au client
grant execute on function public.check_stock(jsonb) to anon, authenticated, service_role;

-- Écriture : serveur uniquement (Netlify Functions avec la service role key)
grant execute on function public.stock_request_items(jsonb)          to service_role;
grant execute on function public.release_expired_reservations()      to service_role;
grant execute on function public.reserve_stock(text, jsonb, integer) to service_role;
grant execute on function public.confirm_stock(text)                 to service_role;
grant execute on function public.release_stock(text)                 to service_role;
grant execute on function public.decrement_stock(jsonb)              to service_role;

-- ── 7. Alimentation du stock (exemple) ───────────────────────
-- insert into public.illustration_stock (contentful_id, quantity)
-- values ('3aBcD...', 5)
-- on conflict (contentful_id) do update set quantity = excluded.quantity, updated_at = now();
