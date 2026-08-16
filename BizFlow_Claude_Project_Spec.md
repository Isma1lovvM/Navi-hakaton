# BizFlow — Hackathon Product & Technical Specification

## 0. Claude uchun asosiy vazifa

Build a production-looking, fully functional hackathon MVP called **BizFlow**.

BizFlow is a simple operating platform for small local businesses. The product must NOT feel like a generic enterprise CRM. It should feel extremely simple: a business owner should understand the dashboard in about 5 minutes.

### Important hackathon constraint

The competition explicitly asks us to solve the problem of **one specific business**, not make a generic CRM for everyone.

Therefore:

- **Primary demo/business:** Barber shop / sartaroshxona
- Workshop and cafe are only secondary examples of how the same core booking engine can be configured later.
- The main UI, seeded data, demo flow, copy, screenshots and presentation must focus on the barber shop.
- Do not dilute the MVP by trying to fully implement three businesses.

The product idea:

> **“BizFlow turns the notebook-based daily workflow of a neighborhood barber shop into one simple digital system: booking, employees, orders, payments, inventory and daily reporting.”**

---

# 1. Product principles

The product must optimize for:

1. Simplicity
2. Speed
3. Clear booking availability
4. No double-booking
5. Role-based access
6. A dashboard that answers “What is happening today?”
7. Clear handling of bad/edge cases
8. Mobile-friendly customer booking
9. Desktop/tablet-friendly owner dashboard
10. Strong visual polish for a hackathon demo

Avoid:

- Enterprise-looking complexity
- 20 charts on the homepage
- Huge tables everywhere
- Unnecessary animations
- Fake AI features just for decoration
- Features that do not help the barber shop
- Overengineering the backend

---

# 2. Main users

## Owner

The business owner can:

- Create/manage the business
- Set business working hours
- Add/edit employees
- Add/edit services
- Set service durations and prices
- View today’s bookings
- View revenue
- Manage booking statuses
- Record payments
- Manage inventory
- View daily/weekly reports
- Configure business settings

## Employee / Barber

A barber can:

- View their own schedule
- See upcoming customers
- Start a service
- Complete a booking
- Mark customer as no-show
- Mark booking as cancelled when permitted
- See relevant customer/order information

The barber must NOT be able to change owner-level business settings.

## Customer

A customer can:

- Search/select a barber shop
- Open the barber shop public page
- See available services
- Choose a barber/resource when relevant
- Choose date
- See available time slots
- Book a slot
- View booking confirmation
- View/cancel their booking within allowed rules

---

# 3. Core MVP

The MVP must include these features:

### P0 — Must work

- Authentication
- Business creation / demo business
- Owner dashboard
- Employee/barber management
- Service management
- Business working hours
- Employee working hours
- Public barber shop page
- Online booking
- Slot generation
- Double-booking prevention
- Booking status management
- Payment recording
- Today's revenue
- Today's bookings
- Daily report
- Mobile responsive booking flow
- No-show handling
- Cancellation handling

### P1 — Strong bonus

- Inventory
- Low-stock alerts
- Offline-friendly UX
- Installable PWA feel
- Search businesses
- Notifications/toast feedback
- Weekly revenue chart
- Customer history
- Simple audit/activity feed

### P2 — Future, not required for MVP

- Real payment gateway
- SMS
- Telegram/WhatsApp notifications
- Multi-branch
- Advanced accounting
- AI forecasting
- Payroll
- Full cafe/workshop implementations

---

# 4. Recommended stack

Use:

- **Next.js 16.2.x** with App Router
- **React 19.2.x**
- **TypeScript**
- **Tailwind CSS 4.3.x**
- **shadcn/ui**
- **Lucide React**
- **React Hook Form**
- **Zod**
- **Supabase**
  - PostgreSQL
  - Auth
  - Row Level Security
- **TanStack Query** for client-side server-state where useful
- **date-fns** for date/time calculations
- **Sonner** for lightweight toast notifications
- **Dexie** or a small IndexedDB layer only if implementing offline caching
- **Recharts** only for the small number of dashboard charts that actually help

### Why this stack

Next.js + React gives the app structure and routing.

Supabase removes the need to create a separate backend service during a short hackathon while still giving us a real PostgreSQL database and authentication.

PostgreSQL is especially important because booking conflicts must be protected at the database level, not only in frontend JavaScript.

Tailwind + shadcn/ui + Lucide keeps the UI fast to build but polished.

React Hook Form + Zod gives predictable form validation.

---

# 5. Package guidance

Use stable versions available at project creation time rather than blindly copying old tutorials.

Suggested baseline:

```bash
npm install next react react-dom typescript tailwindcss lucide-react
npm install @supabase/supabase-js
npm install @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install date-fns sonner
npm install recharts
```

If using shadcn/ui, initialize it and use its components instead of introducing another large UI framework.

Do NOT add multiple competing UI libraries.

Do NOT use Bootstrap, MUI and shadcn together.

---

# 6. Application architecture

Use Next.js App Router.

Suggested structure:

```text
src/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx
│   │
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── bookings/
│   │   ├── calendar/
│   │   ├── employees/
│   │   ├── services/
│   │   ├── customers/
│   │   ├── inventory/
│   │   ├── payments/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── business/
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── book/
│   │
│   └── api/
│       └── ...
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── booking/
│   ├── business/
│   ├── forms/
│   └── layout/
│
├── lib/
│   ├── supabase/
│   ├── booking/
│   ├── validation/
│   ├── permissions/
│   ├── utils/
│   └── constants/
│
├── hooks/
├── types/
└── styles/
```

Keep components small and reusable.

---

# 7. Core data model

The key design decision:

Do NOT create three completely separate systems for barber, workshop and cafe.

Create one generalized booking/resource engine.

## Main entities

```text
profiles
businesses
business_members
resources
services
business_hours
resource_hours
customers
bookings
orders
order_items
payments
products
inventory_transactions
```

---

# 8. Resource model

A `resource` is the thing that cannot serve two bookings at the same time.

For barber shop:

```text
Javohir barber
Sardor barber
Bekzod barber
```

For workshop in the future:

```text
Mechanic 1
Service bay 1
Service bay 2
```

For cafe in the future:

```text
Table 1
Table 2
Table 3
```

This makes the booking engine reusable without making the UI generic.

Suggested resource fields:

```text
id
business_id
name
type
is_active
description
created_at
updated_at
```

Example:

```text
type = BARBER
```

---

# 9. Service model

Each service has its own duration.

Example:

```text
Soch olish
duration = 30 minutes
price = 40000
```

```text
Soch + soqol
duration = 50 minutes
price = 60000
```

Suggested fields:

```text
id
business_id
name
description
duration_minutes
price
is_active
created_at
updated_at
```

---

# 10. Booking model

Suggested fields:

```text
id
business_id
customer_id
resource_id
service_id

date
start_at
end_at

status
payment_status

notes

created_at
updated_at
```

Statuses:

```text
PENDING
CONFIRMED
IN_PROGRESS
COMPLETED
CANCELLED
NO_SHOW
```

Payment statuses:

```text
UNPAID
PARTIAL
PAID
REFUNDED
```

---

# 11. THE MOST IMPORTANT TECHNICAL REQUIREMENT — NO DOUBLE BOOKING

Frontend disabling is NOT enough.

The database must also prevent overlapping bookings for the same resource.

Example:

Javohir:

```text
10:00 — 10:30
```

Customer A books it.

Customer B must NOT be able to create:

```text
10:00 — 10:30
```

or another overlapping booking such as:

```text
10:15 — 10:45
```

even if two requests arrive at exactly the same time.

### Recommended PostgreSQL solution

Use a PostgreSQL exclusion constraint / range-based conflict protection for the resource and booking time range.

Conceptually:

```text
same resource
+
overlapping time range
=
reject booking
```

This must be enforced server-side / database-side.

The UI should also show the slot as unavailable for good UX.

---

# 12. Booking availability logic

Availability depends on:

```text
Business working hours
+
Resource/employee working hours
+
Service duration
+
Existing bookings
+
Blocked/break periods
```

Example:

Business:

```text
09:00 — 21:00
```

Lunch:

```text
13:00 — 14:00
```

Javohir:

```text
10:00 — 18:00
```

Service:

```text
Soch olish
30 min
```

The system should generate valid start times:

```text
10:00 ✅
10:30 ✅
11:00 ✅
...
12:30 ✅
13:00 ❌ lunch
13:30 ❌ lunch
14:00 ✅
```

If a booking occupies:

```text
10:00 — 10:30
```

then 10:00 should not be available.

For a 50-minute service, the system must check that the entire 50-minute range is free.

Do NOT simply check the start time.

---

# 13. Business working hours

Owner settings:

```text
Monday    09:00 — 21:00
Tuesday   09:00 — 21:00
Wednesday 09:00 — 21:00
Thursday  09:00 — 21:00
Friday    09:00 — 21:00
Saturday  10:00 — 18:00
Sunday    Closed
```

Also support breaks:

```text
13:00 — 14:00
```

---

# 14. Employee/resource working hours

Business hours are not enough.

Example:

Business:

```text
09:00 — 21:00
```

Javohir:

```text
10:00 — 18:00
```

Sardor:

```text
12:00 — 21:00
```

A slot is available only when both business and resource rules allow it.

---

# 15. Customer booking flow

The customer experience must be extremely simple.

### Step 1

Open:

```text
/business/aziz-barber
```

See:

```text
Aziz Barber
★★★★★
Yunusobod
09:00 — 21:00

[Book appointment]
```

### Step 2 — Select service

```text
Soch olish
30 min
40 000 so'm

Soch + soqol
50 min
60 000 so'm
```

### Step 3 — Select barber

```text
Javohir
Sardor
Bekzod
```

### Step 4 — Select date

Simple date picker.

### Step 5 — Select time

Available slots should be visually obvious.

```text
09:00   unavailable
09:30   unavailable
10:00   available
10:30   available
11:00   unavailable
```

### Step 6 — Customer information

```text
Name
Phone
Optional note
```

### Step 7 — Confirm

Show a final summary:

```text
Aziz Barber

Soch olish
Sardor
16 August
10:00 — 10:30
40 000 so'm

[Confirm booking]
```

Then:

```text
✅ Booking confirmed
```

---

# 16. Owner dashboard

The dashboard must answer:

> **“Bugun menda nima bor?”**

Top KPI cards:

```text
Today's revenue
Today's customers
Today's bookings
No-shows
```

Then a large “Today's schedule” section.

Example:

```text
09:00  Aziz      Javohir   Completed
09:30  Bekzod    Sardor    Completed
10:00  Anvar     Sardor    Upcoming
10:30  Kamron    Bekzod    Upcoming
```

Then:

```text
Employee status

Javohir   🟢 Available
Sardor    🔵 With customer
Bekzod    🟢 Available
```

Then:

```text
Low stock
```

if inventory exists.

---

# 17. Dashboard navigation

Owner navigation:

```text
Overview
Bookings
Calendar
Employees
Services
Customers
Inventory
Payments
Reports
Settings
```

Do not overload the sidebar.

Use clear Lucide icons.

Recommended icons:

```text
LayoutDashboard
CalendarDays
Users
Scissors
UserRound
Package
CreditCard
BarChart3
Settings
Search
Bell
Plus
Clock
Check
X
AlertTriangle
WifiOff
RefreshCw
```

Use Lucide React only. No emoji as primary UI icons.

---

# 18. Employee dashboard

Employee sees a reduced interface:

```text
My schedule
Today's customers
Current booking
Profile
```

Main view:

```text
Next customer

Anvar
10:00
Soch olish
40 000

[Start service]
```

When started:

```text
[Complete service]
[No-show]
```

---

# 19. Booking statuses / edge cases

Must explicitly handle:

### Customer cancels

```text
Booking → CANCELLED
```

Slot becomes available again if cancellation rules allow it.

### Customer does not arrive

Owner or employee can mark:

```text
NO_SHOW
```

Dashboard updates:

```text
No-shows today: 1
```

### Employee unavailable

If an employee is not working that day, they must not appear as available.

### Business closed

No slots must be generated.

### Booking conflict

Show a friendly message:

```text
This time was just taken by another customer.
Please choose another time.
```

Do not expose raw database errors to the customer.

---

# 20. Offline-friendly behavior

Hackathon MVP does not need a perfect offline-first backend.

But the UX must handle lost internet gracefully.

Show:

```text
🟢 Online
```

When connection disappears:

```text
🟠 Offline
```

The app should:

- Keep already loaded dashboard/booking data readable when possible
- Prevent pretending that a server booking succeeded while offline
- Clearly say that new booking cannot be confirmed until connection returns
- Retry/sync safe local operations if implementing offline queue

Important:

**Never show “Booking confirmed” unless the server actually confirmed it.**

---

# 21. Inventory

Simple inventory for the barber shop:

```text
Hair Wax
Shampoo
Gel
Beard Oil
```

Fields:

```text
product name
quantity
minimum quantity
unit
```

Show:

```text
Hair Wax
7 units
Healthy
```

```text
Gel
2 units
Low stock
```

The owner can:

- Add stock
- Remove stock
- Adjust quantity
- See low-stock products

Do not build a full warehouse management system.

---

# 22. Payments

For the hackathon:

Support recording payment, not a real payment gateway.

Methods:

```text
CASH
CARD
```

A completed paid booking should increase daily revenue.

Example:

```text
Service: Soch olish
Price: 40 000
Payment: CASH
Status: PAID
```

Later a real payment provider can be integrated.

---

# 23. Reports

Keep reports simple.

Daily:

```text
Revenue
Bookings
Completed
Cancelled
No-show
Customers
```

Weekly:

```text
Revenue by day
Bookings by day
```

One simple chart is enough.

Do not build a giant analytics platform.

---

# 24. Public business search

Home page can have:

```text
Search local businesses
```

Example:

```text
🔎 Search barber shops...

Aziz Barber
★★★★★
Yunusobod
09:00 — 21:00

Barber House
★★★★☆
Chilonzor
10:00 — 20:00
```

This is useful for the product vision, but the hackathon demo should immediately focus on **Aziz Barber**.

Search should not require a complex GIS/map system.

Simple database filtering is enough.

---

# 25. Future business configurations

The same core can later support:

## Workshop

Resource:

```text
Mechanic / service bay
```

Service:

```text
Oil change — 60 min
```

Booking:

```text
14:00 — 15:00
```

Customer also stores:

```text
vehicle
model
problem
```

## Cafe

Resource:

```text
Table
```

Booking:

```text
Table 4
19:00 — 20:30
2 guests
```

Important:

Do NOT fully build these for the MVP.

Implement the data model so that they are possible later.

---

# 26. UI/UX direction

Visual style:

- Modern
- Clean
- Premium SaaS feel
- Not enterprise-heavy
- Soft borders
- Medium corner radius
- Strong spacing
- Clear typography
- Minimal shadows
- Great empty states
- Excellent loading states
- Excellent error states

Color system:

Use neutral surfaces and one strong accent color.

Suggested barber accent:

```text
emerald / green
```

But do not make the whole app neon.

Use semantic colors only for states:

```text
success
warning
error
info
```

Use CSS variables/design tokens so the accent can be changed easily.

---

# 27. Responsive behavior

### Desktop

Owner dashboard:

```text
sidebar + main content
```

### Tablet

Sidebar can collapse.

### Mobile

Customer booking must be excellent.

Owner dashboard should remain usable but can use a compact navigation.

Do not simply shrink the desktop layout.

---

# 28. Loading / empty / error states

Every important async screen must have:

### Loading

Skeleton UI.

### Empty

Example:

```text
No bookings today
Your schedule is clear.
```

### Error

Example:

```text
Something went wrong.
Please try again.
[Retry]
```

Do not show raw stack traces.

---

# 29. Forms

Use:

```text
React Hook Form
+
Zod
```

Validate on both client and server.

Examples:

Service:

```text
name: required
price: >= 0
duration: > 0
```

Business:

```text
name: required
slug: valid
```

Booking:

```text
customer
service
resource
date
start time
```

---

# 30. Authentication & permissions

Use Supabase Auth.

Roles:

```text
OWNER
EMPLOYEE
CUSTOMER
```

Business membership should control access.

Every protected query must be scoped to the current business.

Never trust `businessId` sent by the client without checking membership.

Use Supabase Row Level Security.

---

# 31. Security rules

At minimum:

- Enable RLS
- Owner can manage their business
- Employee can access only their business and permitted records
- Customer can access only their own booking/customer records
- Never expose Supabase service role key to the browser
- Validate inputs with Zod
- Authorize actions server-side
- Do not rely only on hidden UI buttons for permission control

---

# 32. Demo seed data

Create realistic demo data.

Business:

```text
Aziz Barber
Yunusobod
09:00 — 21:00
```

Employees:

```text
Javohir
Sardor
Bekzod
```

Services:

```text
Soch olish      30 min   40,000
Soqol           20 min   25,000
Soch + soqol    50 min   60,000
Styling         30 min   35,000
```

Customers:

```text
Aziz
Anvar
Bekzod
Kamron
Sardor
```

Create enough bookings to make the dashboard look alive.

Include:

- completed booking
- upcoming booking
- cancelled booking
- no-show booking
- paid booking
- unpaid booking

---

# 33. Hackathon demo scenario

The demo must be scripted.

### Scene 1 — Owner

Open dashboard.

Show:

```text
Today's revenue
Bookings
Customers
No-show
Today's schedule
```

Say:

> “Bu egaga birinchi ko‘rishda bugun biznesida nima bo‘layotganini ko‘rsatadi.”

### Scene 2 — Customer booking

Open public barber page.

Select:

```text
Soch olish
Sardor
10:00
```

Confirm booking.

### Scene 3 — Double booking

Open another browser/incognito.

Try to book the same:

```text
Sardor
10:00
```

Result:

```text
❌ 10:00 is already booked.
```

This is a key “wow” moment.

### Scene 4 — Complete booking

Employee marks it:

```text
In progress
→ Completed
```

Record payment:

```text
40,000 CASH
```

Dashboard updates.

### Scene 5 — No-show

Show another booking and mark:

```text
NO_SHOW
```

Dashboard:

```text
No-shows today: 1
```

### Scene 6 — Inventory

Open inventory.

Show:

```text
Gel — 2 units — Low stock
```

### Scene 7 — Edge case

Simulate offline status.

Show:

```text
Offline
```

Explain:

> “Tizim server tasdiqlamagan bookingni muvaffaqiyatli deb ko‘rsatmaydi.”

---

# 34. Folder/component quality

Prefer reusable components:

```text
StatCard
BookingCard
BookingStatusBadge
TimeSlot
ServiceCard
EmployeeCard
EmptyState
ErrorState
ConfirmDialog
PageHeader
SearchInput
DataTable
```

Do not create giant components such as:

```text
DashboardEverything.tsx
```

Keep business logic outside visual components where practical.

---

# 35. State management

Do NOT add Redux unless it becomes genuinely necessary.

Use:

- React Server Components where appropriate
- URL state for filters/search where practical
- TanStack Query for server/client synchronization
- React state for local UI state
- Supabase database as source of truth

Keep state architecture simple.

---

# 36. Date/time correctness

This is important because booking is time-based.

Use:

- ISO timestamps internally
- `date-fns`
- A consistent business timezone
- Avoid manually concatenating strings for datetime logic

Display Uzbekistan timezone for the hackathon demo:

```text
Asia/Tashkent
UTC+5
```

Do not build fake timezone logic.

---

# 37. Acceptance criteria

The app is not considered complete until all of these work:

- [ ] Owner can log in
- [ ] Owner can see dashboard
- [ ] Owner can create/manage employees
- [ ] Owner can create/manage services
- [ ] Owner can configure business hours
- [ ] Employee has own schedule
- [ ] Customer can open public barber page
- [ ] Customer can select service
- [ ] Customer can select barber
- [ ] Customer can select date
- [ ] Customer can see only valid available slots
- [ ] Customer can make booking
- [ ] Same resource cannot be double-booked
- [ ] Booking can become completed
- [ ] Booking can become cancelled
- [ ] Booking can become no-show
- [ ] Payment can be recorded
- [ ] Daily revenue updates
- [ ] Inventory shows low stock
- [ ] Reports show useful daily information
- [ ] Mobile booking works
- [ ] Loading/empty/error states exist
- [ ] RLS/permissions are implemented
- [ ] Seed/demo data exists

---

# 38. What NOT to do

Do NOT:

- Build an enormous enterprise CRM
- Build all industries completely
- Add AI just to say “AI”
- Add a real payment gateway for the hackathon
- Add maps unless absolutely needed
- Add complicated microservices
- Create a separate backend server if Supabase is enough
- Use Redux by default
- Use several UI libraries
- Make the UI full of gradients
- Use emoji instead of proper icons
- Put all business logic inside page components
- Trust frontend-only booking conflict checks
- Show “success” for an unconfirmed server operation
- Add fake analytics with meaningless charts

---

# 39. Definition of success

The judge should be able to understand the product without an explanation longer than 2–3 minutes.

They should immediately see:

```text
Problem:
The barber shop still works through a notebook.

Solution:
One simple system for daily operations.

Proof:
A customer books online,
double booking is impossible,
the barber handles the booking,
payment updates revenue,
and the owner sees today’s situation instantly.
```

---

# 40. Final product positioning

Primary title:

# BizFlow

Tagline:

> **Mahalladagi biznesingizni boshqarish endi bitta joyda.**

More specific hackathon pitch:

> **BizFlow — mahalladagi sartaroshxonaning daftarini raqamlashtiradigan, onlayn navbat, buyurtma, to‘lov, ombor va kunlik hisobotni bitta sodda tizimga birlashtiradigan platforma.**

---

# 41. Claude implementation instructions

Build the application incrementally.

### Phase 1

- Project setup
- Auth
- Supabase
- Database schema
- RLS
- Seed data
- Basic layout

### Phase 2

- Owner dashboard
- Employees
- Services
- Business hours

### Phase 3

- Public barber page
- Booking flow
- Availability engine
- Database-level conflict prevention

### Phase 4

- Employee schedule
- Booking lifecycle
- Payments
- Dashboard updates

### Phase 5

- Inventory
- Reports
- Edge cases
- Offline indicator
- Loading/error/empty states

### Phase 6

- Visual polish
- Responsive QA
- Accessibility
- Demo preparation

At every phase, keep the application runnable.

Do not generate huge amounts of disconnected code.

After implementing each major feature, verify:

1. TypeScript errors
2. Build errors
3. Database query correctness
4. Permission correctness
5. Mobile layout
6. Booking conflict behavior

---

# 42. Final instruction to Claude

Do not just give me a conceptual answer.

**Actually implement the project.**

Prioritize a working, polished MVP over an enormous feature list.

When a design decision is ambiguous, choose the simplest implementation that preserves:

- correctness
- maintainability
- security
- good UX
- hackathon demo impact

The main demo must be the **barber shop**.

The system must feel like a real product, not a school CRUD project.
