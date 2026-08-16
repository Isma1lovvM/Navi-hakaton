// OWNER: Frontend-2 (baza tayyor — kengaytiring)
import { BusinessSearch } from "@/components/business/business-search";
import { searchBusinesses } from "@/lib/actions/public-search";

export default async function LandingPage() {
  const businesses = await searchBusinesses();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-accent-700">BizFlow</h1>
      <p className="mt-2 mb-8 text-slate-600">
        Mahalladagi biznesingizni boshqarish endi bitta joyda.
      </p>
      <BusinessSearch businesses={businesses} />
    </main>
  );
}
