# BizFlow — Hackathon MVP

Mahalladagi biznes (asosiy demo: **Aziz Barber** — sartaroshxona) uchun oddiy operatsion tizim: onlayn navbat, xodimlar, buyurtma, to'lov, ombor, kunlik hisobot.

**Holati:** bu shunchaki skelet emas — auth, xodimlar/xizmatlar/ish vaqtlari CRUD, booking lifecycle (status o'zgarishi + double-booking himoyasi), to'lovlar, ombor, kunlik/haftalik hisobotlar, owner/employee dashboardlari va to'liq mijoz booking wizard'i (real Supabase so'rovlari bilan) — hammasi ishlaydigan holatda yozilgan. Push qilib, `.env` ulagach darhol demo qilish mumkin. Jamoa endi buni sayqallashtiradi va o'z bo'limini chuqurlashtiradi — o'z `.md` promptidagi cheklovlar va qo'shimcha vazifalarga qarab.

To'liq spetsifikatsiya: loyiha ildizidagi `BizFlow_Claude_Project_Spec.md` (hakamlar uchun tayyorlangan asl hujjat).

## Tezkor boshlash

```bash
npm install
cp .env.example .env.local   # Supabase URL/key'larni to'ldiring
```

Supabase'da yangi project yarating, so'ng SQL Editor orqali ketma-ket ishga tushiring:

```bash
supabase/schema.sql   # jadvallar, RLS, double-booking exclusion constraint
supabase/seed.sql     # Aziz Barber demo ma'lumotlari
```

```bash
npm run dev
```

## Jamoa bo'linishi (4 kishi, 3 soat)

Har bir kishi uchun **alohida, to'liq, copy-paste qilinadigan** `.md` fayl bor (`docs/` papkasida) — o'zining Claude sessiyasiga shu faylning butun matnini yuboradi:

| Fayl | Kim uchun | Papkalar/Route'lar |
|---|---|---|
| `docs/BACKEND_1_auth_va_biznes_sozlamalari.md` | Backend-1 | `auth/`, `dashboard/employees`, `dashboard/services`, `dashboard/settings` |
| `docs/BACKEND_2_booking_tolov_ombor_hisobot.md` | Backend-2 | `dashboard/bookings`, `dashboard/payments`, `dashboard/inventory`, `dashboard/reports`, `dashboard/customers` |
| `docs/FRONTEND_1_owner_va_employee_dashboard.md` | Frontend-1 | `dashboard/page.tsx` (Overview), `dashboard/layout.tsx`, `dashboard/calendar`, `employee/` |
| `docs/FRONTEND_2_public_sahifa_va_booking_flow.md` | Frontend-2 | `(marketing)/`, `business/[slug]/` |

Har bir fayl o'zida: kontekst, 3 soatlik vaqt taqsimoti, aniq vazifalar ro'yxati, UI/dizayn talablari (faqat Lucide icon, emoji yo'q, mavjud dizayn token'lari), qaysi papkalarga tegmaslik kerakligi va yakuniy "xatosiz tugatish" checklist'ini o'z ichiga oladi.

**Oltin qoida:** boshqa odamning papkasidagi faylni tahrirlash kerak bo'lsa — avval jamoaga aytasiz, birma-bir push qilasiz, hech kim boshqasining ustidan yozib yubormaydi. Har bir sahifada `// OWNER: <rol>` izohi bor — shu izohga qarab kim nima ustida ishlashini bilib turasiz.
