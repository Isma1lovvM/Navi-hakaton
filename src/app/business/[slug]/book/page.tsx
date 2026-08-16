// OWNER: Frontend-2 (baza tayyor — sayqallashtiring, animatsiya qo'shing)
import { notFound } from "next/navigation";
import { getPublicBusiness } from "@/lib/actions/public-booking";
import { BookingWizard } from "@/components/booking/booking-wizard";

export default async function BookAppointmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bundle = await getPublicBusiness(slug);

  if (!bundle) notFound();

  return (
    <main className="mx-auto max-w-lg p-4">
      <h1 className="mb-4 text-lg font-semibold text-slate-900">{bundle.business.name} — booking</h1>
      <BookingWizard
        businessId={bundle.business.id}
        businessName={bundle.business.name}
        timezone={bundle.business.timezone}
        services={bundle.services}
        resources={bundle.resources}
      />
    </main>
  );
}
