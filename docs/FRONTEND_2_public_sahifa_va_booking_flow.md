# BizFlow — Frontend-2 uchun to'liq topshiriq

Bu faylning HAMMA matnini o'z Claude sessiyangga (Claude Pro) boshlang'ich xabar sifatida yubor. Loyiha zip'i (`bizflow.zip`) va shu `.md` fayl senga ochib berilgan bo'lishi kerak — avval zip'ni oching, so'ng shu faylni yuklab, "shu topshiriqni bajar" deb yozing.

## MUHIM — bazaviy versiya allaqachon ishlaydi, qaytadan yozmang

`(marketing)/page.tsx`, `business/[slug]/page.tsx` va `business/[slug]/book/page.tsx` (to'liq 6 bosqichli `<BookingWizard>` bilan) **allaqachon real Supabase RPC chaqiruvi bilan ishlaydi** — `getAvailableSlots()` bilan bo'sh vaqt hisoblash, `book_appointment` RPC orqali booking yaratish, `SLOT_TAKEN` xatosini ushlab tanlangan slotni yangilash, offline holatda tugmani disable qilish — hammasi bor. Sizning vazifangiz: birinchi navbatda **to'liq wizard'ni boshidan oxirigacha o'zingiz sinab ko'ring** (bu eng muhim!), keyin vizual sayqal va spec'dagi qo'shimcha detallarni qo'shish — noldan qayta yozish emas. Bu tokeningizni tejaydi. Hali yo'q: step'lar orasidagi animatsiya/o'tish effekti, wizard'ning fixed pastki tugma paneli (hozir oddiy holatda).

## Kontekst

BizFlow — mahalladagi sartaroshxona (Aziz Barber) uchun booking/CRM tizimi, IT chempionati hackathoni uchun quriladi. Jamoada 4 kishi bor: 2 backend (Backend-1, Backend-2), 2 frontend (Frontend-1, va sen — Frontend-2). Umumiy vaqt: **3 soat**. Har kimning o'z Claude sessiyasi bor va tokeningiz cheklangan — shuning uchun ishni aniq, kichik bo'laklarga bo'lib bajaring: bitta step'ni tugatib, keyingisiga o'ting, butun loyihani qayta generatsiya qilishni so'ramang.

**Bu eng ko'rinadigan qism va demo'ning eng muhim "wow moment"i:** mijoz telefonda tez booking qila oladi, va ikkita mijoz bir xil vaqtni band qilishga uringanda ikkinchisi aniq rad javobini oladi — chunki himoya database darajasida (frontend emas). Bu ekran vizual jihatdan ham eng "premium" his qilinishi kerak — hakamlar buni jonli sinab ko'radi.

Repo allaqachon umumiy fundament bilan tayyor:
- **`src/lib/booking/availability.ts`** — `getAvailableSlots()` funksiyasi TAYYOR: business hours ∩ resource hours ∩ xizmat davomiyligi ∩ mavjud bookinglarni hisobga olib bo'sh vaqtlarni qaytaradi. **O'zing slot matematikasini qaytadan yozma — shu funksiyani chaqir.**
- **`supabase/schema.sql`**'dagi `book_appointment(...)` RPC — mijoz booking yaratishning YAGONA yo'li. To'g'ridan-to'g'ri `bookings` jadvaliga insert qilishga urinma (RLS bunga ruxsat bermaydi ham) — `supabase.rpc('book_appointment', {...})` chaqir.
- **`src/types/database.ts`**'dagi `BOOKING_ERROR_MESSAGES` — RPC xato qaytarsa (masalan `SLOT_TAKEN`), shu tayyor xabarlarni ko'rsat, xom Postgres xatosini hech qachon ko'rsatma.
- **`src/components/{business/service-card, booking/time-slot-button, forms/search-input, layout/online-status-badge}.tsx`** — tayyor komponentlar, import qil.

**Bularni qaytadan yozma.** To'liq mahsulot spetsifikatsiyasi: `BizFlow_Claude_Project_Spec.md` (kerak bo'lsa referens sifatida o'qi, ayniqsa 15-bo'lim "Customer booking flow" va 20-bo'lim "Offline-friendly behavior").

Backend-1 Supabase'ni sozlaydi va `.env` yuboradi (~15 daqiqa kuting) — shu payt statik ma'lumot bilan UI/wizard qurishni boshlang.

## Vaqt taqsimoti (3 soat = 180 daqiqa)

- **0–15 daqiqa** — mock ma'lumot bilan wizard skeletonini (6 step) quring.
- **15–120 daqiqa** — asosiy ish (landing, business page, booking wizard).
- **120–150 daqiqa** — Supabase RPC bilan real ulanish + double-booking xato holatini sinash (bu demo uchun eng muhim qism!).
- **150–180 daqiqa** — mobil ekranda sinov + vizual sayqal + `npm run typecheck` bilan yakuniy tekshiruv.

Vaqt yetmasa: `(marketing)` qidiruv sahifasini eng soddasiga qoldiring (demo baribir to'g'ridan-to'g'ri `/business/aziz-barber`'dan boshlanadi) — butun vaqtingizni booking wizard'iga bag'ishlang, ayniqsa 10:00/Sardor slotini live sinab ko'rishga.

## Asosiy ish

1. **`src/app/(marketing)/page.tsx`** — "Search local businesses" (spec 24-bo'lim). Oddiy: `<SearchInput>` + `businesses` jadvalidan `is_active=true` bo'yicha ro'yxat (oddiy ILIKE filter yetarli, murakkab qidiruv/GIS shart emas).

2. **`src/app/business/[slug]/page.tsx`** — biznes haqida: nomi, manzil, ish vaqti, `[Booking qilish]` tugmasi → `/business/{slug}/book`. Bu birinchi taassurot ekrani — toza va ishonchli ko'rinsin.

3. **`src/app/business/[slug]/book/page.tsx`** — bosqichma-bosqich wizard (Client Component, `useState` bilan step boshqaruvi):
   - **Step 1**: xizmat tanlash (`<ServiceCard>`)
   - **Step 2**: barber tanlash (resources ro'yxati, `<EmployeeCard>` yoki oddiy karta)
   - **Step 3**: sana tanlash (native `<input type="date">` yetarli, kutubxona shart emas)
   - **Step 4**: vaqt tanlash — `getAvailableSlots()` natijasini `<TimeSlotButton>` grid ko'rinishida chiqaring (band bo'lganlari `available=false`, chizilgan holatda)
   - **Step 5**: ism + telefon (React Hook Form + `createBookingSchema`)
   - **Step 6**: tasdiqlash sahifasi (xizmat, barber, sana, vaqt, narx xulosasi) + `[Tasdiqlash]` tugmasi
   - **Submit**: `supabase.rpc('book_appointment', {...})` chaqiring. Muvaffaqiyat bo'lsa "✅ Booking tasdiqlandi" ko'rsating (buning uchun `Check` Lucide iconi ishlating, emoji emas). **RPC hali javob bermaguncha "tasdiqlandi" deb hech qachon ko'rsatmang** (spec 20-bo'lim — bu eng qattiq qoida, imtihon shu yerda tekshiriladi).
   - **Xato bo'lsa** (ayniqsa `SLOT_TAKEN`): shu sahifada, xuddi shu step'da, tanlangan slot'ni qaytadan bo'sh joylar bilan yangilab, "Bu vaqt band qilindi, boshqasini tanlang" ko'rsating — mijozni butun wizard'ni qaytadan boshlashga majburlamang.
   - `<OnlineStatusBadge/>`'ni wizard yuqorisiga qo'ying; offline bo'lsa `[Tasdiqlash]` tugmasini disable qiling va sababini yozing.
   - Butun oqim mobil ekranda mukammal ishlashi kerak — bu spec bo'yicha **eng muhim mobil talab**.

## UI/dizayn talablari — bu wizard mobilda ham "premium" ko'rinishi kerak

- Faqat **Lucide React** iconlardan foydalaning (masalan step indikatorlar uchun `Check`, `Clock`, `Scissors`). Emoji/stiker ishlatmang.
- Har bir step orasida yumshoq o'tish (masalan progress bar yoki "1/6" ko'rsatkichi yuqorida), mijoz qayerda ekanini doim bilsin.
- Tugmalar mobil ekranda katta va bosish oson bo'lsin (`py-3` dan kam bo'lmasin), pastda "fixed" holda tursin agar wizard uzun bo'lsa.
- `<TimeSlotButton>` grid'i mobilda ham chiroyli qatorlansin (masalan `grid-cols-3` mobil, `grid-cols-4` desktop).
- Tasdiqlash (Step 6) xulosasi aniq, katta shriftda narx va vaqtni ko'rsatsin — mijoz nimani tasdiqlayotganini shubhasiz bilsin.
- Emerald accent + neytral fon, ortiqcha gradient yoki animatsiya qo'ymang.

## Qoidalar (aralashmaslik uchun)

- **`src/app/dashboard/*` ichiga tegmang** — bular Backend-1/Backend-2/Frontend-1'niki.
- `lib/booking/availability.ts` va `schema.sql`'dagi `book_appointment` RPC'ni o'zgartirish kerak bo'lsa (masalan yangi parametr), avval jamoaga ayting — bu umumiy fundament.

## Xatosiz tugatish uchun yakuniy tekshiruv

- [ ] `npm run typecheck` — xatosiz o'tadi
- [ ] To'liq wizard'ni boshidan oxirigacha bir marta o'zim sinab ko'rdim, booking haqiqatan ham yaratildi
- [ ] O'sha vaqtni ikkinchi marta band qilishga urinib ko'rdim — aniq "band qilindi" xabarini oldim, xom xato emas
- [ ] Wizard'ni telefon o'lchamidagi brauzer oynasida (yoki DevTools mobil rejimida) sinab ko'rdim, hech joyi kesilib qolmadi
- [ ] Offline holatni simulyatsiya qilib ko'rdim (DevTools → Network → Offline), tugma disable bo'ldi va tushunarli xabar chiqdi
- [ ] Bo'sh vaqt bo'lmagan kun/barber tanlanganda tushunarli bo'sh holat ko'rsatildi (crash emas)
