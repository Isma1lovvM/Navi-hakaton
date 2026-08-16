// OWNER: Frontend-2 (baza tayyor — kengaytiring)
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, Scissors } from "lucide-react";
import { getPublicBusiness } from "@/lib/actions/public-booking";
import { ServiceCard } from "@/components/business/service-card";

const DAY_LABELS = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];

export default async function BusinessPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = await getPublicBusiness(slug);

  if (!bundle) notFound();

  const { business, services, businessHours } = bundle;
  const todayHours = businessHours.find((h) => h.day_of_week === new Date().getDay());

  return (
    <main className="mx-auto max-w-lg p-4 pb-24">
      <div className="rounded-card border border-border bg-surface p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{business.name}</h1>
        {business.description ? <p className="mt-1 text-sm text-slate-500">{business.description}</p> : null}
        <div className="mt-3 space-y-1.5 text-sm text-slate-600">
          {business.address ? (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" /> {business.address}
            </p>
          ) : null}
          <p className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            {todayHours?.is_closed
              ? "Bugun yopiq"
              : `Bugun: ${todayHours?.open_time?.slice(0, 5)} — ${todayHours?.close_time?.slice(0, 5)}`}
          </p>
        </div>
        <Link
          href={`/business/${slug}/book`}
          className="mt-5 block w-full rounded-md bg-accent-600 py-3 text-center text-sm font-semibold text-white hover:bg-accent-700"
        >
          Booking qilish
        </Link>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Scissors className="h-4 w-4" /> Xizmatlar
        </h2>
        <div className="space-y-2">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
        {DAY_LABELS.map((label, i) => {
          const h = businessHours.find((bh) => bh.day_of_week === i);
          return (
            <div key={i} className="rounded-md border border-border py-2">
              <p className="font-medium">{label}</p>
              <p className={h?.is_closed ? "text-slate-300" : "text-slate-500"}>
                {h?.is_closed ? "—" : h?.open_time?.slice(0, 5)}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
