# BizFlow — Frontend-1 uchun to'liq topshiriq

Bu faylning HAMMA matnini o'z Claude sessiyangga (Claude Pro) boshlang'ich xabar sifatida yubor. Loyiha zip'i (`bizflow.zip`) va shu `.md` fayl senga ochib berilgan bo'lishi kerak — avval zip'ni oching, so'ng shu faylni yuklab, "shu topshiriqni bajar" deb yozing.

## MUHIM — bazaviy versiya allaqachon ishlaydi, qaytadan yozmang

`dashboard/page.tsx` (Overview), `dashboard/calendar`, `employee/page.tsx` va `dashboard/layout.tsx` **allaqachon real Supabase ma'lumotlari bilan ishlaydigan holatda yozilgan** — mock data emas, KPI kartalar/bugungi jadval/xodimlar holati hammasi haqiqiy so'rovlardan keladi. Sizning vazifangiz: birinchi navbatda **ishga tushirib ko'rish**, keyin vizual sayqal (spacing, hover, mobil nav) va spec'dagi qo'shimcha detallarni qo'shish — noldan qayta yozish emas. Bu tokeningizni tejaydi. Hali yo'q va sizga qoldirilgan: mobil pastki navigatsiya/drawer (hozir faqat desktop sidebar bor), low-stock bo'limi uchun alohida server funksiyasi (hozir Overview'da inline hisoblangan — xohlasangiz `lib/actions/inventory.ts`'ga chiqarib olishingiz mumkin).

## Kontekst

BizFlow — mahalladagi sartaroshxona (Aziz Barber) uchun booking/CRM tizimi, IT chempionati hackathoni uchun quriladi. Jamoada 4 kishi bor: 2 backend (Backend-1, Backend-2), 2 frontend (sen — Frontend-1, va Frontend-2). Umumiy vaqt: **3 soat**. Har kimning o'z Claude sessiyasi bor va tokeningiz cheklangan — shuning uchun ishni aniq, kichik bo'laklarga bo'lib bajaring: bitta ekranni tugatib, keyingisiga o'ting, butun loyihani qayta generatsiya qilishni so'ramang.

Sening ekraning — **owner dashboard** — hakamlar ko'radigan birinchi va eng muhim ekran. Maqsad: egasi 5 daqiqada tushunadigan, "bugun menda nima bor?" savoliga darhol javob beradigan sahifa. Bu shunchaki funksional emas, **vizual jihatdan ham eng kuchli ekran bo'lishi kerak** — hakamlar birinchi shu yerga qaraydi.

Repo allaqachon umumiy fundament bilan tayyor: `src/components/*` (StatCard, BookingCard, BookingStatusBadge, EmployeeCard, EmptyState, ErrorState, OnlineStatusBadge), `src/app/dashboard/layout.tsx` + `src/components/layout/sidebar-nav.tsx` (sidebar allaqachon bor, Lucide iconlar bilan), `src/types/database.ts`. **Bularni qaytadan yozma, import qil.** To'liq mahsulot spetsifikatsiyasi: `BizFlow_Claude_Project_Spec.md` (kerak bo'lsa referens sifatida o'qi, ayniqsa 16-bo'lim "Owner dashboard" va 26-bo'lim "UI/UX direction").

Backend-1 Supabase'ni sozlaydi va `.env` yuboradi (~15 daqiqa kuting — shu payt mock ma'lumot bilan UI qurishni boshlaysiz). Backend-2 sizga `src/lib/actions/bookings.ts`'da `getTodaySchedule()` va `src/lib/actions/reports.ts`'da `getDailyReport()` funksiyalarini beradi — ular tayyor bo'lguncha mock massiv bilan ishlang, keyin faqat import qatorini almashtirasiz.

## Vaqt taqsimoti (3 soat = 180 daqiqa)

- **0–15 daqiqa** — mock ma'lumot bilan Overview sahifasining skelet layoutini quring.
- **15–120 daqiqa** — asosiy ish (Overview, calendar, employee ekrani).
- **120–150 daqiqa** — Backend-2 funksiyalari tayyor bo'lgach, real ma'lumotga ulash + edge case'lar (bo'sh jadval, offline).
- **150–180 daqiqa** — vizual sayqal (spacing, shadow, hover holatlari) + `npm run typecheck` bilan yakuniy tekshiruv.

Vaqt yetmasa: Overview sahifasiga eng ko'p vaqt bering — bu hakamlar ko'radigan asosiy ekran. Calendar va employee ekranini soddalashtirish mumkin (murakkab grid o'rniga oddiy ro'yxat).

## Asosiy ish

1. **`src/app/dashboard/page.tsx` (Overview — eng muhim ekran)**:
   - Tepada 4 ta `<StatCard>`: bugungi revenue, mijozlar soni, bookinglar soni, no-show'lar soni (`getDailyReport()`'dan). Har biriga mos Lucide icon bering (masalan `CreditCard`, `Users`, `CalendarDays`, `AlertTriangle`).
   - Katta "Bugungi jadval" bo'limi — `<BookingCard compact>` ro'yxati, `start_at` bo'yicha saralangan (`getTodaySchedule()`'dan). Bo'sh bo'lsa `<EmptyState title="Bugun bron yo'q" description="Jadvalingiz bo'sh." />`.
   - "Xodimlar holati" qatori — `<EmployeeCard statusLabel="Available|With customer|Off today">` (hozir IN_PROGRESS statusidagi booking bor resource = "With customer").
   - Inventory mavjud bo'lsa — "Kam qolgan mahsulotlar" qisqa ro'yxati (faqat OWNER ko'rsin).
   - Loading holatida skeleton (pulse animatsiyali kulrang bloklar), xato holatida `<ErrorState onRetry={...}/>`.

2. **`src/app/dashboard/layout.tsx`** — allaqachon desktop sidebar bor, mobil uchun compact pastki navigatsiya yoki drawer qo'shing (spec: "Do not simply shrink the desktop layout" — mobil versiya alohida o'ylangan bo'lishi kerak). `<OnlineStatusBadge/>`'ni yuqori panelga qo'ying.

3. **`src/app/dashboard/calendar/page.tsx`** — resurslar (barberlar) bo'yicha ustunli kunlik ko'rinish, har birida shu kunning bookinglari (`<BookingCard compact>`). Murakkab calendar kutubxonasi shart emas — oddiy grid yetarli, lekin toza va tushunarli bo'lsin.

4. **`src/app/employee/page.tsx`** — barber uchun qisqartirilgan interfeys: "Keyingi mijoz" katta karta (ism, vaqt, xizmat, narx, [Xizmatni boshlash] tugmasi — katta, bosish oson, mobil ekran uchun mo'ljallangan). IN_PROGRESS bo'lganda [Yakunlash] / [Kelmadi] tugmalari — bular Backend-2'ning `updateBookingStatus()` action'ini chaqiradi, status mantiqini o'zingiz qaytadan yozmang.

## UI/dizayn talablari — bu ekran hakamlar uchun "wow" bo'lishi kerak

- Faqat **Lucide React** iconlardan foydalaning. Hech qachon emoji/stiker ishlatmang (masalan xodim holatini ko'rsatish uchun rangli nuqta + icon, emoji emas).
- Mavjud dizayn token'laridan foydalaning (`src/app/globals.css`): emerald accent, `rounded-card`, minimal shadow (`shadow-sm`, hech qachon qattiq/katta shadow emas).
- KPI kartalar orasida yetarli bo'shliq (`gap-4`/`gap-6`), hammasini siqib qo'ymang.
- Status ranglari faqat holat uchun (success/warning/error/info) — dekorativ ranglardan saqlaning, bitta accent (emerald) + neytral fon.
- Har bir interaktiv element uchun hover/active holat bo'lsin (masalan `hover:border-accent-500`).
- Typography: sarlavhalar aniq ierarxiyada (`text-xl font-semibold` sahifa sarlavhasi uchun, `text-sm text-slate-500` tavsif uchun) — `PageHeader` komponentidan foydalaning.

## Qoidalar (aralashmaslik uchun)

- **`src/app/dashboard/{bookings,employees,services,customers,inventory,payments,reports,settings}` ichiga tegmang** — bular Backend-1/Backend-2'niki, siz faqat ularning funksiyalarini import qilasiz.
- **`src/app/business`, `src/app/(marketing)` — Frontend-2'niki, tegmang.**
- Mobil-friendly bo'lishi shart emas (bu owner dashboard, spec: "should remain usable"), lekin desktop/tablet'da sidebar+content, tablet'da sidebar collapse qila olishi kerak.

## Xatosiz tugatish uchun yakuniy tekshiruv

- [ ] `npm run typecheck` — xatosiz o'tadi
- [ ] Overview sahifasi bo'sh ma'lumot bilan (hech qanday booking yo'q holatda) crash bo'lmaydi, `EmptyState` chiqadi
- [ ] Overview sahifasi Backend-2 API xato qaytarganda crash bo'lmaydi, `ErrorState` chiqadi
- [ ] Barcha 4 ta StatCard to'g'ri sonlarni ko'rsatadi (seed ma'lumotiga qarab qo'lda tekshiring)
- [ ] Employee ekranida "Xizmatni boshlash" → "Yakunlash" tugmalari bosilganda status haqiqatan ham o'zgaradi (Backend-2 bilan birga tekshiring)
- [ ] Sidebar tablet o'lchamida kolaps bo'ladi, mobil ekranda pastki navigatsiya ko'rinadi
