-- =====================================================================
-- BizFlow — core schema
-- OWNER OF THIS FILE: shared foundation, already written. Do NOT edit
-- without agreement from the whole team — every route depends on this.
-- If you need a new column, add a numbered migration file instead of
-- editing this one, so nobody's local DB state silently diverges.
-- =====================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists btree_gist; -- required for the EXCLUDE constraint below

-- ---------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- profiles — mirrors auth.users, one row per person (owner/employee/customer)
-- =====================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- auto-create a profile row whenever someone signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- businesses
-- =====================================================================
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  name text not null,
  slug text not null unique,
  description text,
  address text,
  phone text,
  timezone text not null default 'Asia/Tashkent',
  accent_color text not null default 'emerald',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create trigger trg_businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- =====================================================================
-- business_members — who can manage a business, and with which role
-- (OWNER / EMPLOYEE). Customers are NOT members — see `customers` below.
-- =====================================================================
create table public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('OWNER', 'EMPLOYEE')),
  resource_id uuid, -- set for EMPLOYEE: which resource/barber identity they operate as (FK added below, resources created after)
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (business_id, profile_id)
);

-- ---------------------------------------------------------------------
-- membership helper functions (SECURITY DEFINER so RLS policies that
-- call them don't recurse into business_members' own RLS)
-- ---------------------------------------------------------------------
create or replace function public.is_business_member(p_business_id uuid, p_roles text[] default null)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.business_members bm
    where bm.business_id = p_business_id
      and bm.profile_id = auth.uid()
      and bm.is_active = true
      and (p_roles is null or bm.role = any(p_roles))
  );
$$;

grant execute on function public.is_business_member(uuid, text[]) to authenticated, anon;

-- =====================================================================
-- resources — "the thing that can't serve two bookings at once"
-- (barber / mechanic bay / table — see spec section 8)
-- =====================================================================
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  type text not null default 'BARBER',
  is_active boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_resources_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

alter table public.business_members
  add constraint fk_business_members_resource
  foreign key (resource_id) references public.resources(id) on delete set null;

-- =====================================================================
-- services
-- =====================================================================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes > 0),
  price numeric(12, 2) not null check (price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- =====================================================================
-- business_hours — one row per weekday. day_of_week: 0=Sunday..6=Saturday
-- (matches JS Date#getDay(), keep this convention everywhere in the app)
-- =====================================================================
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  is_closed boolean not null default false,
  open_time time,
  close_time time,
  break_start time,
  break_end time,
  unique (business_id, day_of_week),
  constraint hours_consistent check (
    is_closed or (open_time is not null and close_time is not null and open_time < close_time)
  )
);

-- =====================================================================
-- resource_hours — per-employee working hours (spec section 14).
-- A slot is valid only when it fits BOTH business_hours AND resource_hours.
-- =====================================================================
create table public.resource_hours (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  is_off boolean not null default false,
  start_time time,
  end_time time,
  unique (resource_id, day_of_week),
  constraint resource_hours_consistent check (
    is_off or (start_time is not null and end_time is not null and start_time < end_time)
  )
);

-- =====================================================================
-- customers — scoped per business. profile_id is null for guest
-- customers who booked without creating an account (the common case).
-- =====================================================================
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  profile_id uuid references public.profiles(id),
  full_name text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, phone)
);

create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- =====================================================================
-- bookings — the core entity. `date` is derived, never set directly,
-- so it can never drift from start_at.
-- =====================================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.customers(id),
  resource_id uuid not null references public.resources(id),
  service_id uuid not null references public.services(id),

  start_at timestamptz not null,
  end_at timestamptz not null,
  date date generated always as ((start_at at time zone 'Asia/Tashkent')::date) stored,

  status text not null default 'CONFIRMED'
    check (status in ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  payment_status text not null default 'UNPAID'
    check (payment_status in ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED')),

  notes text,
  cancelled_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint end_after_start check (end_at > start_at),

  -- ****************************************************************
  -- THE MOST IMPORTANT CONSTRAINT IN THE WHOLE SCHEMA (spec section 11)
  -- Same resource + overlapping time range => reject at the DB level.
  -- Cancelled / no-show bookings free up the slot again.
  -- ****************************************************************
  constraint no_overlapping_bookings exclude using gist (
    resource_id with =,
    tstzrange(start_at, end_at) with &&
  ) where (status not in ('CANCELLED', 'NO_SHOW'))
);

create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create index idx_bookings_business_date on public.bookings (business_id, date);
create index idx_bookings_resource_start on public.bookings (resource_id, start_at);
create index idx_bookings_customer on public.bookings (customer_id);

-- =====================================================================
-- payments — recorded payments (cash/card), not a real payment gateway.
-- =====================================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  method text not null check (method in ('CASH', 'CARD')),
  recorded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index idx_payments_booking on public.payments (booking_id);
create index idx_payments_business_created on public.payments (business_id, created_at);

-- =====================================================================
-- products / inventory_transactions — simple stock tracking (spec 21)
-- =====================================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  unit text not null default 'dona',
  quantity numeric not null default 0,
  min_quantity numeric not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  change numeric not null, -- positive = restock, negative = usage/removal
  reason text not null default 'ADJUSTMENT' check (reason in ('RESTOCK', 'USAGE', 'ADJUSTMENT')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index idx_inventory_tx_product on public.inventory_transactions (product_id);

-- =====================================================================
-- orders / order_items — NOT used by the barber P0 flow. Present only
-- so the schema already supports retail product sales / future
-- workshop & cafe verticals without a migration (spec section 25).
-- =====================================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  booking_id uuid references public.bookings(id),
  customer_id uuid references public.customers(id),
  status text not null default 'OPEN' check (status in ('OPEN', 'PAID', 'CANCELLED')),
  total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  service_id uuid references public.services(id),
  description text,
  quantity numeric not null default 1,
  unit_price numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- RPC: book_appointment — the ONLY way an unauthenticated customer can
-- create a booking. Runs as SECURITY DEFINER so it can upsert a guest
-- customer row and insert the booking without needing broad public
-- INSERT policies on customers/bookings. The EXCLUDE constraint above
-- still protects against races; on conflict we translate the raw
-- Postgres error into a friendly, stable error code the frontend can
-- match on (spec section 19 — never show a raw DB error to a customer).
-- =====================================================================
create or replace function public.book_appointment(
  p_business_id uuid,
  p_resource_id uuid,
  p_service_id uuid,
  p_start_at timestamptz,
  p_customer_name text,
  p_customer_phone text,
  p_notes text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration int;
  v_end_at timestamptz;
  v_customer_id uuid;
  v_booking public.bookings;
begin
  select duration_minutes into v_duration
  from public.services
  where id = p_service_id and business_id = p_business_id and is_active = true;

  if v_duration is null then
    raise exception 'SERVICE_NOT_FOUND' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.resources
    where id = p_resource_id and business_id = p_business_id and is_active = true
  ) then
    raise exception 'RESOURCE_NOT_FOUND' using errcode = 'P0001';
  end if;

  v_end_at := p_start_at + make_interval(mins => v_duration);

  insert into public.customers (business_id, full_name, phone)
  values (p_business_id, p_customer_name, p_customer_phone)
  on conflict (business_id, phone)
  do update set full_name = excluded.full_name
  returning id into v_customer_id;

  begin
    insert into public.bookings (
      business_id, customer_id, resource_id, service_id,
      start_at, end_at, status, payment_status, notes
    ) values (
      p_business_id, v_customer_id, p_resource_id, p_service_id,
      p_start_at, v_end_at, 'CONFIRMED', 'UNPAID', p_notes
    )
    returning * into v_booking;
  exception
    when exclusion_violation then
      raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end;

  return v_booking;
end;
$$;

revoke all on function public.book_appointment from public;
grant execute on function public.book_appointment to anon, authenticated;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.resources enable row level security;
alter table public.services enable row level security;
alter table public.business_hours enable row level security;
alter table public.resource_hours enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.products enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- profiles: everyone can read their own; owners can read their staff's
create policy profiles_select on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.business_members bm1
      join public.business_members bm2 on bm2.business_id = bm1.business_id
      where bm1.profile_id = auth.uid() and bm1.role = 'OWNER' and bm2.profile_id = profiles.id
    )
  );
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid());

-- businesses: active businesses are publicly readable (needed for the
-- public booking page); members can also read inactive ones they own.
create policy businesses_select on public.businesses for select
  using (is_active = true or public.is_business_member(id));
create policy businesses_insert on public.businesses for insert
  with check (owner_id = auth.uid());
create policy businesses_update on public.businesses for update
  using (public.is_business_member(id, array['OWNER']));

-- business_members: any member can see the roster; only owners manage it
create policy business_members_select on public.business_members for select
  using (public.is_business_member(business_id));
create policy business_members_write on public.business_members for insert
  with check (public.is_business_member(business_id, array['OWNER']));
create policy business_members_update on public.business_members for update
  using (public.is_business_member(business_id, array['OWNER']));
create policy business_members_delete on public.business_members for delete
  using (public.is_business_member(business_id, array['OWNER']));

-- resources / services / hours: publicly readable (booking page needs
-- them pre-auth), writable by OWNER only
create policy resources_select on public.resources for select
  using (
    is_active = true
    or public.is_business_member(business_id)
  );
create policy resources_write on public.resources for all
  using (public.is_business_member(business_id, array['OWNER']))
  with check (public.is_business_member(business_id, array['OWNER']));

create policy services_select on public.services for select
  using (
    is_active = true
    or public.is_business_member(business_id)
  );
create policy services_write on public.services for all
  using (public.is_business_member(business_id, array['OWNER']))
  with check (public.is_business_member(business_id, array['OWNER']));

create policy business_hours_select on public.business_hours for select
  using (true);
create policy business_hours_write on public.business_hours for all
  using (public.is_business_member(business_id, array['OWNER']))
  with check (public.is_business_member(business_id, array['OWNER']));

create policy resource_hours_select on public.resource_hours for select
  using (true);
create policy resource_hours_write on public.resource_hours for all
  using (
    exists (
      select 1 from public.resources r
      where r.id = resource_hours.resource_id
        and public.is_business_member(r.business_id, array['OWNER'])
    )
  )
  with check (
    exists (
      select 1 from public.resources r
      where r.id = resource_hours.resource_id
        and public.is_business_member(r.business_id, array['OWNER'])
    )
  );

-- customers: only staff can browse the customer list directly.
-- Guests never get a direct SELECT policy — they only ever see their
-- own booking via the book_appointment()/get_my_booking() RPC results.
create policy customers_select on public.customers for select
  using (public.is_business_member(business_id));
create policy customers_write on public.customers for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));

-- bookings: staff see/manage everything in their business.
-- Customers with an account see their own bookings.
-- Guests get NO direct SELECT — see book_appointment() RPC above.
create policy bookings_select on public.bookings for select
  using (
    public.is_business_member(business_id)
    or exists (
      select 1 from public.customers c
      where c.id = bookings.customer_id and c.profile_id = auth.uid()
    )
  );
create policy bookings_insert_staff on public.bookings for insert
  with check (public.is_business_member(business_id, array['OWNER', 'EMPLOYEE']));
create policy bookings_update_staff on public.bookings for update
  using (public.is_business_member(business_id, array['OWNER', 'EMPLOYEE']));

-- payments: staff only
create policy payments_select on public.payments for select
  using (public.is_business_member(business_id));
create policy payments_insert on public.payments for insert
  with check (public.is_business_member(business_id, array['OWNER', 'EMPLOYEE']));
create policy payments_delete on public.payments for delete
  using (public.is_business_member(business_id, array['OWNER']));

-- inventory: owner only
create policy products_all on public.products for all
  using (public.is_business_member(business_id, array['OWNER']))
  with check (public.is_business_member(business_id, array['OWNER']));
create policy inventory_tx_all on public.inventory_transactions for all
  using (public.is_business_member(business_id, array['OWNER']))
  with check (public.is_business_member(business_id, array['OWNER']));

-- orders/order_items: staff only (unused by P0 barber flow, kept simple)
create policy orders_all on public.orders for all
  using (public.is_business_member(business_id))
  with check (public.is_business_member(business_id));
create policy order_items_all on public.order_items for all
  using (exists (select 1 from public.orders o where o.id = order_items.order_id and public.is_business_member(o.business_id)))
  with check (exists (select 1 from public.orders o where o.id = order_items.order_id and public.is_business_member(o.business_id)));
