-- ============================================================================
-- GANGSTERS CLUB — PostgreSQL schema for Supabase
-- Run this in the Supabase SQL editor.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type membership_status as enum ('active', 'suspended', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_status as enum ('draft', 'published', 'unpublished');
exception when duplicate_object then null; end $$;

do $$ begin
  create type announcement_target as enum ('all_members', 'public');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_visibility as enum ('public', 'members');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'application_approved','application_rejected','application_received',
    'announcement','event','membership_status','vault','general'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- PROFILES  (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  full_name     text not null,
  email         text not null,
  role          user_role not null default 'member',
  -- lifecycle: pending (application in review) / active / suspended / inactive
  status        text not null default 'pending',
  avatar_url    text,
  phone         text,
  city          text,
  date_of_birth date,
  bio           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_profiles_role   on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);

-- ---------------------------------------------------------------------------
-- MEMBERSHIP APPLICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.membership_applications (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references public.profiles(id) on delete set null,
  application_code text unique not null default ('APP-' || upper(encode(gen_random_bytes(6),'hex'))),
  full_name        text not null,
  username         text not null,
  email            text not null,
  phone            text,
  city             text,
  date_of_birth    date,
  profile_photo_url text,
  introduction     text not null,
  motivation       text not null,
  terms_accepted    boolean not null default false,
  status           application_status not null default 'pending',
  rejection_reason text,
  reviewed_by      uuid references public.profiles(id),
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_applications_status    on public.membership_applications(status);
create index if not exists idx_applications_created_at on public.membership_applications(created_at desc);
create index if not exists idx_applications_email      on public.membership_applications(email);
create index if not exists idx_applications_user       on public.membership_applications(user_id);

-- ---------------------------------------------------------------------------
-- MEMBERSHIPS  (issued only after approval)
-- ---------------------------------------------------------------------------
create table if not exists public.memberships (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  member_id     text unique not null,          -- GC-2026-000001
  level         text not null default 'Member',
  status        membership_status not null default 'active',
  member_since  timestamptz not null default now(),
  approved_by   uuid references public.profiles(id),
  application_id uuid references public.membership_applications(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_memberships_user_id on public.memberships(user_id);
create index if not exists idx_memberships_status  on public.memberships(status);

-- Human-readable member id sequence: GC-<year>-<6 digit padded>
create sequence if not exists public.member_id_seq start 1 increment 1;

create or replace function public.generate_member_id()
returns text as $$
  select 'GC-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.member_id_seq')::text, 6, '0');
$$ language sql volatile;

-- ---------------------------------------------------------------------------
-- MEMBER VERIFICATION (QR identity)
-- ---------------------------------------------------------------------------
create table if not exists public.member_verification (
  id             uuid primary key default uuid_generate_v4(),
  membership_id  uuid not null references public.memberships(id) on delete cascade,
  token          text unique not null default encode(gen_random_bytes(24),'hex'),
  qr_payload     text not null,               -- full /verify/<member_id> URL
  created_at     timestamptz not null default now()
);

create index if not exists idx_member_verification_token on public.member_verification(token);
create index if not exists idx_member_verification_membership on public.member_verification(membership_id);

-- ---------------------------------------------------------------------------
-- NEWS
-- ---------------------------------------------------------------------------
create table if not exists public.news (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  slug            text unique not null,
  cover_image_url text,
  excerpt         text not null,
  content         text not null,
  category        text not null default 'Club',
  author          text not null default 'Gangsters Club',
  status          content_status not null default 'draft',
  featured        boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_news_status       on public.news(status);
create index if not exists idx_news_published_at  on public.news(published_at desc);
create index if not exists idx_news_slug          on public.news(slug);
create index if not exists idx_news_featured      on public.news(featured) where status = 'published';

-- ---------------------------------------------------------------------------
-- ANNOUNCEMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  content       text not null,
  priority      text not null default 'normal',   -- low | normal | high
  target        announcement_target not null default 'all_members',
  status        content_status not null default 'draft',
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_announcements_status on public.announcements(status);
create index if not exists idx_announcements_target  on public.announcements(target);

-- ---------------------------------------------------------------------------
-- EVENTS
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text not null,
  event_date      date not null,
  event_time      text not null,
  location        text not null,
  cover_image_url text,
  visibility      event_visibility not null default 'public',
  rsvp_enabled    boolean not null default false,
  status          content_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_events_status     on public.events(status);
create index if not exists idx_events_event_date on public.events(event_date);
create index if not exists idx_events_visibility on public.events(visibility);

create table if not exists public.event_rsvps (
  id         uuid primary key default uuid_generate_v4(),
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  status     text not null default 'going',   -- going | not_going
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists idx_event_rsvps_event on public.event_rsvps(event_id);
create index if not exists idx_event_rsvps_user  on public.event_rsvps(user_id);

-- ---------------------------------------------------------------------------
-- THE VAULT  (member-only content)
-- ---------------------------------------------------------------------------
create table if not exists public.vault_content (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  slug            text unique not null,
  category        text not null default 'Intelligence',
  excerpt         text not null,
  content         text not null,
  cover_image_url text,
  status          content_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_vault_status on public.vault_content(status);
create index if not exists idx_vault_slug   on public.vault_content(slug);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       notification_type not null default 'general',
  title      text not null,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, read, created_at desc);

-- ---------------------------------------------------------------------------
-- ACTIVITY LOGS
-- ---------------------------------------------------------------------------
create table if not exists public.activity_logs (
  id         uuid primary key default uuid_generate_v4(),
  admin_id   uuid references public.profiles(id) on delete set null,
  action     text not null,
  target     text,
  target_id  text,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);
create index if not exists idx_activity_logs_admin     on public.activity_logs(admin_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  create trigger trg_profiles_updated   before update on public.profiles   for each row execute function public.touch_updated_at();
  create trigger trg_memberships_updated before update on public.memberships for each row execute function public.touch_updated_at();
  create trigger trg_news_updated       before update on public.news       for each row execute function public.touch_updated_at();
  create trigger trg_announcements_updated before update on public.announcements for each row execute function public.touch_updated_at();
  create trigger trg_events_updated     before update on public.events     for each row execute function public.touch_updated_at();
  create trigger trg_vault_updated      before update on public.vault_content for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- AUTO-CREATE PROFILE ON SIGNUP
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_base text;
  v_name text;
  v_i    int := 0;
begin
  -- Derive a username, then make it unique. Without the loop a duplicate
  -- username would raise a unique-violation from inside the auth trigger and
  -- surface to the visitor as an opaque signup error.
  v_base := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(coalesce(new.email, 'member'), '@', 1)
  );
  v_base := regexp_replace(v_base, '[^a-zA-Z0-9_.-]', '', 'g');
  if v_base = '' then v_base := 'member'; end if;

  v_name := v_base;
  while exists (select 1 from public.profiles where username = v_name) loop
    v_i := v_i + 1;
    v_name := v_base || v_i::text;
  end loop;

  insert into public.profiles (id, username, full_name, email, role, status)
  values (
    new.id,
    v_name,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'member'), '@', 1)),
    new.email,
    'member'::user_role,
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===========================================================================
-- SECURE SERVER-SIDE OPERATIONS (executed by the backend service role only)
-- ===========================================================================

-- APPROVE an application: creates membership + verification row atomically.
-- The optional p_public_url lets the backend pass PUBLIC_URL (env), so the QR
-- payload never depends on a database-level setting being configured.
-- The old 2-argument signature is dropped so PostgREST cannot hit an ambiguous
-- overload when this file is re-run against an existing project.
drop function if exists public.approve_application(uuid, uuid);

create or replace function public.approve_application(
  p_application_id uuid,
  p_admin_id uuid,
  p_public_url text default null
)
returns table (member_id text, user_id uuid) as $$
declare
  v_app        public.membership_applications;
  v_member_id  text;
  v_membership uuid;
  v_payload    text;
  v_base_url   text;
begin
  select * into v_app from public.membership_applications where id = p_application_id;
  if not found then raise exception 'Application not found'; end if;
  if v_app.status <> 'pending' then raise exception 'Application is not pending'; end if;

  v_member_id := public.generate_member_id();

  update public.membership_applications
     set status = 'approved', reviewed_by = p_admin_id, reviewed_at = now()
   where id = p_application_id;

  insert into public.memberships (user_id, member_id, status, member_since, approved_by, application_id)
  values (v_app.user_id, v_member_id, 'active', now(), p_admin_id, p_application_id)
  returning id into v_membership;

  update public.profiles
     set role = 'member'::user_role, status = 'active'
   where id = v_app.user_id;

  -- Resolution order: explicit caller value -> database setting -> safe default.
  v_base_url := coalesce(
    nullif(trim(p_public_url), ''),
    nullif(trim(current_setting('app.public_url', true)), ''),
    'https://gangstersclub.com'
  );
  v_payload := rtrim(v_base_url, '/') || '/verify/' || v_member_id;

  insert into public.member_verification (membership_id, qr_payload)
  values (v_membership, v_payload);

  insert into public.notifications (user_id, type, title, body)
  values (v_app.user_id, 'application_approved',
          'Welcome to Gangsters Club',
          'Your membership application has been approved. Your Member ID is ' || v_member_id || '.');

  return query select v_member_id, v_app.user_id;
end;
$$ language plpgsql security definer set search_path = public;

-- REJECT an application.
create or replace function public.reject_application(p_application_id uuid, p_admin_id uuid, p_reason text)
returns void as $$
declare v_app public.membership_applications;
begin
  select * into v_app from public.membership_applications where id = p_application_id;
  if not found then raise exception 'Application not found'; end if;
  if v_app.status <> 'pending' then raise exception 'Application is not pending'; end if;

  update public.membership_applications
     set status = 'rejected', rejection_reason = p_reason, reviewed_by = p_admin_id, reviewed_at = now()
   where id = p_application_id;

  update public.profiles set status = 'inactive' where id = v_app.user_id and status = 'pending';

  insert into public.notifications (user_id, type, title, body)
  values (v_app.user_id, 'application_rejected',
          'Membership application update',
          coalesce(nullif(p_reason,''), 'Your application was not approved at this time.'));
end;
$$ language plpgsql security definer set search_path = public;

-- SUSPEND a member.
create or replace function public.suspend_member(p_membership_id uuid, p_admin_id uuid, p_reason text)
returns void as $$
declare v_user uuid;
begin
  select user_id into v_user from public.memberships where id = p_membership_id;
  if not found then raise exception 'Membership not found'; end if;

  update public.memberships set status = 'suspended' where id = p_membership_id;
  update public.profiles  set status = 'suspended' where id = v_user;
  insert into public.notifications (user_id, type, title, body)
  values (v_user, 'membership_status', 'Membership suspended',
          coalesce(nullif(p_reason,''), 'Your membership has been suspended. Contact the club.'));
end;
$$ language plpgsql security definer set search_path = public;

-- REACTIVATE a member.
create or replace function public.reactivate_member(p_membership_id uuid, p_admin_id uuid)
returns void as $$
declare v_user uuid;
begin
  select user_id into v_user from public.memberships where id = p_membership_id;
  if not found then raise exception 'Membership not found'; end if;

  update public.memberships set status = 'active' where id = p_membership_id;
  update public.profiles  set status = 'active' where id = v_user;
  insert into public.notifications (user_id, type, title, body)
  values (v_user, 'membership_status', 'Membership reactivated',
          'Your Gangsters Club membership is active again. Welcome back.');
end;
$$ language plpgsql security definer set search_path = public;

-- PUBLIC verification lookup: returns only safe fields.
create or replace function public.verify_member(p_member_id text)
returns table (member_id text, full_name text, status text, member_since timestamptz, level text) as $$
  select m.member_id, p.full_name, m.status::text, m.member_since, m.level
    from public.memberships m
    join public.profiles p on p.id = m.user_id
   where m.member_id = upper(trim(p_member_id));
$$ language sql security definer stable set search_path = public;

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
alter table public.profiles               enable row level security;
alter table public.membership_applications enable row level security;
alter table public.memberships            enable row level security;
alter table public.member_verification    enable row level security;
alter table public.news                   enable row level security;
alter table public.announcements          enable row level security;
alter table public.events                 enable row level security;
alter table public.event_rsvps            enable row level security;
alter table public.vault_content          enable row level security;
alter table public.notifications          enable row level security;
alter table public.activity_logs          enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'::user_role);
$$ language sql stable security definer set search_path = public;

-- Helper: does the current user hold an ACTIVE membership?
create or replace function public.is_active_member()
returns boolean as $$
  select exists (
    select 1 from public.memberships m
    join public.profiles p on p.id = m.user_id
    where m.user_id = auth.uid() and m.status = 'active' and p.status = 'active'
  );
$$ language sql stable security definer set search_path = public;

-- PROFILES -------------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- APPLICATIONS ---------------------------------------------------------------
drop policy if exists applications_own on public.membership_applications;
create policy applications_own on public.membership_applications
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists applications_insert_own on public.membership_applications;
create policy applications_insert_own on public.membership_applications
  for insert with check (auth.uid() = user_id);

-- MEMBERSHIPS ----------------------------------------------------------------
drop policy if exists memberships_own on public.memberships;
create policy memberships_own on public.memberships
  for select using (auth.uid() = user_id or public.is_admin());

-- VERIFICATION ---------------------------------------------------------------
drop policy if exists verification_admin on public.member_verification;
create policy verification_admin on public.member_verification
  for select using (public.is_admin());

-- NEWS -----------------------------------------------------------------------
drop policy if exists news_public on public.news;
create policy news_public on public.news
  for select using (status = 'published' or public.is_admin());

drop policy if exists news_admin on public.news;
create policy news_admin on public.news
  for all using (public.is_admin()) with check (public.is_admin());

-- ANNOUNCEMENTS --------------------------------------------------------------
drop policy if exists announcements_public on public.announcements;
create policy announcements_public on public.announcements
  for select using (
    status = 'published' and (
      target = 'public' or (auth.uid() is not null and public.is_active_member())
    ) or public.is_admin()
  );

drop policy if exists announcements_admin on public.announcements;
create policy announcements_admin on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- EVENTS ---------------------------------------------------------------------
drop policy if exists events_public on public.events;
create policy events_public on public.events
  for select using (
    status = 'published' and (visibility = 'public' or public.is_active_member())
    or public.is_admin()
  );

drop policy if exists events_admin on public.events;
create policy events_admin on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- EVENT RSVPS ----------------------------------------------------------------
drop policy if exists rsvps_own on public.event_rsvps;
create policy rsvps_own on public.event_rsvps
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists rsvps_insert on public.event_rsvps;
create policy rsvps_insert on public.event_rsvps
  for insert with check (auth.uid() = user_id and public.is_active_member());

drop policy if exists rsvps_delete on public.event_rsvps;
create policy rsvps_delete on public.event_rsvps
  for delete using (auth.uid() = user_id);

-- VAULT ----------------------------------------------------------------------
drop policy if exists vault_members on public.vault_content;
create policy vault_members on public.vault_content
  for select using (status = 'published' and public.is_active_member() or public.is_admin());

drop policy if exists vault_admin on public.vault_content;
create policy vault_admin on public.vault_content
  for all using (public.is_admin()) with check (public.is_admin());

-- NOTIFICATIONS --------------------------------------------------------------
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update using (auth.uid() = user_id);

-- ACTIVITY LOGS --------------------------------------------------------------
drop policy if exists logs_admin on public.activity_logs;
create policy logs_admin on public.activity_logs
  for select using (public.is_admin());

-- ===========================================================================
-- STORAGE BUCKETS
-- ===========================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id in ('avatars','media'));

drop policy if exists avatars_own_write on storage.objects;
create policy avatars_own_write on storage.objects
  for insert with check (
    bucket_id in ('avatars','media')
    and (auth.uid() = (storage.foldername(name))[1]::uuid or public.is_admin())
  );

drop policy if exists files_own_delete on storage.objects;
create policy files_own_delete on storage.objects
  for delete using (
    bucket_id in ('avatars','media')
    and (auth.uid() = (storage.foldername(name))[1]::uuid or public.is_admin())
  );

-- ===========================================================================
-- EXECUTE PRIVILEGES ON STATE-CHANGING RPCS
-- ===========================================================================
-- PostgreSQL grants EXECUTE on new functions to PUBLIC, and Supabase's default
-- privileges additionally grant new functions in `public` directly to the
-- `anon` / `authenticated` roles. Supabase also exposes every public function
-- over PostgREST (/rest/v1/rpc/<name>).
--
-- Without the revokes below, ANY visitor holding the public anon key (which is
-- shipped in the frontend bundle) can call approve_application /
-- reject_application / suspend_member / reactivate_member straight against the
-- database and escalate their own account — e.g. self-approving a pending
-- application to mint a Member ID. These functions are only ever invoked by the
-- backend with the service-role key, so all browser-facing access is removed
-- and service_role is granted explicitly.
do $$
declare
  fn text;
  r  text;
begin
  foreach fn in array array[
    'public.approve_application(uuid, uuid, text)',
    'public.reject_application(uuid, uuid, text)',
    'public.suspend_member(uuid, uuid, text)',
    'public.reactivate_member(uuid, uuid)'
  ] loop
    execute format('revoke execute on function %s from public', fn);
    foreach r in array array['anon', 'authenticated'] loop
      if exists (select 1 from pg_roles where rolname = r) then
        execute format('revoke execute on function %s from %I', fn, r);
      end if;
    end loop;
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('grant execute on function %s to service_role', fn);
    end if;
  end loop;
end $$;
