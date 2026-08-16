-- =====================================================================
-- BizFlow — demo seed data ("Aziz Barber")
-- =====================================================================
-- BEFORE running this file, create 4 auth users (Supabase Dashboard ->
-- Authentication -> Users -> Add user, or supabase.auth.admin.createUser):
--
--   owner@bizflow.uz     (becomes OWNER — "Aziz")
--   javohir@bizflow.uz   (EMPLOYEE — barber)
--   sardor@bizflow.uz    (EMPLOYEE — barber)
--   bekzod@bizflow.uz    (EMPLOYEE — barber)
--
-- The `handle_new_user` trigger in schema.sql auto-creates a matching
-- `profiles` row for each. This script then looks them up by email.
-- Run this AFTER schema.sql, in the Supabase SQL editor (service role
-- context, so RLS does not apply here).
--
-- All booking times are anchored to CURRENT_DATE so the dashboard
-- always looks "alive" no matter which day you run the demo.
-- 10:00 with Sardor is INTENTIONALLY left free — that is the slot used
-- live in the demo (spec section 33, Scene 2 + Scene 3 double-booking).
-- =====================================================================

do $$
declare
  v_owner_id uuid;
  v_javohir_profile uuid;
  v_sardor_profile uuid;
  v_bekzod_profile uuid;

  v_business_id uuid;
  v_r_javohir uuid;
  v_r_sardor uuid;
  v_r_bekzod uuid;

  v_s_haircut uuid;
  v_s_beard uuid;
  v_s_combo uuid;
  v_s_styling uuid;

  v_c_aziz uuid;
  v_c_anvar uuid;
  v_c_bekzod uuid;
  v_c_kamron uuid;
  v_c_sardor uuid;

  v_booking_1 uuid;
  v_booking_2 uuid;

  today date := current_date;
  tz text := 'Asia/Tashkent';
begin
  select id into v_owner_id from auth.users where email = 'owner@bizflow.uz';
  select id into v_javohir_profile from auth.users where email = 'javohir@bizflow.uz';
  select id into v_sardor_profile from auth.users where email = 'sardor@bizflow.uz';
  select id into v_bekzod_profile from auth.users where email = 'bekzod@bizflow.uz';

  if v_owner_id is null or v_javohir_profile is null or v_sardor_profile is null or v_bekzod_profile is null then
    raise exception 'Create the 4 demo auth users first (see comment header of seed.sql) — owner@bizflow.uz, javohir@bizflow.uz, sardor@bizflow.uz, bekzod@bizflow.uz';
  end if;

  -- ------------------------------------------------------------------
  -- business
  -- ------------------------------------------------------------------
  insert into public.businesses (owner_id, name, slug, description, address, phone, timezone)
  values (v_owner_id, 'Aziz Barber', 'aziz-barber', 'Yunusobodning eng sara sartaroshxonasi.', 'Yunusobod, Toshkent', '+998901234567', tz)
  returning id into v_business_id;

  insert into public.business_hours (business_id, day_of_week, is_closed, open_time, close_time, break_start, break_end) values
    (v_business_id, 1, false, '09:00', '21:00', '13:00', '14:00'), -- Mon
    (v_business_id, 2, false, '09:00', '21:00', '13:00', '14:00'), -- Tue
    (v_business_id, 3, false, '09:00', '21:00', '13:00', '14:00'), -- Wed
    (v_business_id, 4, false, '09:00', '21:00', '13:00', '14:00'), -- Thu
    (v_business_id, 5, false, '09:00', '21:00', '13:00', '14:00'), -- Fri
    (v_business_id, 6, false, '10:00', '18:00', null, null),       -- Sat
    (v_business_id, 0, true, null, null, null, null);              -- Sun closed

  -- ------------------------------------------------------------------
  -- resources (barbers) + their working hours (spec section 14)
  -- ------------------------------------------------------------------
  insert into public.resources (business_id, name, type, description)
  values (v_business_id, 'Javohir', 'BARBER', 'Klassik va zamonaviy soch turmaklari') returning id into v_r_javohir;
  insert into public.resources (business_id, name, type, description)
  values (v_business_id, 'Sardor', 'BARBER', 'Soqol dizayni bo''yicha mutaxassis') returning id into v_r_sardor;
  insert into public.resources (business_id, name, type, description)
  values (v_business_id, 'Bekzod', 'BARBER', 'Tez va aniq xizmat') returning id into v_r_bekzod;

  insert into public.resource_hours (resource_id, day_of_week, is_off, start_time, end_time)
  select r.id, d, (d = 0), case when d = 0 then null else h.start_time end, case when d = 0 then null else h.end_time end
  from (values (v_r_javohir, '10:00'::time, '18:00'::time)) as h(resource_id, start_time, end_time)
  join public.resources r on r.id = h.resource_id
  cross join generate_series(0, 6) as d;

  insert into public.resource_hours (resource_id, day_of_week, is_off, start_time, end_time)
  select r.id, d, (d = 0), case when d = 0 then null else h.start_time end, case when d = 0 then null else h.end_time end
  from (values (v_r_sardor, '12:00'::time, '21:00'::time)) as h(resource_id, start_time, end_time)
  join public.resources r on r.id = h.resource_id
  cross join generate_series(0, 6) as d;

  insert into public.resource_hours (resource_id, day_of_week, is_off, start_time, end_time)
  select r.id, d, (d = 0), case when d = 0 then null else h.start_time end, case when d = 0 then null else h.end_time end
  from (values (v_r_bekzod, '09:00'::time, '20:00'::time)) as h(resource_id, start_time, end_time)
  join public.resources r on r.id = h.resource_id
  cross join generate_series(0, 6) as d;

  -- ------------------------------------------------------------------
  -- business_members
  -- ------------------------------------------------------------------
  insert into public.business_members (business_id, profile_id, role) values
    (v_business_id, v_owner_id, 'OWNER');
  insert into public.business_members (business_id, profile_id, role, resource_id) values
    (v_business_id, v_javohir_profile, 'EMPLOYEE', v_r_javohir),
    (v_business_id, v_sardor_profile, 'EMPLOYEE', v_r_sardor),
    (v_business_id, v_bekzod_profile, 'EMPLOYEE', v_r_bekzod);

  -- ------------------------------------------------------------------
  -- services
  -- ------------------------------------------------------------------
  insert into public.services (business_id, name, duration_minutes, price)
  values (v_business_id, 'Soch olish', 30, 40000) returning id into v_s_haircut;
  insert into public.services (business_id, name, duration_minutes, price)
  values (v_business_id, 'Soqol', 20, 25000) returning id into v_s_beard;
  insert into public.services (business_id, name, duration_minutes, price)
  values (v_business_id, 'Soch + soqol', 50, 60000) returning id into v_s_combo;
  insert into public.services (business_id, name, duration_minutes, price)
  values (v_business_id, 'Styling', 30, 35000) returning id into v_s_styling;

  -- ------------------------------------------------------------------
  -- customers (guests — no auth account, profile_id stays null)
  -- ------------------------------------------------------------------
  insert into public.customers (business_id, full_name, phone) values (v_business_id, 'Aziz', '+998901111111') returning id into v_c_aziz;
  insert into public.customers (business_id, full_name, phone) values (v_business_id, 'Anvar', '+998902222222') returning id into v_c_anvar;
  insert into public.customers (business_id, full_name, phone) values (v_business_id, 'Bekzod', '+998903333333') returning id into v_c_bekzod;
  insert into public.customers (business_id, full_name, phone) values (v_business_id, 'Kamron', '+998904444444') returning id into v_c_kamron;
  insert into public.customers (business_id, full_name, phone) values (v_business_id, 'Sardor', '+998905555555') returning id into v_c_sardor;

  -- ------------------------------------------------------------------
  -- bookings — covers every state the dashboard/demo needs.
  -- NOTE: 10:00 with Sardor is deliberately left open (live demo slot).
  -- ------------------------------------------------------------------

  -- completed + paid (cash)
  insert into public.bookings (business_id, customer_id, resource_id, service_id, start_at, end_at, status, payment_status)
  values (v_business_id, v_c_aziz, v_r_javohir, v_s_haircut,
          (today + time '09:00') at time zone tz, (today + time '09:30') at time zone tz,
          'COMPLETED', 'PAID')
  returning id into v_booking_1;
  insert into public.payments (business_id, booking_id, amount, method, recorded_by)
  values (v_business_id, v_booking_1, 40000, 'CASH', v_owner_id);

  -- completed + paid (card)
  insert into public.bookings (business_id, customer_id, resource_id, service_id, start_at, end_at, status, payment_status)
  values (v_business_id, v_c_bekzod, v_r_sardor, v_s_beard,
          (today + time '09:30') at time zone tz, (today + time '09:50') at time zone tz,
          'COMPLETED', 'PAID')
  returning id into v_booking_2;
  insert into public.payments (business_id, booking_id, amount, method, recorded_by)
  values (v_business_id, v_booking_2, 25000, 'CARD', v_owner_id);

  -- upcoming, unpaid
  insert into public.bookings (business_id, customer_id, resource_id, service_id, start_at, end_at, status, payment_status)
  values (v_business_id, v_c_anvar, v_r_bekzod, v_s_haircut,
          (today + time '11:00') at time zone tz, (today + time '11:30') at time zone tz,
          'CONFIRMED', 'UNPAID');

  -- upcoming, unpaid
  insert into public.bookings (business_id, customer_id, resource_id, service_id, start_at, end_at, status, payment_status)
  values (v_business_id, v_c_kamron, v_r_javohir, v_s_combo,
          (today + time '11:30') at time zone tz, (today + time '12:20') at time zone tz,
          'CONFIRMED', 'UNPAID');

  -- no-show
  insert into public.bookings (business_id, customer_id, resource_id, service_id, start_at, end_at, status, payment_status)
  values (v_business_id, v_c_sardor, v_r_bekzod, v_s_beard,
          (today + time '14:00') at time zone tz, (today + time '14:20') at time zone tz,
          'NO_SHOW', 'UNPAID');

  -- cancelled
  insert into public.bookings (business_id, customer_id, resource_id, service_id, start_at, end_at, status, payment_status, cancelled_reason)
  values (v_business_id, v_c_anvar, v_r_javohir, v_s_styling,
          (today + time '16:00') at time zone tz, (today + time '16:30') at time zone tz,
          'CANCELLED', 'UNPAID', 'Mijoz bekor qildi');

  -- ------------------------------------------------------------------
  -- inventory
  -- ------------------------------------------------------------------
  insert into public.products (business_id, name, unit, quantity, min_quantity) values
    (v_business_id, 'Hair Wax', 'dona', 7, 3),
    (v_business_id, 'Shampoo', 'dona', 10, 3),
    (v_business_id, 'Gel', 'dona', 2, 3),      -- low stock, on purpose
    (v_business_id, 'Beard Oil', 'dona', 5, 2);

  raise notice 'Seed complete. business_id = %', v_business_id;
end $$;
