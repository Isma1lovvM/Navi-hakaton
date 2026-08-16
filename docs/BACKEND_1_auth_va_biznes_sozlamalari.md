# BizFlow — Backend-1 uchun to'liq topshiriq

Bu faylning HAMMA matnini o'z Claude sessiyangga (Claude Pro) boshlang'ich xabar sifatida yubor. Loyiha zip'i (`bizflow.zip`) va shu `.md` fayl senga ochib berilgan bo'lishi kerak — avval zip'ni oching, so'ng shu faylni yuklab, "shu topshiriqni bajar" deb yozing.

## MUHIM — bazaviy versiya allaqachon ishlaydi, qaytadan yozmang

Pastda ro'yxatlangan barcha sahifalar (`auth/login`, `auth/register`, `dashboard/employees`, `dashboard/services`, `dashboard/settings`) va tegishli server action'lar (`src/lib/actions/{auth,employees,services,business}.ts`) **allaqachon real Supabase so'rovlari bilan yozilgan va ishlaydi** — bo'sh TODO stub emas. Har bir faylning tepasida `// OWNER: Backend-1 (baza tayyor — kengaytiring)` izohi bor. Sizning vazifangiz: birinchi navbatda **ishga tushirib sinab ko'rish**, keyin kerak bo'lgan joyda kengaytirish/tuzatish — noldan qayta yozish emas. Bu tokeningizni tejaydi va vaqtni tejaydi. Faqat quyidagilar hali yo'q va sizga qoldirilgan: xodim/xizmatlarni **tahrirlash** (hozir faqat qo'shish bor) va o'chirish UI'i, resource_hours'ni to'g'ridan-to'g'ri tahrirlash formasi (hozir faqat backend funksiyasi tayyor).

## Kontekst

BizFlow — mahalladagi sartaroshxona (Aziz Barber) uchun booking/CRM tizimi, IT chempionati hackathoni uchun quriladi. Jamoada 4 kishi bor: 2 backend (sen — Backend-1, va Backend-2), 2 frontend (Frontend-1, Frontend-2). Umumiy vaqt: **3 soat**. Har kimning o'z Claude sessiyasi bor va tokeningiz cheklangan — shuning uchun ishni aniq, kichik bo'laklarga bo'lib bajaring: bitta faylni tugatib, keyingisiga o'ting, butun loyihani qayta generatsiya qilishni so'ramang, xato chiqsa faqat o'sha joyni tuzating.

Repo allaqachon umumiy fundament bilan tayyor: to'liq DB sxema (`supabase/schema.sql` — jadvallar, RLS, double-booking'ni bloklovchi EXCLUDE constraint, `book_appointment()` RPC), demo ma'lumotlar (`supabase/seed.sql`), TypeScript tiplari (`src/types/database.ts`), Zod validatsiya sxemalari (`src/lib/validation/*`), ruxsat helper'lari (`src/lib/permissions/roles.ts`), Supabase client'lar (`src/lib/supabase/{client,server}.ts`), middleware (`src/middleware.ts`) va tayyor umumiy komponentlar (`src/components/*`). **Bularni o'qib chiq, lekin qaytadan yozma — faqat import qilib ishlat.** To'liq mahsulot spetsifikatsiyasi: `BizFlow_Claude_Project_Spec.md` (kerak bo'lsa referens sifatida o'qi).

## Vaqt taqsimoti (3 soat = 180 daqiqa)

- **0–15 daqiqa** — 0-QADAM (pastda), butun jamoa senga bog'liq, tezroq bajar.
- **15–120 daqiqa** — asosiy ish (auth, employees, services, settings).
- **120–150 daqiqa** — Backend-2/Frontend-1 bilan integratsiya: ular sening `get-current-membership.ts` funksiyangdan foydalanadi, ular so'rasa tezda javob ber.
- **150–180 daqiqa** — sayqal (UI ko'rinishi, bo'sh/xato holatlar) + `npm run typecheck` bilan yakuniy tekshiruv.

Vaqt yetmasa: birinchi navbatda P0'ni ishlating (auth + employees + services CRUD), settings sahifasini soddalashtiring (faqat ish vaqtlarini tahrirlash yetarli, qo'shimcha sozlamalarsiz).

## 0-QADAM — BIRINCHI NAVBATDA (butun jamoa senga bog'liq)

1. Supabase'da yangi project och (supabase.com).
2. SQL Editor'da `supabase/schema.sql`'ni to'liq ishga tushir (bitta faylni to'liq copy-paste qilib run qiling).
3. Authentication → Users bo'limida 4 ta demo user qo'lda yarating (email + parol, "Auto confirm" belgilang):
   - `owner@bizflow.uz`
   - `javohir@bizflow.uz`
   - `sardor@bizflow.uz`
   - `bekzod@bizflow.uz`
4. SQL Editor'da `supabase/seed.sql`'ni ishga tushiring (u shu 4 ta userni email orqali topib, biznes/xodim/booking ma'lumotlarini yaratadi).
5. Project Settings → API'dan `NEXT_PUBLIC_SUPABASE_URL` va `NEXT_PUBLIC_SUPABASE_ANON_KEY`'ni oling, `.env.local`'ga yozing.
6. **Shu ikki qiymatni darhol jamoaga (Backend-2, Frontend-1, Frontend-2) yuboring** — ular Supabase'siz haqiqiy ma'lumot bilan ishlay olmaydi.
7. `npm install` qiling, `npm run dev` bilan loyiha ochilishini tekshiring.

## Asosiy ish

1. **`src/app/auth/login/page.tsx`** va **`src/app/auth/register/page.tsx`** — Supabase Auth bilan email/parol login va register formasi (React Hook Form + Zod). Muvaffaqiyatli login'dan keyin `business_members` jadvalidan foydalanuvchi rolini aniqlab, OWNER/EMPLOYEE bo'lsa `/dashboard`'ga, EMPLOYEE bo'lsa muqobil ravishda `/employee`'ga, aks holda `/`'ga yo'naltiring.

2. **`src/lib/permissions/get-current-membership.ts`** (yangi fayl) — server-side funksiya: joriy `auth.uid()` uchun `business_members`'dan `business_id`, `role`, `resource_id`'ni o'qib, `CurrentMembership` tipida (`src/lib/permissions/roles.ts`'dan import qil) qaytaradi. **Bu funksiyani Backend-2 va Frontend-1 ham ishlatadi — signature'ni o'zgartirma, tugagach ularga xabar ber.**

3. **`src/app/dashboard/employees/page.tsx`** — xodimlar ro'yxati (`EmployeeCard` komponentidan foydalan, `src/components/dashboard/employee-card.tsx`) + owner uchun qo'shish/tahrirlash formasi (`employeeInviteSchema`, `src/lib/validation/employee.ts`). Xodim qo'shish = `business_members` + `resources` yozuvini yaratish. `resource_hours`'ni ham shu yerdan tahrirlash mumkin qiling (`resourceHoursDaySchema`).

4. **`src/app/dashboard/services/page.tsx`** — xizmatlar CRUD (`serviceSchema`, `src/lib/validation/service.ts`). `DataTable` komponentidan (`src/components/dashboard/data-table.tsx`) foydalaning.

5. **`src/app/dashboard/settings/page.tsx`** — `business_hours` haftalik jadvalini tahrirlash (`businessHoursDaySchema`) + biznes nomi/manzil/telefon.

## UI/dizayn talablari (hammasi uchun majburiy)

- Faqat **Lucide React** iconlardan foydalaning (`lucide-react` paketi allaqachon o'rnatilgan). Hech qachon emoji yoki stiker ishlatmang — bu "premium SaaS" his qilishi kerak, o'yinchoq emas.
- Mavjud dizayn token'laridan foydalaning (`src/app/globals.css`): emerald accent (`text-accent-600`, `bg-accent-50` va h.k.), `rounded-card` (0.75rem radius), `border-border`. Yangi rang o'ylab topmang.
- Har bir jadval/ro'yxat uchun: yuklanayotganda skeleton, bo'sh bo'lsa `<EmptyState/>`, xato bo'lsa `<ErrorState onRetry={...}/>` (`src/components/layout/`).
- Formalar: aniq validatsiya xabarlari (Zod xabarlari o'zbek tilida allaqachon yozilgan), submit paytida tugma disable/loading holatida bo'lsin.
- Spacing: shoshilmang, `p-4`/`p-6`/`gap-4` kabi "strong spacing" ishlating, hammasini yopishtirib qo'ymang.

## Qoidalar (aralashmaslik uchun)

- Faqat OWNER employees/services/settings'ni o'zgartira olishi kerak — buni `canManageEmployeesAndServices()` / `canManageBusinessSettings()` (`lib/permissions/roles.ts`) bilan server action darajasida tekshiring, faqat UI tugmasini yashirish yetarli emas.
- Yozadigan har bir server action'da Zod bilan validatsiya qiling.
- **`src/app/dashboard/bookings`, `payments`, `inventory`, `reports`, `customers` — bularga tegmang, Backend-2'niki.**
- **`src/app/dashboard/page.tsx` va `calendar` — Frontend-1'niki, tegmang.**
- **`src/app/business/*`, `src/app/(marketing)` — Frontend-2'niki, tegmang.**
- `supabase/schema.sql` — o'zgartirish kerak bo'lsa (masalan yangi ustun), avval jamoaga ayting, kutilmaganda o'zgartirmang — hamma shu sxemaga bog'liq.

## Xatosiz tugatish uchun yakuniy tekshiruv

- [ ] `npm run typecheck` — xatosiz o'tadi
- [ ] Owner sifatida login qilib, employees/services/settings sahifalarini ochib ko'rdim, hech biri crash bo'lmadi
- [ ] Yangi xodim qo'shdim va u ro'yxatda ko'rindi
- [ ] Yangi xizmat qo'shdim, narx/davomiylik noto'g'ri kiritilganda xato xabari chiqdi
- [ ] EMPLOYEE rolidagi user employees/services/settings'ni o'zgartira olmasligini tekshirdim
