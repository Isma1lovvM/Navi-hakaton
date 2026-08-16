# BizFlow — Backend-2 uchun to'liq topshiriq

Bu faylning HAMMA matnini o'z Claude sessiyangga (Claude Pro) boshlang'ich xabar sifatida yubor. Loyiha zip'i (`bizflow.zip`) va shu `.md` fayl senga ochib berilgan bo'lishi kerak — avval zip'ni oching, so'ng shu faylni yuklab, "shu topshiriqni bajar" deb yozing.

## MUHIM — bazaviy versiya allaqachon ishlaydi, qaytadan yozmang

`dashboard/bookings`, `dashboard/payments`, `dashboard/inventory`, `dashboard/reports`, `dashboard/customers` va `src/lib/actions/{bookings,payments,inventory,reports,customers}.ts` **allaqachon real Supabase so'rovlari bilan yozilgan va ishlaydi**: status o'zgartirish, to'lov yozish, ombor tuzatish, kunlik/haftalik hisobot — hammasi bor. Sizning vazifangiz: birinchi navbatda **ishga tushirib sinab ko'rish** (ayniqsa status o'tishlarini), keyin kerak bo'lgan joyda kengaytirish/tuzatish — noldan qayta yozish emas. Bu tokeningizni tejaydi. Hali yo'q va sizga qoldirilgan: mijoz booking tarixi sahifasi (P1, hozir faqat ro'yxat bor), walk-in booking qo'shish uchun UI (backend action `createStaffBooking` tayyor, lekin forma yo'q).

## Kontekst

BizFlow — mahalladagi sartaroshxona (Aziz Barber) uchun booking/CRM tizimi, IT chempionati hackathoni uchun quriladi. Jamoada 4 kishi bor: 2 backend (Backend-1, va sen — Backend-2), 2 frontend (Frontend-1, Frontend-2). Umumiy vaqt: **3 soat**. Har kimning o'z Claude sessiyasi bor va tokeningiz cheklangan — shuning uchun ishni aniq, kichik bo'laklarga bo'lib bajaring: bitta funksiyani/faylni tugatib, keyingisiga o'ting, butun loyihani qayta generatsiya qilishni so'ramang, xato chiqsa faqat o'sha joyni tuzating.

Repo allaqachon umumiy fundament bilan tayyor: to'liq DB sxema (`supabase/schema.sql`), demo ma'lumotlar (`supabase/seed.sql`), TypeScript tiplari (`src/types/database.ts`), Zod validatsiya sxemalari — ayniqsa `src/lib/validation/booking.ts` (bu yerda `ALLOWED_STATUS_TRANSITIONS` bor — shu jadvaldan tashqari status o'tishga ruxsat bermang) va `src/lib/validation/inventory.ts`, ruxsat helper'lari (`src/lib/permissions/roles.ts`), va tayyor komponentlar (`BookingCard`, `BookingStatusBadge`, `DataTable`, `ConfirmDialog`, `StatCard` — `src/components/*`). **Bularni o'qib chiq, lekin qaytadan yozma — faqat import qilib ishlat.** To'liq mahsulot spetsifikatsiyasi: `BizFlow_Claude_Project_Spec.md` (kerak bo'lsa referens sifatida o'qi).

Backend-1 Supabase project'ni sozlaydi va `.env` qiymatlarini jamoaga yuboradi (~15 daqiqa) — shu payt quyidagi fayllarni mock/statik ma'lumot bilan boshlashingiz mumkin. Backend-1 `src/lib/permissions/get-current-membership.ts`'ni yozadi — sen shu funksiyadan foydalanasan (qaytadan yozma, faqat import qil).

## Vaqt taqsimoti (3 soat = 180 daqiqa)

- **0–15 daqiqa** — `.env` kutish, shu payt fayl strukturasi va mock ma'lumot bilan boshlash.
- **15–130 daqiqa** — asosiy ish (bookings, payments, inventory, reports).
- **130–155 daqiqa** — Frontend-1 bilan integratsiya (ular sening `getTodaySchedule()`/`getDailyReport()` funksiyalaringni chaqiradi — tayyor bo'lganda ularga darhol xabar bering).
- **155–180 daqiqa** — sayqal + `npm run typecheck` bilan yakuniy tekshiruv.

Vaqt yetmasa: birinchi navbatda `bookings` (status o'zgartirish) va `payments`'ni ishlating — bular demo uchun eng muhim (spec Scene 3-4-5). `customers` sahifasi (P1) va `reports`'dagi haftalik grafik oxirgi navbatda.

## Asosiy ish — `src/lib/actions/` papkasida server action'lar yozing (bu papka faqat sizniki), keyin sahifalarga ulaysiz

1. **`src/lib/actions/bookings.ts`**:
   - `getTodaySchedule(businessId)` — bugungi bookinglarni customer/resource/service bilan join qilib, `BookingWithDetails` tipida qaytaradi.
   - `createStaffBooking()` — owner/employee tomonidan qo'lda booking qo'shish (walk-in), `staffCreateBookingSchema` bilan validatsiya.
   - `updateBookingStatus(bookingId, newStatus)` — `ALLOWED_STATUS_TRANSITIONS` bo'yicha tekshiring, `canActOnBooking()` bilan ruxsatni tekshiring (owner — hammasi, employee — faqat o'z `resource_id`'siga tegishli booking).
   - **`src/app/dashboard/bookings/page.tsx`** — booking ro'yxati (`DataTable`/`BookingCard`) + status o'zgartirish tugmalari (`ConfirmDialog` bilan tasdiqlatib — ayniqsa CANCELLED/NO_SHOW uchun, bular qaytarib bo'lmaydigan harakat).
   - **`src/app/dashboard/customers/page.tsx`** — mijozlar ro'yxati + har biriga booking tarixi (vaqt qolsa; qolmasa oddiy ro'yxat yetarli).

2. **`src/lib/actions/payments.ts`**:
   - `recordPayment()` — `recordPaymentSchema`, booking'ning `payment_status`'ini PAID/PARTIAL qilib yangilaydi.
   - **`src/app/dashboard/payments/page.tsx`** — to'lovlar ro'yxati + booking'ga to'lov yozish formasi (CASH/CARD tanlovi bilan).

3. **`src/lib/actions/inventory.ts`**:
   - `adjustInventory()` — `inventoryAdjustmentSchema`, `products.quantity`'ni yangilaydi VA `inventory_transactions`'ga yozuv qo'shadi (ikkalasi bitta so'rovda/transactionda).
   - **`src/app/dashboard/inventory/page.tsx`** — mahsulotlar ro'yxati, `quantity < min_quantity` bo'lsa aniq "Kam qoldi" belgisi (rangli, ogohlantiruvchi — `AlertTriangle` iconi bilan, emoji emas). Seed'da Gel 2 dona — shu low stock ko'rinishi kerak.

4. **`src/lib/actions/reports.ts`**:
   - `getDailyReport(businessId, date)` — revenue, bookings soni, completed, cancelled, no_show, unique mijozlar soni.
   - `getWeeklyRevenue(businessId)` — kunlar bo'yicha revenue, Recharts uchun tayyor massiv.
   - **`src/app/dashboard/reports/page.tsx`** — kunlik raqamlar (`StatCard` qatorlari) + BITTA oddiy haftalik chart (Recharts, faqat shu bitta grafik — katta analitika platformasi qurmang).

## UI/dizayn talablari (hammasi uchun majburiy)

- Faqat **Lucide React** iconlardan foydalaning. Emoji/stiker ishlatmang.
- Mavjud dizayn token'laridan foydalaning (`src/app/globals.css`): emerald accent, `rounded-card`, semantic ranglar (`success`/`warning`/`error`) faqat holat uchun — masalan low-stock ogohlantirish uchun warning rangi.
- Har bir jadval uchun: yuklanish/bo'sh/xato holatlari (`EmptyState`, `ErrorState`).
- Pul summalarini har doim `toLocaleString("uz-UZ")` bilan formatlab ko'rsating (masalan `40 000 so'm`), xom raqam emas.

## Qoidalar (aralashmaslik uchun)

- **`src/app/dashboard/employees`, `services`, `settings`, `auth` — bularga tegmang, Backend-1'niki.**
- **`src/app/dashboard/page.tsx`, `calendar`, `src/app/employee` — Frontend-1'niki, lekin ular sening `getTodaySchedule()`/`getDailyReport()` funksiyalaringni chaqiradi — signature'larni ishonchli qiling va tayyor bo'lganda ularga xabar bering.**
- **`src/app/business/*`, `src/app/(marketing)` — Frontend-2'niki, tegmang.**
- Har bir yozuvni server-side Zod bilan tekshiring, RLS'ga ishonib frontend tekshiruvini yetarli deb hisoblamang.

## Xatosiz tugatish uchun yakuniy tekshiruv

- [ ] `npm run typecheck` — xatosiz o'tadi
- [ ] Bir bookingni CONFIRMED → IN_PROGRESS → COMPLETED qilib ko'rdim, har bosqichda UI to'g'ri yangilandi
- [ ] Ruxsat etilmagan status o'tish (masalan COMPLETED → PENDING) UI'da taklif qilinmaydi
- [ ] To'lov yozganimda booking'ning `payment_status`'i darhol yangilandi
- [ ] Gel mahsuloti "Kam qoldi" deb aniq ko'rinadi, boshqa mahsulotlar ko'rinmaydi
- [ ] Kunlik hisobotdagi revenue qo'lda hisoblagan summaga mos keldi (seed ma'lumotlariga qarab tekshiring)
